import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import debounce from 'lodash/debounce';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { DEFAULT_CENTER } from '../config';
import { Scalars } from '../types/gql';
import { Button, ButtonVariant } from './Button';
import { Input } from './Input';
import { Loader } from './Loader';

export const AddRestaurant = ({
  restaurants,
  onSubmit,
  onClose,
}: {
  restaurants: {
    id: Scalars['ID']['input'];
    googlePlaceId: string;
  }[];
  onSubmit: (place: google.maps.places.PlaceResult) => Promise<unknown>;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [searchResult, setSearchResult] = useState<
    google.maps.places.PlaceResult[] | null
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const map = useMap();
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
          {isSearching ? (
            <Loader full={false} />
          ) : (
            <ul className="list-none overflow-auto pt-2">
              {searchResult?.map((place) => (
                <li className="py-2" key={place.place_id}>
                  {place.place_id &&
                  restaurants
                    .map((item) => item.googlePlaceId)
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
                        onSubmit(place);
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
