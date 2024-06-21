import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb';
import { SNSClient, SubscribeCommand } from '@aws-sdk/client-sns';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent, Context } from 'aws-lambda';
import { MutationCreateNotificationSubscriptionArgs } from '../types/gql';
import { restrictUserAccess } from './utils';

const snsCient = new SNSClient({});
const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);
const logger = new Logger({ serviceName: 'createNotificationSubscription' });

export const handler = async (
  event: AppSyncResolverEvent<MutationCreateNotificationSubscriptionArgs>,
  context: Context,
) => {
  logger.addContext(context);
  const {
    input: { userId, phoneNumber },
  } = event.arguments;

  restrictUserAccess(userId, event.identity as AppSyncIdentityCognito);

  // Subscribe at SNS
  const subscribeCommand = new SubscribeCommand({
    Protocol: 'sms',
    TopicArn: process.env.TOPIC_ARN,
    Endpoint: phoneNumber,
  });
  const subscribeCommandResult = await snsCient.send(subscribeCommand);
  const subscriptionId =
    subscribeCommandResult.SubscriptionArn?.split(':').at(-1);
  if (!subscriptionId) {
    throw new Error('Could not subscribe');
  }

  // Update user in DynamoDB
  const updateCommand = new UpdateCommand({
    Key: {
      id: userId,
      kind: 'user',
    },
    TableName: process.env.TABLE_NAME,
    UpdateExpression:
      'SET phoneNumber = :phoneNumber, isSubscribed = :isSubscribed, subscriptionId = :subscriptionId',
    ExpressionAttributeValues: {
      ':phoneNumber': phoneNumber,
      ':isSubscribed': true,
      ':subscriptionId': subscriptionId,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  });
  await dynamoDbDocClient.send(updateCommand);

  return {
    id: subscriptionId,
    userId,
    phoneNumber,
  };
};
