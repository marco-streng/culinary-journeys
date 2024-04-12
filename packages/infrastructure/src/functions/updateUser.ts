import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent, Context } from 'aws-lambda';
import type { MutationUpdateUserArgs } from '../types/gql';
import { restrictAdminAccess } from './utils';

const logger = new Logger({ serviceName: 'updateUser' });

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (
  event: AppSyncResolverEvent<MutationUpdateUserArgs>,
  context: Context,
) => {
  logger.addContext(context);

  restrictAdminAccess(event.identity as AppSyncIdentityCognito);

  const { id, addGroupIds } = event.arguments.input;

  // Get user from DynamoDB
  const getCommand = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      id,
      kind: 'user',
    },
  });
  const user = await dynamoDbDocClient.send(getCommand);
  if (!user.Item) {
    throw new Error('Could not get user.');
  }

  const { name, groupIds } = user.Item;
  let resultGroupIds = groupIds ?? [];

  if (addGroupIds && addGroupIds.length > 0) {
    // Add user to groups in Cognito
    await Promise.all(
      addGroupIds?.map(async (groupId) => {
        const addUserToGroupCommand = new AdminAddUserToGroupCommand({
          UserPoolId: process.env.USER_POOL_ID,
          GroupName: groupId,
          Username: name,
        });

        return await cognitoClient.send(addUserToGroupCommand);
      }),
    );

    // Add groupIds to DynamoDB
    const updateCommand = new UpdateCommand({
      Key: {
        id,
        kind: 'user',
      },
      TableName: process.env.TABLE_NAME,
      UpdateExpression:
        'SET groupIds = list_append(if_not_exists(groupIds, :empty_list), :addGroupIds)',
      ExpressionAttributeValues: {
        ':addGroupIds': addGroupIds,
        ':empty_list': [],
      },
      ReturnValues: ReturnValue.ALL_NEW,
    });
    const updateCommandResult = await dynamoDbDocClient.send(updateCommand);

    resultGroupIds = updateCommandResult.Attributes?.['groupIds'] ?? [];
  }

  return {
    ...user.Item,
    groupIds: resultGroupIds,
  };
};
