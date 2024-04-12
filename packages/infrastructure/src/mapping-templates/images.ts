import { Context, DynamoDBQueryRequest } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { Restaurant } from '../types/gql';

export const request = (
  ctx: Context<undefined, Restaurant>,
): DynamoDBQueryRequest => {
  const { id } = ctx.source;

  return ddb.query({
    query: {
      id: {
        eq: id,
      },
      kind: {
        beginsWith: 'image',
      },
    },
  });
};

export const response = (
  ctx: Context<never, never, never, never, { items: { fileName: string }[] }>,
): Restaurant['images'] => ctx.result?.items.map((item) => item.fileName) || [];
