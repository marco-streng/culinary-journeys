import { Context, DynamoDBPutItemRequest } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { Mutation, MutationCreateDateArgs } from '../types/gql';

export const request = (
  ctx: Context<MutationCreateDateArgs>,
): DynamoDBPutItemRequest => {
  const { date } = ctx.args.input;

  return ddb.put({
    key: {
      id: 'date',
      kind: `date_${date}`,
    },
    item: {
      id: 'date',
      kind: `date_${date}`,
      date,
    },
  });
};

export const response = (
  ctx: Context<MutationCreateDateArgs, never, never, never, { date: string }>,
): Mutation['createDate'] => ctx.result.date;
