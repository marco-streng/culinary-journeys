import { ReactHTMLElement } from 'react';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';
import classNames from 'classnames';
import { RestaurantsQuery } from '../types/gql';

type Restaurant = RestaurantsQuery['restaurants'][0];

export const RestaurantPin = ({
  restaurant,
  ...props
}: ReactHTMLElement<HTMLDivElement>['props'] & {
  restaurant: Restaurant;
}) => {
  const visited = (restaurant.visits?.length ?? 0) > 0;

  return (
    <div
      className={classNames(
        'min-w-[100px] cursor-pointer rounded-sm bg-white shadow-xl md:min-w-[220px]',
        props.className
      )}
      {...props}
    >
      <div className="p-1 md:p-3">
        <div className="ci-arrow" />
        <h2 className="flex items-center text-xs md:text-base">
          <div className="flex-grow">
            <strong>{restaurant.name}</strong>
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
      </div>
    </div>
  );
};
