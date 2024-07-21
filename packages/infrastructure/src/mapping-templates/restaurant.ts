import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBQueryRequest,
  util,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { Query, QueryRestaurantArgs, Restaurant } from '../types/gql';

export const request = (
  ctx: Context<QueryRestaurantArgs>,
): DynamoDBQueryRequest => {
  return ddb.query({
    query: {
      id: {
        eq: ctx.args.id,
      },
      kind: {
        beginsWith: 'restaurant',
      },
    },
  });
};

export const response = (
  ctx: Context<
    QueryRestaurantArgs,
    never,
    never,
    never,
    { items: Restaurant[] }
  >,
): Query['restaurant'] => {
  const restaurants = ctx.result.items;
  const { groups } = ctx.identity as AppSyncIdentityCognito;

  if (
    restaurants.filter((restaurant) => groups?.includes(restaurant.group))
      .length === 0
  ) {
    util.error('operation not allowed');
  }

  return restaurants[0];
};
