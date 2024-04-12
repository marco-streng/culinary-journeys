import { Context, DynamoDBQueryRequest } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { Rating, Restaurant } from '../types/gql';

export const request = (
  ctx: Context<never, never, Restaurant>,
): DynamoDBQueryRequest => {
  const { id } = ctx.source;

  return ddb.query({
    query: {
      id: {
        eq: id,
      },
      kind: {
        beginsWith: 'rating',
      },
    },
  });
};

export const response = (
  ctx: Context<never, never, never, never, { items?: Rating[] }>,
): Restaurant['ratings'] => ctx.result?.items ?? [];
