import { fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';
import { GraphQLClient } from 'graphql-request';
import { createUploadUrlsMutation } from '../gql';
import {
  CreateUploadUrlsMutation,
  CreateUploadUrlsMutationVariables,
} from '../types/gql';

// TODO: visualize upload process to user
// export type UploadProgress = {
//   [key: string]: number;
// };

export const getUserGroups = async () => {
  const { tokens } = (await fetchAuthSession()) ?? {};

  return (tokens?.accessToken.payload as Record<string, string[]>)[
    'cognito:groups'
  ];
};

export const getToken = async () => {
  try {
    const { idToken } = (await fetchAuthSession()).tokens ?? {};
    return idToken;
  } catch (error) {
    // ignore
  }
};

const graphQLClient = new GraphQLClient(import.meta.env.VITE_API_URI, {
  requestMiddleware: async (request) => {
    const token = await getToken();
    return {
      ...request,
      headers: {
        ...request.headers,
        authorization: token?.toString() || '',
      },
    };
  },
});

export const fetcher = <TData, TVariables extends { [key: string]: unknown }>(
  query: string,
  variables?: TVariables,
  requestHeaders?: RequestInit['headers'],
) => {
  return async (): Promise<TData> =>
    graphQLClient.request({
      document: query,
      variables,
      requestHeaders,
    });
};

export const uploader = async (files: File[]) => {
  const fetchLinks = async (files: File[]) => {
    const result = await fetcher<
      CreateUploadUrlsMutation,
      CreateUploadUrlsMutationVariables
    >(createUploadUrlsMutation, {
      input: {
        files: files.map((file) => ({
          name: file.name,
          type: file.type,
        })),
      },
    })();

    return result.createUploadUrls;
  };

  const links = await fetchLinks(files);

  if (links.length === 0) {
    throw new Error('No upload urls available');
  }

  // const progress: UploadProgress = {};

  const uploads = files.map(async (file, index) => {
    const { url } = links[index];

    try {
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
        // onUploadProgress: (progressEvent: {
        //   loaded: number;
        //   total: number;
        // }) => {
        //   progress[file.id] =
        //     (progressEvent.loaded / progressEvent.total) * 100;
        //   onProgress(progress);
        // },
      });
    } catch (error) {
      console.log({ error });
      // onFailure(file.file.name, error);
    }
  });

  await Promise.all(uploads);

  return links.map((link) => link.fileName);
};
