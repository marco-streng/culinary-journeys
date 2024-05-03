import {
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';
import { signOut } from 'aws-amplify/auth';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BiChevronLeft,
  BiChevronRight,
  BiFilterAlt,
  BiPlus,
  BiSort,
} from 'react-icons/bi';
import {
  AddRestaurant,
  Button,
  ButtonSize,
  ButtonVariant,
  Details,
  Filter,
  Input,
  Modal,
  Rate,
  RestaurantCard,
  RestaurantPin,
  Select,
  SelectWrapper,
  Visit,
} from '.';
import { DEFAULT_CENTER, MAP_ID } from '../config';
import { NotificationPayload, useNotifications } from '../hooks';
import { RestaurantsQuery, Scalars } from '../types/gql';

type ModalKind = 'add' | 'visit' | 'rate' | 'details' | 'filter';

type Restaurant = RestaurantsQuery['restaurants'][0];

type ModalProps = {
  isVisible: boolean;
  kind?: ModalKind;
  restaurant?: Restaurant;
};

export const Map = ({
  restaurants,
  dates,
  user,
  groups,
  onCreate,
  onVisit,
  onRate,
  onChangeGroup,
  onNotification,
}: {
  restaurants: RestaurantsQuery['restaurants'];
  dates: RestaurantsQuery['dates'];
  groups: RestaurantsQuery['groups'];
  user: {
    id: string;
    group: string;
    groups: string[];
    name: string;
  };
  onCreate: (
    place: google.maps.places.PlaceResult & { website?: string },
  ) => Promise<unknown>;
  onVisit: (
    id: Scalars['ID']['input'],
    date: Scalars['AWSDate']['input'],
  ) => Promise<unknown>;
  onRate: (
    id: Scalars['ID']['input'],
    { value, comment }: { value: number; comment?: string },
  ) => Promise<unknown>;
  onChangeGroup: (group: string) => void;
  onNotification: (
    message: NotificationPayload,
    openDetails: (restaurant: Restaurant) => void,
  ) => void;
}) => {
  const { t } = useTranslation();
  const [modal, setModal] = useState<ModalProps>({
    isVisible: false,
  });
  const [filter, setFilter] = useState<Filter>('all');
  const [listSearch, setListSearch] = useState<string | undefined>();
  const [visitedFirst, setVisitedFirst] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const map = useMap();

  const lastMessage = useNotifications();

  useEffect(() => {
    if (lastMessage) {
      onNotification(lastMessage, (restaurant) => {
        handleShowModal({
          isVisible: true,
          kind: 'details',
          restaurant,
        });
      });
    }
  }, [lastMessage]);

  const getPlaceDetails = async (
    placeId: string,
  ): Promise<google.maps.places.PlaceResult | null> => {
    return new Promise((resolve) => {
      if (!map) {
        resolve(null);
        return;
      }

      const service = new google.maps.places.PlacesService(map);
      service.getDetails({ placeId }, (result) => {
        resolve(result);
      });
    });
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      handleCloseModal();
    }
  }, []);

  const handleShowModal = (props: ModalProps) => {
    setModal(props);
    document.addEventListener('keydown', handleKeyDown, false);
  };

  const handleCloseModal = () => {
    setModal({
      isVisible: false,
      restaurant: undefined,
      kind: undefined,
    });
    document.removeEventListener('keydown', handleKeyDown, false);
  };

  const handleRate = (
    id: Scalars['ID']['input'],
    { value, comment }: { value: number; comment?: string },
  ) => {
    onRate(id, { value, comment });
    handleCloseModal();
  };

  const handleVisit = (
    id: Scalars['ID']['input'],
    date: Scalars['AWSDate']['input'],
  ) => {
    onVisit(id, date);
    handleCloseModal();
  };

  const filteredData = restaurants.filter((restaurant) => {
    if (filter === 'done') {
      return (restaurant.visits?.length ?? 0) > 0;
    }

    if (filter === 'planned') {
      return (restaurant.visits?.length ?? 0) === 0;
    }

    return true;
  });

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row">
        <div
          className={`w-full overflow-y-auto bg-gray-200 md:h-screen ${
            isSidebarOpen ? 'p-4 md:w-1/3 lg:w-1/4' : 'md:w-0 lg:w-0'
          }`}
        >
          <button
            type="button"
            className={`absolute top-1/2 hidden bg-gray-200 md:block ${
              isSidebarOpen ? 'md:left-1/3 lg:left-1/4' : 'left-0'
            } z-30`}
            onClick={() => setIsSidebarOpen((value) => !value)}
          >
            {isSidebarOpen ? (
              <BiChevronLeft size={30} />
            ) : (
              <BiChevronRight size={30} />
            )}
          </button>
          <img
            src="./logo.png"
            alt="Culinary Journeys"
            className="mx-auto mb-10 hidden w-2/6 md:block"
          />
          {groups.length > 1 && (
            <SelectWrapper>
              <Select
                id="group"
                prefix="Group: "
                onChange={(event) => onChangeGroup(event.target.value)}
                options={groups.map((group) => ({
                  label: group.name,
                  value: group.id,
                  selected: user.group === group.id,
                }))}
              />
            </SelectWrapper>
          )}
          <div className="mb-2 flex">
            <div className="flex-grow">
              {dates.length > 0 && (
                <>
                  {t('nextDate')}
                  <strong>{dayjs(dates[0]).format('DD.MM.YYYY')}</strong>
                </>
              )}
            </div>
            <BiSort
              size={23}
              onClick={() => setVisitedFirst((value) => !value)}
              className="inline cursor-pointer fill-gray-600"
            />
          </div>

          <div className="my-2">
            <Input
              value={listSearch}
              placeholder={t('searchList')}
              onChange={(event) => setListSearch(event.target.value)}
            />
          </div>

          {filteredData
            .filter((restaurant) => {
              if ((listSearch?.length ?? 0) > 0) {
                return restaurant.name
                  .toLowerCase()
                  .includes((listSearch ?? '').toLowerCase());
              }

              return true;
            })
            .sort((a, b) => {
              const aL = a.visits?.length ?? 0;
              const bL = b.visits?.length ?? 0;

              if (aL > bL) return visitedFirst ? -1 : 1;
              if (aL === bL) return 0;
              return visitedFirst ? 1 : -1;
            })
            .map((restaurant) => {
              return (
                <div key={restaurant.id} className="mb-2">
                  <RestaurantCard
                    onSelect={() => {
                      map?.panTo(restaurant.position);
                      map?.setZoom(18);

                      const { innerWidth } = window;
                      if (innerWidth < 768) {
                        window.scrollTo(0, 0);
                      }
                    }}
                    onDetails={(restaurant) => {
                      handleShowModal({
                        isVisible: true,
                        kind: 'details',
                        restaurant,
                      });
                    }}
                    restaurant={restaurant}
                    user={user}
                    onRate={(restaurant) =>
                      handleShowModal({
                        isVisible: true,
                        restaurant,
                        kind: 'rate',
                      })
                    }
                    onVisit={(restaurant) =>
                      handleShowModal({
                        isVisible: true,
                        kind: 'visit',
                        restaurant,
                      })
                    }
                  />
                </div>
              );
            })}
          <Button
            variant={ButtonVariant.Light}
            onClick={() => signOut()}
            className={`mr-2 w-full shadow-xl md:hidden`}
          >
            {t('logout')}
          </Button>
        </div>
        <div
          className={`shadow-xl ${
            isSidebarOpen ? 'md:w-2/3 lg:w-3/4' : 'md:w-full lg:w-full'
          }`}
        >
          <div className="relative">
            <img
              src="./logo.png"
              alt="Culinary Journeys"
              className="absolute left-5 top-5 z-10 w-10 md:hidden"
            />
            <div className="absolute left-2 top-2 z-10 hidden md:block">
              <Button
                variant={ButtonVariant.Light}
                onClick={() => setFilter('all')}
                className={`mr-2 shadow-xl  ${
                  filter !== 'all' && 'opacity-50 hover:opacity-100'
                }`}
              >
                {t('all')}
              </Button>
              <Button
                variant={ButtonVariant.Light}
                onClick={() => setFilter('done')}
                className={`mr-2 shadow-xl ${
                  filter !== 'done' && 'opacity-50 hover:opacity-100'
                }`}
              >
                {t('visited')}
              </Button>
              <Button
                variant={ButtonVariant.Light}
                onClick={() => setFilter('planned')}
                className={`mr-8 shadow-xl ${
                  filter !== 'planned' && 'opacity-50 hover:opacity-100'
                }`}
              >
                {t('planned')}
              </Button>
            </div>
            <div className="absolute right-3 top-5 z-10 md:hidden">
              <Button
                onClick={() =>
                  handleShowModal({ isVisible: true, kind: 'add' })
                }
                size={ButtonSize.Dot}
              >
                <BiPlus size="20" />
              </Button>
            </div>
            <div className="absolute right-14 top-5 z-10 md:hidden">
              <Button
                variant={ButtonVariant.Secondary}
                onClick={() =>
                  setModal({
                    isVisible: true,
                    kind: 'filter',
                  })
                }
                size={ButtonSize.Dot}
              >
                <BiFilterAlt size="20" />
              </Button>
            </div>
            <div className="absolute right-2 top-2 z-10 hidden md:block">
              <Button
                onClick={() =>
                  handleShowModal({ isVisible: true, kind: 'add' })
                }
                className="mr-2 shadow-xl"
              >
                {t('addRestaurant')}
              </Button>
              <Button
                variant={ButtonVariant.Light}
                onClick={() => signOut()}
                className={`mr-2 shadow-xl`}
              >
                {t('logout')}
              </Button>
            </div>
            <style>
              {`
                .cj-map {
                  width: 100%;
                  height: 220px;
                }

                .gm-style iframe + div { border:none!important; }

                @media only screen and (min-width: 768px) {
                  .cj-map {
                    height: 100vh;
                  }
                }
              `}
            </style>
            <GoogleMap
              mapId={MAP_ID}
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={11}
              disableDefaultUI={true}
              className="cj-map"
            >
              {filteredData.map((restaurant) => (
                <AdvancedMarker
                  onClick={() => {
                    handleShowModal({
                      isVisible: true,
                      kind: 'details',
                      restaurant,
                    });
                  }}
                  position={restaurant.position}
                  title={restaurant.name}
                >
                  <RestaurantPin restaurant={restaurant} />
                </AdvancedMarker>
              ))}
            </GoogleMap>
          </div>
        </div>
      </div>

      {modal.isVisible && (
        <Modal onClose={handleCloseModal}>
          {modal.kind === 'filter' && (
            <Filter
              filter={filter}
              onChange={(value) => setFilter(value)}
              onClose={handleCloseModal}
            />
          )}
          {modal.kind === 'visit' && modal.restaurant && (
            <Visit
              restaurant={modal.restaurant}
              onClose={handleCloseModal}
              onSubmit={handleVisit}
            />
          )}
          {modal.kind === 'rate' && modal.restaurant && (
            <Rate
              restaurant={modal.restaurant}
              onClose={handleCloseModal}
              onSubmit={handleRate}
            />
          )}
          {modal.kind === 'add' && (
            <AddRestaurant
              restaurants={restaurants}
              onClose={handleCloseModal}
              onSubmit={async (place) => {
                const details = place.place_id
                  ? await getPlaceDetails(place.place_id)
                  : null;

                await onCreate({
                  ...place,
                  website: details?.website,
                });
                handleCloseModal();
              }}
            />
          )}
          {modal.kind === 'details' && modal.restaurant && (
            <Details
              user={user}
              restaurant={modal.restaurant}
              onClose={handleCloseModal}
            />
          )}
        </Modal>
      )}
    </>
  );
};
