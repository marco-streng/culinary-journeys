import {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';
import { randomUUID } from 'node:crypto';
import type { MutationCreateGroupArgs } from '../types/gql';
import { restrictAdminAccess } from './utils';

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (
  event: AppSyncResolverEvent<MutationCreateGroupArgs>,
) => {
  restrictAdminAccess(event.identity as AppSyncIdentityCognito);

  const { name } = event.arguments.input;
  const id = randomUUID();

  // Create group in Cognito
  const createGroupCommand = new CreateGroupCommand({
    GroupName: id,
    Description: name,
    UserPoolId: process.env.USER_POOL_ID,
  });
  const group = await cognitoClient.send(createGroupCommand);

  if (!group.Group) {
    throw new Error('Could not create group');
  }

  // Create group item in DynamoDB
  const putCommand = new PutCommand({
    Item: {
      id,
      kind: 'group',
      name,
    },
    TableName: process.env.TABLE_NAME,
  });
  await dynamoDbDocClient.send(putCommand);

  return {
    id,
    name,
  };
};
