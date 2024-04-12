import { useTranslation } from 'react-i18next';
import { RestaurantsQuery } from '../types/gql';
import { Button, ButtonVariant } from './Button';
import { RestaurantDetails } from './RestaurantDetails';

export const Details = ({
  restaurant,
  user,
  onClose,
}: {
  restaurant: RestaurantsQuery['restaurants'][0];
  user: {
    id: string;
    group: string;
    groups: string[];
  };
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="p-5">
        <RestaurantDetails restaurant={restaurant} user={user} />
      </div>
      <div className="bg-gray-50 px-4 py-3">
        <Button
          className="mr-2"
          variant={ButtonVariant.Secondary}
          onClick={onClose}
        >
          {t('close')}
        </Button>
      </div>
    </>
  );
};
