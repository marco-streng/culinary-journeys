import { gql } from 'graphql-request';

export const createUploadUrlsMutation = gql`
  mutation createUploadUrls($input: CreateUploadUrlsInput!) {
    createUploadUrls(input: $input) {
      fileName
      url
    }
  }
`;

export const groupsQuery = gql`
  query groups($ids: [ID!]!) {
    groups(ids: $ids) {
      id
      name
    }
  }
`;

export const restaurantQuery = gql`
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

export const restaurantsQuery = gql`
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
        value
      }
    }
    dates(from: $from)
    groups(ids: $groups) {
      id
      name
    }
  }
`;

export const createRestaurantMutation = gql`
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

export const createRating = gql`
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

export const updateRestaurant = gql`
  mutation updateRestaurant($input: UpdateRestaurantInput!) {
    updateRestaurant(input: $input) {
      id
      visits
    }
  }
`;

export const createImages = gql`
  mutation createImages($input: CreateImagesInput!) {
    createImages(input: $input)
  }
`;

export const subscribeRatings = gql`
  subscription subscribeRatings {
    createdRating {
      id
      userId
      value
      userName
    }
  }
`;
