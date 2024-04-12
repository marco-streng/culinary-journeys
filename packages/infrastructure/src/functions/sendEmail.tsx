import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { SES, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  NewRating,
  NewRestaurant,
  translations,
} from '@culinary-journeys/transactional';
import { render } from '@react-email/render';
import { DynamoDBStreamEvent } from 'aws-lambda';

const ses = new SES({});
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

type Restaurant = {
  name: {
    S: string;
  };
  address: {
    S: string;
  };
};

type Rating = {
  userName: {
    S: string;
  };
  value: {
    N: string;
  };
};

export const handler = async (event: DynamoDBStreamEvent) => {
  const ops = event.Records.filter((record) => {
    const { eventName, dynamodb } = record;
    const kind = dynamodb?.Keys?.kind.S;

    return (
      eventName === 'INSERT' &&
      (kind?.includes('restaurant_') || kind?.includes('rating_'))
    );
  }).map(async (record) => {
    const { dynamodb } = record;
    if (!dynamodb) {
      throw Error('No item existing');
    }
    const id = dynamodb.Keys?.id;

    if (!id) {
      throw Error('No id existing');
    }

    const kind = dynamodb.Keys?.kind.S || '';
    const image = dynamodb.NewImage;

    switch (kind.split('_')[0]) {
      case 'restaurant': {
        const { name, address } = image as Restaurant;

        const emailData = render(
          <NewRestaurant
            data={{
              restaurant: {
                name: name.S,
                address: address.S,
              },
            }}
          />,
        );

        return await sendEmail(
          translations.de.newRestaurant.subject,
          emailData,
        );
      }

      case 'rating': {
        const queryCommand = new QueryCommand({
          TableName: process.env.TABLE_NAME,
          KeyConditions: {
            id: {
              ComparisonOperator: 'EQ',
              AttributeValueList: [id as AttributeValue],
            },
            kind: {
              ComparisonOperator: 'BEGINS_WITH',
              AttributeValueList: [{ S: 'restaurant_' }],
            },
          },
        });

        const result = await docClient.send(queryCommand);
        const item = result.Items?.[0] as Restaurant;
        const { value, userName } = image as Rating;

        const emailData = render(
          <NewRating
            data={{
              restaurant: {
                name: item.name.S,
              },
              rating: parseInt(value.N),
              user: {
                name: userName.S,
              },
            }}
          />,
        );

        return await sendEmail(translations.de.newRating.subject, emailData);
      }

      default:
        break;
    }
  });

  await Promise.all(ops);
};

const sendEmail = async (subject: string, html: string) => {
  const eParams = {
    Destination: {
      ToAddresses: [process.env.EMAIL!],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: process.env.EMAIL!,
  };
  try {
    await ses.send(new SendEmailCommand(eParams));
  } catch (err) {
    console.log(err);
  }
};
