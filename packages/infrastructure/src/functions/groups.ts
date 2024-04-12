import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda';
import { QueryGroupsArgs } from '../types/gql';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: AppSyncResolverEvent<QueryGroupsArgs>) => {
  const { ids } = event.arguments;

  const command = new BatchGetCommand({
    RequestItems: {
      [process.env.TABLE_NAME!]: {
        Keys: ids.map((id) => ({
          id,
          kind: 'group',
        })),
      },
    },
  });

  const result = await docClient.send(command);

  return result.Responses ? result.Responses[process.env.TABLE_NAME!] : [];
};
