import { ReactHTMLElement } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';
import { RestaurantsQuery } from '../types/gql';
import { Button, ButtonSize, ButtonVariant } from './Button';
import { Rating } from './Rating';

type Restaurant = RestaurantsQuery['restaurants'][0];

export const RestaurantCard = ({
  restaurant,
  user,
  onVisit,
  onRate,
  onSelect,
  onDetails,
  ...props
}: ReactHTMLElement<HTMLDivElement>['props'] & {
  restaurant: Restaurant;
  user: {
    id: string;
  };
  onSelect: (restaurant: Restaurant) => void;
  onVisit: (restaurant: Restaurant) => void;
  onRate: (restaurant: Restaurant) => void;
  onDetails: (restaurant: Restaurant) => void;
}) => {
  const { t } = useTranslation();
  const visited = (restaurant.visits?.length ?? 0) > 0;
  const rating =
    restaurant.ratings.length > 0
      ? Math.round(
          restaurant.ratings.reduce(
            (prev, curr) => prev + (curr?.value || 0),
            0,
          ) / restaurant.ratings.length,
        )
      : 0;

  return (
    <div
      className="min-w-[100px] rounded-sm bg-white shadow-xl md:min-w-[220px]"
      {...props}
    >
      <div onClick={() => onSelect(restaurant)} className={'cursor-pointer'}>
        <div className="p-3">
          <h2 className="flex items-center">
            <div className="flex-grow">
              <strong>{restaurant.name}</strong>
              {restaurant.address && (
                <>
                  <br />
                  <small>{restaurant.address}</small>
                </>
              )}
            </div>
            {visited ? (
              <BsCheckCircleFill
                size={20}
                className="ml-2 inline-block fill-green-500"
              />
            ) : (
              <BsCircle size={20} className="ml-2 inline-block fill-gray-300" />
            )}
          </h2>
          <div>
            <Rating value={rating} count={restaurant.ratings.length} />
          </div>
        </div>
      </div>
      <div className="mt-1 flex p-3">
        <div className="flex-grow">
          <a onClick={() => onVisit(restaurant)} title={t('visit')}>
            <Button size={ButtonSize.Small} variant={ButtonVariant.Secondary}>
              {t('visit')}
            </Button>
          </a>
          {visited &&
            !restaurant.ratings
              ?.map((rating) => rating?.userId)
              .includes(user.id) && (
              <a onClick={() => onRate(restaurant)} title={t('rate')}>
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                  className="ml-2"
                >
                  {t('rate')}
                </Button>
              </a>
            )}
        </div>
        <a onClick={() => onDetails(restaurant)} title={t('details')}>
          <Button size={ButtonSize.Small} className="ml-2">
            {t('details')}
          </Button>
        </a>
      </div>
    </div>
  );
};
