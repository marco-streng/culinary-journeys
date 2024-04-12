import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBPutItemRequest,
  util,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type {
  Mutation,
  MutationCreateRestaurantArgs,
  Restaurant,
} from '../types/gql';

export const request = (
  ctx: Context<MutationCreateRestaurantArgs>,
): DynamoDBPutItemRequest => {
  const { input } = ctx.args;
  const { groups, sub } = ctx.identity as AppSyncIdentityCognito;

  if (!groups?.includes(input.group)) {
    util.error('operation not allowed');
  }

  const { google_place_id, googlePlaceId, ...inputArgs } = input;
  const placeId = googlePlaceId ?? google_place_id;

  const id = util.autoId();
  return ddb.put({
    key: {
      id,
      kind: `restaurant_${inputArgs.group}`,
    },
    item: {
      ...inputArgs,
      id,
      kind: `restaurant_${inputArgs.group}`,
      googlePlaceId: placeId,
      google_place_id: placeId,
      createdBy: sub,
      createdAt: util.time.nowISO8601(),
    },
  });
};

export const response = (
  ctx: Context<MutationCreateRestaurantArgs, never, never, never, Restaurant>,
): Mutation['createRestaurant'] => ctx.result;
