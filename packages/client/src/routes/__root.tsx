import { useQueryClient } from '@tanstack/react-query';
import { createRootRoute } from '@tanstack/react-router';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import dayjs from 'dayjs';
import { lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { useLocalStorage } from 'usehooks-ts';
import '../App.css';
import { Loader, Map, SignIn } from '../components';
import { API_KEY } from '../config';
import '../config/i18n';
import { NotificationPayload } from '../hooks';
import '../index.css';
import { getActiveGroupForUser, getUserGroups } from '../lib';
import { useUserStore } from '../state/user';
import { RestaurantsQuery, useRestaurantsQuery } from '../types/gql';

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

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
      role="alert"
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
  const [activeGroupStore, setActiveGroupStore] = useLocalStorage<
    Record<string, string> | undefined
  >('activeGroup', undefined);

  const { groups, authorized, setGroups, setAuthorized } = useUserStore(
    (state) => state,
  );

  const activeGroup = getActiveGroupForUser({
    authorized,
    activeGroupStore,
  });

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
        group: activeGroup,
        groups: groups || [],
      },
      { enabled: !!authorized && activeGroup.length > 0 },
    );

  const queryClient = useQueryClient({});

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
        group: activeGroup,
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
        setAuthorized(undefined);
        setGroups([]);
        setIsLoading(false);
      }
    };

    getUser();

    const cancelToken = Hub.listen('auth', (info) => {
      if (info.payload.event === 'signedOut') {
        setAuthorized(undefined);
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

          setAuthorized(user ?? undefined);
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
          group: activeGroup,
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
        restaurants={restaurantsData.restaurants}
        dates={restaurantsData.dates}
      />
      <ToastContainer />
      <TanStackRouterDevtools />
    </APIProvider>
  );
};

export const Route = createRootRoute({
  component: App,
});
