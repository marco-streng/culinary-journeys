import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'usehooks-ts';
import { DEFAULT_CENTER } from '../config';
import { getActiveGroupForUser } from '../lib';
import { useUserStore } from '../state/user';
import { useCreateRestaurantMutation, useRestaurantsQuery } from '../types/gql';
import { CloseRoutedModalButton } from './CloseRoutedModalButton';
import { Input } from './Input';
import { Loader } from './Loader';

export const AddRestaurant = () => {
  const { t } = useTranslation();
  const [searchResult, setSearchResult] = useState<
    google.maps.places.PlaceResult[] | null
  >([]);
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
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

  const map = useMap();
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);

  const today = dayjs().format('YYYY-MM-DD');
  const queryClient = useQueryClient();

  const { mutateAsync: createRestaurant, isLoading: isCreating } =
    useCreateRestaurantMutation();
  const { isLoading: isLoadingRestaurants, data: restaurants } =
    useRestaurantsQuery(
      {
        from: today,
        group: activeGroup,
        groups: groups,
      },
      { select: (data) => data.restaurants },
    );

  const handleSubmit = (
    place: google.maps.places.PlaceResult & { website?: string },
  ) => {
    createRestaurant(
      {
        input: {
          group: activeGroup,
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
              group: activeGroup,
              groups: groups || [],
              from: today,
            }),
          );

          toast.success(t('restaurantAdded'), {
            icon: () => '✅',
            position: 'bottom-right',
            autoClose: 2500,
          });

          navigate({ to: '/' });
        },
      },
    );
  };

  const handleSearch = (searchString: string) => {
    if (!map || !places || !inputRef.current) return;

    setIsSearching(true);
    const service = new places.PlacesService(map);
    service.textSearch(
      {
        query: searchString,
        type: 'food',
        location: new google.maps.LatLng(DEFAULT_CENTER),
      },
      (result) => {
        setSearchResult(result);
        setIsSearching(false);
      },
    );
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const debouncedHandleSearch = debounce(handleSearch, 500);

  return (
    <>
      <div className="p-5">
        <Input
          ref={inputRef}
          placeholder={t('searchRestaurant')}
          required
          onChange={(e) => debouncedHandleSearch(e.target.value)}
          onBlur={(e) => debouncedHandleSearch(e.target.value)}
        />

        <div
          className="overflow-y-auto"
          style={{ height: 'calc(100vh - 220px)' }}
        >
          {isSearching || isLoadingRestaurants || isCreating ? (
            <Loader full={false} />
          ) : (
            <ul className="list-none overflow-auto pt-2">
              {searchResult?.map((place) => (
                <li className="py-2" key={place.place_id}>
                  {place.place_id &&
                  restaurants
                    ?.map((item) => item.googlePlaceId)
                    .includes(place.place_id) ? (
                    <span className="text-gray-300" title="Bereits besucht!">
                      <span className="font-bold">{place.name}</span>
                      <br />
                      {place.formatted_address}
                    </span>
                  ) : (
                    <a
                      className="cursor-pointer hover:text-sky-600"
                      onClick={() => {
                        handleSubmit(place);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="flex-grow">
                          <span className="font-bold">{place.name}</span>

                          <br />
                          {place.formatted_address}
                        </div>
                        <div className="">
                          <BsFillPlusCircleFill
                            className="fill-sky-600"
                            size={25}
                          />
                        </div>
                      </div>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3">
        <CloseRoutedModalButton />
      </div>
    </>
  );
};
