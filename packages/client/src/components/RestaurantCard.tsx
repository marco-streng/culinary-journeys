import { ReactHTMLElement } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';
import { RestaurantsQuery } from '../types/gql';
import { LinkButton, LinkButtonSize, LinkButtonVariant } from './LinkButton';
import { Rating } from './Rating';

type Restaurant = RestaurantsQuery['restaurants'][0];

export const RestaurantCard = ({
  restaurant,
  user,
  onSelect,
  ...props
}: ReactHTMLElement<HTMLDivElement>['props'] & {
  restaurant: Restaurant;
  user: {
    id: string;
  };
  onSelect: (restaurant: Restaurant) => void;
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
          <LinkButton
            size={LinkButtonSize.Small}
            variant={LinkButtonVariant.Secondary}
            to={'/restaurant/$id/add-visit'}
            params={{ id: restaurant.id }}
          >
            {t('visit')}
          </LinkButton>
          {visited &&
            !restaurant.ratings
              ?.map((rating) => rating?.userId)
              .includes(user.id) && (
              <LinkButton
                to={`/restaurant/$id/rate`}
                params={{
                  id: restaurant.id,
                }}
                size={LinkButtonSize.Small}
                variant={LinkButtonVariant.Secondary}
                className="ml-2"
              >
                {' '}
                {t('rate')}
              </LinkButton>
            )}
        </div>
        {restaurant && (
          <LinkButton
            to={`/restaurant/$id`}
            params={{
              id: restaurant.id,
            }}
            size={LinkButtonSize.Small}
            className="ml-2"
          >
            {t('details')}
          </LinkButton>
        )}
      </div>
    </div>
  );
};
