import { useQueryClient } from '@tanstack/react-query';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Amplify } from 'aws-amplify';
import { AuthUser, getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { useLocalStorage } from 'usehooks-ts';
import './App.css';
import { Loader, Map, SignIn } from './components';
import { API_KEY } from './config';
import './config/i18n';
import { NotificationPayload } from './hooks';
import { getUserGroups } from './lib';
import {
  RestaurantsQuery,
  useCreateRatingMutation,
  useCreateRestaurantMutation,
  useRestaurantsQuery,
  useUpdateRestaurantMutation,
} from './types/gql';

type Restaurant = RestaurantsQuery['restaurants'][0];

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID,
    },
  },
});

const today = dayjs().format('YYYY-MM-DD');

const ToastMessage = ({
  userName,
  value,
  restaurant,
  onOpenDetails,
}: {
  userName: string;
  value: number;
  restaurant: RestaurantsQuery['restaurants'][0];
  onOpenDetails: (restaurant: Restaurant) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        onOpenDetails(restaurant);
      }}
    >
      {t('rated', {
        userName,
        restaurantName: restaurant.name,
        rating: value,
      })}
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState<AuthUser | null>(null);
  const [activeGroupStore, setActiveGroupStore] = useLocalStorage<
    Record<string, string> | undefined
  >('activeGroup', undefined);
  const [groups, setGroups] = useState<string[] | null>();

  const getActiveGroupForUser = () => {
    const { userId } = authorized ?? {};
    if (!userId) return '';

    return activeGroupStore?.[userId] ?? '';
  };

  const isGroupValid = (activeGroup: string, groups: string[]) =>
    groups.includes(activeGroup);

  const setActiveGroupForUser = (userId: string, userGroups: string[]) => {
    setActiveGroupStore((activeGroup) => {
      if (activeGroup?.[userId]) {
        const storedUserGroup = activeGroup?.[userId];

        if (isGroupValid(storedUserGroup, userGroups)) {
          return activeGroup;
        }
      }

      return {
        ...activeGroup,
        [userId]: userGroups.length > 0 ? userGroups[0] : '',
      };
    });
  };

  const { isLoading: isLoadingRestaurants, data: restaurantsData } =
    useRestaurantsQuery(
      {
        from: today,
        group: getActiveGroupForUser(),
        groups: groups || [],
      },
      { enabled: !!authorized && getActiveGroupForUser().length > 0 },
    );

  const queryClient = useQueryClient({});
  const { mutateAsync: createRestaurant } = useCreateRestaurantMutation();
  const { mutateAsync: updateRestaurant } = useUpdateRestaurantMutation();
  const { mutateAsync: createRating } = useCreateRatingMutation();

  const notify = (
    message: NotificationPayload,
    openDetails: (restaurant: Restaurant) => void,
  ) => {
    if (message.userId === authorized?.userId) {
      return;
    }

    const cache = queryClient.getQueryData<RestaurantsQuery>(
      useRestaurantsQuery.getKey({
        from: today,
        group: getActiveGroupForUser(),
        groups: groups || [],
      }),
    );

    const restaurant = cache?.restaurants.find(
      (restaurant) => restaurant.id === message.id,
    );

    if (!restaurant) {
      return;
    }

    toast.info(
      <ToastMessage
        userName={message.userName}
        restaurant={restaurant}
        value={message.value}
        onOpenDetails={openDetails}
      />,
      {
        icon: () => '🚀',
        position: 'bottom-right',
      },
    );
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getCurrentUser();
        const groups = await getUserGroups();

        setActiveGroupForUser(user.userId, groups);
        setGroups(groups);
        setAuthorized(user);
        setIsLoading(false);
      } catch (error) {
        setAuthorized(null);
        setGroups(null);
        setIsLoading(false);
      }
    };

    getUser();

    const cancelToken = Hub.listen('auth', (info) => {
      if (info.payload.event === 'signedOut') {
        setAuthorized(null);
      }
    });
    return () => cancelToken();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!authorized) {
    return (
      <SignIn
        onAuthorize={async (user) => {
          if (user) {
            const groups = await getUserGroups();
            setActiveGroupForUser(user.userId, groups);
            setGroups(groups);
          }

          setAuthorized(user);
        }}
      />
    );
  }

  if (isLoadingRestaurants || !restaurantsData || !groups) {
    return <Loader />;
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        user={{
          id: authorized.userId,
          group: getActiveGroupForUser(),
          groups: groups,
          name: authorized.username,
        }}
        groups={restaurantsData.groups}
        onChangeGroup={(group) =>
          setActiveGroupStore((activeGroup) => ({
            ...activeGroup,
            [authorized.userId]: group,
          }))
        }
        onNotification={(message, openDetails) => notify(message, openDetails)}
        onCreate={(place) =>
          createRestaurant(
            {
              input: {
                group: getActiveGroupForUser(),
                name: place.name || 'n/a',
                googlePlaceId: place.place_id || '',
                address: place.formatted_address,
                website: place.website,
                position: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
              },
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(
                  useRestaurantsQuery.getKey({
                    group: getActiveGroupForUser(),
                    groups: groups || [],
                    from: today,
                  }),
                );
              },
            },
          )
        }
        onVisit={(id, date) =>
          updateRestaurant(
            {
              input: {
                id,
                group: getActiveGroupForUser(),
                createVisits: [date],
              },
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(
                  useRestaurantsQuery.getKey({
                    group: getActiveGroupForUser(),
                    groups: groups || [],
                    from: today,
                  }),
                );
              },
            },
          )
        }
        onRate={(id, { value, comment }) =>
          createRating(
            {
              input: {
                id,
                value,
                comment,
              },
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(
                  useRestaurantsQuery.getKey({
                    group: getActiveGroupForUser(),
                    groups: groups || [],
                    from: today,
                  }),
                );
              },
            },
          )
        }
        restaurants={restaurantsData.restaurants}
        dates={restaurantsData.dates}
      />
      <ToastContainer />
    </APIProvider>
  );
};

export default App;
