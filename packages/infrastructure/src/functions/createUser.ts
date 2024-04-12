import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda';
import { MutationCreateUserArgs } from '../types/gql';
import { restrictAdminAccess } from './utils';

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (
  event: AppSyncResolverEvent<MutationCreateUserArgs>,
) => {
  restrictAdminAccess(event.identity as AppSyncIdentityCognito);

  const { name, email, groupIds } = event.arguments.input;

  // Create user in Cognito
  const createUserCommand = new AdminCreateUserCommand({
    Username: name,
    UserPoolId: process.env.USER_POOL_ID,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
    ],
  });
  const user = await cognitoClient.send(createUserCommand);

  if (!user.User) {
    throw new Error('Could not create user');
  }
  const { Username, Attributes } = user.User;

  // Add user to Cognito groups
  if (groupIds && groupIds.length > 0) {
    await Promise.all(
      groupIds?.map(async (group) => {
        const addUserToGroupCommand = new AdminAddUserToGroupCommand({
          UserPoolId: process.env.USER_POOL_ID,
          GroupName: group,
          Username: user.User?.Username,
        });

        return await cognitoClient.send(addUserToGroupCommand);
      }),
    );
  }

  const sub = Attributes?.find((attribute) => attribute.Name === 'sub');
  if (!sub || !sub.Value) {
    throw new Error('Could not create user');
  }

  // Create user item in DynamoDB
  const putCommand = new PutCommand({
    Item: {
      id: sub.Value,
      kind: 'user',
      name: Username,
      email,
      groupIds,
    },
    TableName: process.env.TABLE_NAME,
  });
  await dynamoDbDocClient.send(putCommand);

  return {
    id: sub.Value,
    name: Username,
    email,
    groupIds,
  };
};
