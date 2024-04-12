import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBPutItemRequest,
  util,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { Mutation, MutationCreateRatingArgs, Rating } from '../types/gql';

export const request = (
  ctx: Context<MutationCreateRatingArgs>,
): DynamoDBPutItemRequest => {
  const { id, ...rest } = ctx.args.input;
  const { sub, username } = ctx.identity as AppSyncIdentityCognito;

  if (!sub || !username) {
    util.error('No identity provided.');
  }

  const kind = `rating_${util.autoId()}`;
  return ddb.put({
    key: {
      id,
      kind,
    },
    item: {
      ...rest,
      id,
      kind,
      userId: sub,
      userName: username,
      createdAt: util.time.nowISO8601(),
    },
  });
};

export const response = (
  ctx: Context<MutationCreateRatingArgs, never, never, never, Rating>,
): Mutation['createRating'] => ctx.result;
