import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { fetcher } from '../lib/index';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  AWSDate: { input: string; output: string };
  AWSEmail: { input: any; output: any };
};

export type CreateDateInput = {
  date: Scalars['AWSDate']['input'];
};

export type CreateGroupInput = {
  name: Scalars['String']['input'];
};

export type CreateImagesInput = {
  fileNames: Array<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type CreateRatingInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  value: Scalars['Int']['input'];
};

export type CreateRestaurantInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  googlePlaceId: Scalars['String']['input'];
  /** @deprecated Use googlePlaceId field */
  google_place_id?: InputMaybe<Scalars['String']['input']>;
  group: Scalars['String']['input'];
  name: Scalars['String']['input'];
  position?: InputMaybe<PositionInput>;
  visits?: InputMaybe<Array<InputMaybe<Scalars['AWSDate']['input']>>>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUploadUrlsInput = {
  files: Array<FileInput>;
};

export type CreateUserInput = {
  email: Scalars['AWSEmail']['input'];
  groupIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  name: Scalars['String']['input'];
};

export type FileInput = {
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type Group = {
  __typename?: 'Group';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createDate: Scalars['AWSDate']['output'];
  createGroup: Group;
  createImages: Array<Maybe<Scalars['String']['output']>>;
  createRating: Rating;
  createRestaurant: Restaurant;
  createUploadUrls: Array<UploadUrl>;
  createUser: User;
  deleteRestaurant: Restaurant;
  updateRestaurant: Restaurant;
  updateUser: User;
};

export type MutationCreateDateArgs = {
  input: CreateDateInput;
};

export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};

export type MutationCreateImagesArgs = {
  input: CreateImagesInput;
};

export type MutationCreateRatingArgs = {
  input: CreateRatingInput;
};

export type MutationCreateRestaurantArgs = {
  input: CreateRestaurantInput;
};

