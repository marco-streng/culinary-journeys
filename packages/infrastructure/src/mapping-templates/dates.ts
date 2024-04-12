import { Context, DynamoDBQueryRequest } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { QueryDatesArgs, Restaurant } from '../types/gql';

export const request = (ctx: Context<QueryDatesArgs>): DynamoDBQueryRequest => {
  const { from } = ctx.args;

  return ddb.query({
    query: {
      id: {
        eq: 'date',
      },
      kind: {
        eq: `date_${from}`,
      },
    },
  });
};

export const response = (
  ctx: Context<
    QueryDatesArgs,
    never,
    never,
    never,
    { items: { date: string }[] }
  >,
): Restaurant['visits'] => ctx.result?.items.map((item) => item.date) || [];
