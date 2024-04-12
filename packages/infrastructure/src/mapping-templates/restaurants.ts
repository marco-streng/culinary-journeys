import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBQueryRequest,
  util,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { Query, QueryRestaurantsArgs, Restaurant } from '../types/gql';

export const request = (
  ctx: Context<QueryRestaurantsArgs>,
): DynamoDBQueryRequest => {
  const { group } = ctx.args;
  const { groups } = ctx.identity as AppSyncIdentityCognito;

  if (!groups?.includes(group)) {
    util.error('operation not allowed');
  }

  return ddb.query({
    query: {
      kind: {
        eq: `restaurant_${group}`,
      },
    },
    index: 'kind',
  });
};

export const response = (
  ctx: Context<
    QueryRestaurantsArgs,
    never,
    never,
    never,
    { items: Restaurant[] }
  >,
): Query['restaurants'] => ctx.result.items;
