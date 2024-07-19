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
