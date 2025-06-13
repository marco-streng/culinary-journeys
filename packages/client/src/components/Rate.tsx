import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useMatch, useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { AiFillStar } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'usehooks-ts';
import { getActiveGroupForUser } from '../lib';
import { useUserStore } from '../state/user';
import {
  useCreateRatingMutation,
  useRestaurantQuery,
  useRestaurantsQuery,
} from '../types/gql';
import { Button } from './Button';
import { CloseRoutedModalButton } from './CloseRoutedModalButton';
import { Errors } from './Errors';
import { Label } from './Label';
import { Loader } from './Loader';
import { Textarea } from './Textarea';

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
});

export const Rate = () => {
  const id = useMatch({
    from: '/restaurant/$id/rate',
    select: (match) => match.params.id,
  });

  const { t } = useTranslation();
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

  const { mutateAsync: createRating, isLoading: isRating } =
    useCreateRatingMutation();

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

  const rateform = useAppForm({
    defaultValues: {
      rating: 0,
      comment: '',
    },
    onSubmit: (data) => {
      {
        const { rating, comment } = data.value;

        createRating(
          {
            input: {
              id,
              value: rating,
              comment,
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

              toast.success(t('restaurantRated'), {
                icon: () => '✅',
                position: 'bottom-right',
                autoClose: 2500,
              });

              navigate({ to: '/' });
            },
          },
        );
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        rateform.handleSubmit();
      }}
    >
      <div className="p-5">
        {isLoading || isRating ? (
          <Loader full={false} />
        ) : (
          <>
            <h2 className="mb-8 text-xl font-bold">
              {restaurant?.name}
              {` `}
              {t('rate')}
            </h2>

            <div className="mb-8 flex flex-row">
              <div className="basis-1/4">
                <Label>{t('stars')}</Label>
              </div>
              <div className="ci-rating basis-3/4">
                <rateform.Field
                  name="rating"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) {
                        return t('missingRateValue');
                      }

                      return undefined;
                    },
                  }}
                  children={(field) => (
                    <>
                      {Array.from({ length: 5 }).map((_, nr) => (
                        <AiFillStar
                          size={55}
                          className={`ci-rating_star ${
                            (field.state.value ?? 0) >= nr + 1 &&
                            'ci-rating_star--active'
                          }`}
                          role="radio"
                          aria-checked={field.state.value === nr + 1}
                          aria-label={`${nr + 1}`}
                          onClick={() => field.handleChange(nr + 1)}
                        />
                      ))}
                      <Errors messages={field.state.meta.errors} />
                    </>
                  )}
                />
              </div>
            </div>

            <div className="mb-8 flex flex-row">
              <div className="basis-1/4">
                <Label htmlFor="comment">{t('comment')}</Label>
              </div>
              <div className="basis-3/4">
                <rateform.Field
                  name="comment"
                  children={(field) => (
                    <Textarea
                      id="comment"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-50 px-4 py-3">
        <div className="flex flex-row">
          <div className="grow">
            <CloseRoutedModalButton />
          </div>
          <div>
            <Button type="submit" className="mr-2">
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
