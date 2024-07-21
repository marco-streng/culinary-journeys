import { useMatch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useRestaurantQuery } from '../types/gql';
import { CloseRoutedModalButton } from './CloseRoutedModalButton';
import { Loader } from './Loader';
import { RestaurantDetails } from './RestaurantDetails';

export const Details = () => {
  const id = useMatch({
    from: '/restaurant/$id/',
    select: (match) => match.params.id,
  });

  const { t } = useTranslation();
  const { isLoading, data: restaurant } = useRestaurantQuery(
    {
      id,
    },
    {
      select: (data) => data.restaurant,
    },
  );

  return (
    <>
      <div className="p-5">
        {isLoading ? (
          <Loader full={false} />
        ) : restaurant ? (
          <RestaurantDetails restaurant={restaurant} />
        ) : (
          <>{t('notFound')}</>
        )}
      </div>
      <div className="bg-gray-50 px-4 py-3">
        <CloseRoutedModalButton />
      </div>
    </>
  );
};
