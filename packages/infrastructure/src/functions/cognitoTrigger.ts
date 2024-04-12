import { SES, SendEmailCommand } from '@aws-sdk/client-ses';
import { Handler, PreAuthenticationTriggerEvent } from 'aws-lambda';
const ses = new SES({});

export const handler: Handler<PreAuthenticationTriggerEvent> = async (
  event,
) => {
  if (
    event.request.userAttributes.email &&
    (event.request.userAttributes['cognito:user_status'] ?? '') ===
      'FORCE_CHANGE_PASSWORD'
  ) {
    await sendEmail(
      process.env.EMAIL!,
      `${event.userName} is in 'FORCE_CHANGE_PASSWORD' status.`,
    );
  }

  return event;
};

const sendEmail = async (to: string, body: string) => {
  const eParams = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: 'Admin Info',
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
