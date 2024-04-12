import { useEffect, useId, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {
  SubscribeRatingsDocument,
  SubscribeRatingsSubscription,
} from '../types/gql';
import { useToken } from './useToken';

export type NotificationPayload = NonNullable<
  SubscribeRatingsSubscription['createdRating']
>;

type Message = {
  payload?: {
    data?: {
      createdRating?: NotificationPayload;
    };
  };
};

export const useNotifications = () => {
  const token = useToken();
  const id = useId();

  const [message, setMessage] = useState<NotificationPayload | null>(null);

  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<Message>(
      import.meta.env.VITE_API_REALTIME_URI,
      {
        protocols: 'graphql-ws',
        queryParams: {
          header: btoa(
            JSON.stringify({
              Authorization: token,
              host: import.meta.env.VITE_API_HOST,
            }),
          ),
          payload: btoa(JSON.stringify({})),
        },
      },
      !!token,
    );

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        id,
        payload: {
          data: JSON.stringify({
            query: SubscribeRatingsDocument,
            variables: {},
          }),
          extensions: {
            authorization: {
              Authorization: token,
              host: import.meta.env.VITE_API_HOST,
            },
          },
        },
        type: 'start',
      });
    }
  }, [readyState]);

  useEffect(() => {
    return () => {
      if (readyState === ReadyState.OPEN) {
        sendJsonMessage({
          id,
          type: 'stop',
        });
      }
    };
  }, []);

  useEffect(() => {
    if (lastJsonMessage?.payload?.data?.createdRating) {
      setMessage(lastJsonMessage.payload.data.createdRating);
    }
  }, [lastJsonMessage]);

  return message;
};
