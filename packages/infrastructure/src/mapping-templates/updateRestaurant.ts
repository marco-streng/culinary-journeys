import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBUpdateItemRequest,
  util,
} from '@aws-appsync/utils';
import type {
  Mutation,
  MutationUpdateRestaurantArgs,
  Restaurant,
} from '../types/gql';

export const request = (
  ctx: Context<MutationUpdateRestaurantArgs>,
): DynamoDBUpdateItemRequest => {
  const { id, group, createVisits } = ctx.args.input;
  const { groups } = ctx.identity as AppSyncIdentityCognito;

  if (!groups?.includes(group)) {
    util.error('operation not allowed');
  }

  // Library 'utils/dynamodb' does not support 'if_not_exists' yet
  // return ddb.update({
  //   key: { id, kind: `restaurant_${group}` },
  //   update: {
  //     visits: ddb.operations.append(createVisits ?? []),
  //   },
  // });

  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ id, kind: `restaurant_${group}` }),
    update: {
      expression:
        'SET visits = list_append(if_not_exists(visits, :empty_list), :visit)',
      expressionValues: util.dynamodb.toMapValues({
        ':visit': createVisits,
        ':empty_list': [],
      }),
    },
  };
};

export const response = (
  ctx: Context<never, never, never, never, Restaurant>,
): Mutation['updateRestaurant'] => ctx.result;
