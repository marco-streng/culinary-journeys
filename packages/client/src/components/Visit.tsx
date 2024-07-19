import { useQueryClient } from '@tanstack/react-query';
import { useMatch, useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'usehooks-ts';
import { getActiveGroupForUser } from '../lib';
import { useUserStore } from '../state/user';
import {
  useRestaurantQuery,
  useRestaurantsQuery,
  useUpdateRestaurantMutation,
} from '../types/gql';
import { Button } from './Button';
import { CloseRoutedModalButton } from './CloseRoutedModalButton';
import { Input } from './Input';
import { Label } from './Label';
import { Loader } from './Loader';

export const Visit = () => {
  const id = useMatch({
    from: '/restaurant/$id/add-visit',
    select: (match) => match.params.id,
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isLoading, data: restaurant } = useRestaurantQuery(
    {
      id,
    },
    {
      select: (data) => data.restaurant,
    },
  );

  const { mutateAsync: updateRestaurant, isLoading: isUpdating } =
    useUpdateRestaurantMutation();

  const [activeGroupStore] = useLocalStorage<
    Record<string, string> | undefined
  >('activeGroup', undefined);

  const { groups, authorized } = useUserStore(({ groups, authorized }) => ({
    groups,
    authorized,
  }));
  const activeGroup = getActiveGroupForUser({
    authorized,
    activeGroupStore,
  });

  const { t } = useTranslation();
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dateInputRef.current?.focus();
  }, []);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (restaurant?.id) {
            updateRestaurant(
              {
                input: {
                  id,
                  group: activeGroup,
                  createVisits: [
                    dayjs(dateInputRef.current?.value).format('YYYY-MM-DD'),
                  ],
                },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries(
                    useRestaurantQuery.getKey({
                      id,
                    }),
                  );

                  queryClient.invalidateQueries(
                    useRestaurantsQuery.getKey({
                      group: activeGroup,
                      groups: groups,
                      from: dayjs().format('YYYY-MM-DD'),
                    }),
                  );

                  toast.success(t('restaurantVisited'), {
                    icon: () => '✅',
                    position: 'bottom-right',
                    autoClose: 2500,
                  });

                  navigate({ to: '/' });
                },
              },
            );
          }
        }}
      >
        <div className="p-5">
          {isLoading || isUpdating ? (
            <Loader full={false} />
          ) : (
            <>
              {' '}
              <h2 className="mb-8 text-xl font-bold">
                {restaurant?.name}
                {t('visit')}
              </h2>
              <Label htmlFor="date">{t('date')}</Label>
              <Input
                id="date"
                name="date"
                ref={dateInputRef}
                type="date"
                required
              />
            </>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-3">
          <div className="flex flex-row">
            <div className="grow">
              <CloseRoutedModalButton />
            </div>
            <div>
              <Button>{t('save')}</Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