export type MutationCreateUploadUrlsArgs = {
  input: CreateUploadUrlsInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteRestaurantArgs = {
  input: Scalars['ID']['input'];
};

export type MutationUpdateRestaurantArgs = {
  input: UpdateRestaurantInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type Position = {
  __typename?: 'Position';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type PositionInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  dates: Array<Scalars['AWSDate']['output']>;
  groups: Array<Group>;
  restaurant: Restaurant;
  restaurants: Array<Restaurant>;
  user: User;
};

export type QueryDatesArgs = {
  from: Scalars['AWSDate']['input'];
};

export type QueryGroupsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type QueryRestaurantArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRestaurantsArgs = {
  group: Scalars['String']['input'];
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type Rating = {
  __typename?: 'Rating';
  comment?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
  userName: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type Restaurant = {
  __typename?: 'Restaurant';
  address?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<User>;
  googlePlaceId: Scalars['String']['output'];
  /** @deprecated Use googlePlaceId field */
  google_place_id?: Maybe<Scalars['String']['output']>;
  group: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  position: Position;
  ratings: Array<Rating>;
  visits?: Maybe<Array<Scalars['AWSDate']['output']>>;
  website?: Maybe<Scalars['String']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  createdRating?: Maybe<Rating>;
};

export type UpdateRestaurantInput = {
  createVisits?: InputMaybe<Array<Scalars['AWSDate']['input']>>;
  group: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type UpdateUserInput = {
  addGroupIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  id: Scalars['ID']['input'];
};

export type UploadUrl = {
  __typename?: 'UploadUrl';
  fileName: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  groups?: Maybe<Array<Group>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CreateUploadUrlsMutationVariables = Exact<{
  input: CreateUploadUrlsInput;
}>;

export type CreateUploadUrlsMutation = {
  __typename?: 'Mutation';
  createUploadUrls: Array<{
    __typename?: 'UploadUrl';
    fileName: string;
    url: string;
  }>;
};

export type GroupsQueryVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;

export type GroupsQuery = {
  __typename?: 'Query';
  groups: Array<{ __typename?: 'Group'; id: string; name: string }>;
};

export type RestaurantQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RestaurantQuery = {
  __typename?: 'Query';
  restaurant: {
    __typename?: 'Restaurant';
    visits?: Array<string> | null;
    googlePlaceId: string;
    id: string;
    name: string;
    address?: string | null;
    website?: string | null;
    images?: Array<string> | null;
    position: { __typename?: 'Position'; lat: number; lng: number };
    ratings: Array<{
      __typename?: 'Rating';
      value: number;
      userId: string;
      userName: string;
      comment?: string | null;
    }>;
    createdBy?: { __typename?: 'User'; name: string } | null;
  };
};

export type RestaurantsQueryVariables = Exact<{
  from: Scalars['AWSDate']['input'];
  group: Scalars['String']['input'];
  groups: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;

export type RestaurantsQuery = {
  __typename?: 'Query';
  dates: Array<string>;
  restaurants: Array<{
    __typename?: 'Restaurant';
    visits?: Array<string> | null;
    id: string;
    name: string;
    address?: string | null;
    position: { __typename?: 'Position'; lat: number; lng: number };
    ratings: Array<{ __typename?: 'Rating'; userId: string; value: number }>;
  }>;
  groups: Array<{ __typename?: 'Group'; id: string; name: string }>;
};

export type CreateRestaurantMutationVariables = Exact<{
  input: CreateRestaurantInput;
}>;

export type CreateRestaurantMutation = {
  __typename?: 'Mutation';
  createRestaurant: {
    __typename?: 'Restaurant';
    visits?: Array<string> | null;
    id: string;
    name: string;
    address?: string | null;
    position: { __typename?: 'Position'; lat: number; lng: number };
    ratings: Array<{ __typename?: 'Rating'; value: number }>;
  };
};

export type CreateRatingMutationVariables = Exact<{
  input: CreateRatingInput;
}>;

export type CreateRatingMutation = {
  __typename?: 'Mutation';
  createRating: {
    __typename?: 'Rating';
    id: string;
    userId: string;
    value: number;
    userName: string;
    comment?: string | null;
  };
};

export type UpdateRestaurantMutationVariables = Exact<{
  input: UpdateRestaurantInput;
}>;

export type UpdateRestaurantMutation = {
  __typename?: 'Mutation';
  updateRestaurant: {
    __typename?: 'Restaurant';
    id: string;
    visits?: Array<string> | null;
  };
};

export type CreateImagesMutationVariables = Exact<{
  input: CreateImagesInput;
}>;

export type CreateImagesMutation = {
  __typename?: 'Mutation';
  createImages: Array<string | null>;
};

export type SubscribeRatingsSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type SubscribeRatingsSubscription = {
  __typename?: 'Subscription';
  createdRating?: {
    __typename?: 'Rating';
    id: string;
    userId: string;
    value: number;
    userName: string;
  } | null;
};

export const CreateUploadUrlsDocument = `
    mutation createUploadUrls($input: CreateUploadUrlsInput!) {
  createUploadUrls(input: $input) {
    fileName
    url
  }
}
    `;

export const useCreateUploadUrlsMutation = <
  TError = unknown,
  TContext = unknown,
>(
  options?: UseMutationOptions<
    CreateUploadUrlsMutation,
    TError,
    CreateUploadUrlsMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    CreateUploadUrlsMutation,
    TError,
    CreateUploadUrlsMutationVariables,
    TContext
  >(
    ['createUploadUrls'],
    (variables?: CreateUploadUrlsMutationVariables) =>
      fetcher<CreateUploadUrlsMutation, CreateUploadUrlsMutationVariables>(
        CreateUploadUrlsDocument,
        variables,
      )(),
    options,
  );
};

export const GroupsDocument = `
    query groups($ids: [ID!]!) {
  groups(ids: $ids) {
    id
    name
  }
}
    `;

export const useGroupsQuery = <TData = GroupsQuery, TError = unknown>(
  variables: GroupsQueryVariables,
  options?: UseQueryOptions<GroupsQuery, TError, TData>,
) => {
  return useQuery<GroupsQuery, TError, TData>(
    ['groups', variables],
    fetcher<GroupsQuery, GroupsQueryVariables>(GroupsDocument, variables),
    options,
  );
};

useGroupsQuery.getKey = (variables: GroupsQueryVariables) => [
  'groups',
  variables,
];

export const RestaurantDocument = `
    query restaurant($id: ID!) {
  restaurant(id: $id) {
    visits
    googlePlaceId
    id
    name
    address
    website
    position {
      lat
      lng
    }
    ratings {
      value
      userId
      userName
      comment
    }
    images
    createdBy {
      name
    }
  }
}
    `;

export const useRestaurantQuery = <TData = RestaurantQuery, TError = unknown>(
  variables: RestaurantQueryVariables,
  options?: UseQueryOptions<RestaurantQuery, TError, TData>,
) => {
  return useQuery<RestaurantQuery, TError, TData>(
    ['restaurant', variables],
    fetcher<RestaurantQuery, RestaurantQueryVariables>(
      RestaurantDocument,
      variables,
    ),
    options,
  );
};

useRestaurantQuery.getKey = (variables: RestaurantQueryVariables) => [
  'restaurant',
  variables,
];

export const RestaurantsDocument = `
    query restaurants($from: AWSDate!, $group: String!, $groups: [ID!]!) {
  restaurants(group: $group) {
    visits
    id
    name
    address
    position {
      lat
      lng
    }
    ratings {
      userId
      value
      userId
    }
  }
  dates(from: $from)
  groups(ids: $groups) {
    id
    name
  }
}
    `;

export const useRestaurantsQuery = <TData = RestaurantsQuery, TError = unknown>(
  variables: RestaurantsQueryVariables,
  options?: UseQueryOptions<RestaurantsQuery, TError, TData>,
) => {
  return useQuery<RestaurantsQuery, TError, TData>(
    ['restaurants', variables],
    fetcher<RestaurantsQuery, RestaurantsQueryVariables>(
      RestaurantsDocument,
      variables,
    ),
    options,
  );
};

useRestaurantsQuery.getKey = (variables: RestaurantsQueryVariables) => [
  'restaurants',
  variables,
];

export const CreateRestaurantDocument = `
    mutation createRestaurant($input: CreateRestaurantInput!) {
  createRestaurant(input: $input) {
    visits
    id
    name
    address
    position {
      lat
      lng
    }
    ratings {
      value
    }
  }
}
    `;

export const useCreateRestaurantMutation = <
  TError = unknown,
  TContext = unknown,
>(
  options?: UseMutationOptions<
    CreateRestaurantMutation,
    TError,
    CreateRestaurantMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    CreateRestaurantMutation,
    TError,
    CreateRestaurantMutationVariables,
    TContext
  >(
    ['createRestaurant'],
    (variables?: CreateRestaurantMutationVariables) =>
      fetcher<CreateRestaurantMutation, CreateRestaurantMutationVariables>(
        CreateRestaurantDocument,
        variables,
      )(),
    options,
  );
};

export const CreateRatingDocument = `
    mutation createRating($input: CreateRatingInput!) {
  createRating(input: $input) {
    id
    userId
    value
    userName
    comment
  }
}
    `;

export const useCreateRatingMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    CreateRatingMutation,
    TError,
    CreateRatingMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    CreateRatingMutation,
    TError,
    CreateRatingMutationVariables,
    TContext
  >(
    ['createRating'],
    (variables?: CreateRatingMutationVariables) =>
      fetcher<CreateRatingMutation, CreateRatingMutationVariables>(
        CreateRatingDocument,
        variables,
      )(),
    options,
  );
};

export const UpdateRestaurantDocument = `
    mutation updateRestaurant($input: UpdateRestaurantInput!) {
  updateRestaurant(input: $input) {
    id
    visits
  }
}
    `;

export const useUpdateRestaurantMutation = <
  TError = unknown,
  TContext = unknown,
>(
  options?: UseMutationOptions<
    UpdateRestaurantMutation,
    TError,
    UpdateRestaurantMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    UpdateRestaurantMutation,
    TError,
    UpdateRestaurantMutationVariables,
    TContext
  >(
    ['updateRestaurant'],
    (variables?: UpdateRestaurantMutationVariables) =>
      fetcher<UpdateRestaurantMutation, UpdateRestaurantMutationVariables>(
        UpdateRestaurantDocument,
        variables,
      )(),
    options,
  );
};

export const CreateImagesDocument = `
    mutation createImages($input: CreateImagesInput!) {
  createImages(input: $input)
}
    `;

export const useCreateImagesMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    CreateImagesMutation,
    TError,
    CreateImagesMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    CreateImagesMutation,
    TError,
    CreateImagesMutationVariables,
    TContext
  >(
    ['createImages'],
    (variables?: CreateImagesMutationVariables) =>
      fetcher<CreateImagesMutation, CreateImagesMutationVariables>(
        CreateImagesDocument,
        variables,
      )(),
    options,
  );
};

export const SubscribeRatingsDocument = `
    subscription subscribeRatings {
  createdRating {
    id
    userId
    value
    userName
  }
}
    `;
