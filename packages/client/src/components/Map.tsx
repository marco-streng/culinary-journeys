import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';
import { signOut } from 'aws-amplify/auth';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BiChevronLeft,
  BiChevronRight,
  BiFilterAlt,
  BiPlus,
  BiSort,
} from 'react-icons/bi';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Filter,
  Input,
  LinkButton,
  LinkButtonSize,
  Modal,
  RadioGroup,
  RestaurantCard,
  RestaurantPin,
  Select,
  SelectWrapper,
} from '.';
import { DEFAULT_CENTER, MAP_ID } from '../config';
import { NotificationPayload, useNotifications } from '../hooks';
import { RestaurantsQuery } from '../types/gql';
import classNames from 'classnames';

type ModalKind = 'filter';

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
  onChangeGroup: (group: string) => void;
  onNotification: (
    message: NotificationPayload,
    openDetails: (restaurant: Restaurant) => void,
  ) => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { location } = useRouterState();
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
        navigate({ to: `/restaurant/${restaurant.id}` });
      });
    }
  }, [lastMessage]);

  const handleCloseModal = () => {
    setModal({ isVisible: false });
  };

  const handleCloseRoutedModal = () => {
    navigate({ to: '/' });
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
          className={classNames('w-full overflow-y-auto bg-gray-200 md:h-screen', {
            'p-4 md:w-1/3 lg:w-1/4': isSidebarOpen,
            'md:w-0 lg:w-0': !isSidebarOpen,
          })}
        >
          <button
            type="button"
            aria-label={isSidebarOpen ? t('closeSidebar') : t('openSidebar')}
            className={classNames('absolute top-1/2 hidden bg-gray-200 md:block z-30', {
              'md:left-1/3 lg:left-1/4': isSidebarOpen,
              'left-0': !isSidebarOpen,
            })}
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
                aria-label={t('group')}
                prefix={`${t('group')}: `}
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
            <button
              type="button"
              className="cursor-pointer outline-sky-900"
              aria-label={t('sort')}
              onClick={() => setVisitedFirst((value) => !value)}
            >
              <BiSort size={23} className="inline fill-gray-600" />
            </button>
          </div>
          <div className="my-2">
            <Input
              value={listSearch}
              aria-label={t('searchList')}
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
                    restaurant={restaurant}
                    user={user}
                  />
                </div>
              );
            })}
          <Button
            type="button"
            aria-label={t('logout')}
            variant={ButtonVariant.Light}
            onClick={() => signOut()}
            className={classNames('mr-2 w-full shadow-xl md:hidden')}
          >
            {t('logout')}
          </Button>
        </div>
        <div
          className={classNames('shadow-xl', {
            'md:w-2/3 lg:w-3/4': isSidebarOpen,
            'md:w-full lg:w-full': !isSidebarOpen,
          })}
        >
          <div className="relative">
            <img
              src="./logo.png"
              alt="Culinary Journeys"
              className="absolute left-5 top-5 z-10 w-10 md:hidden"
            />
            <RadioGroup
              onChange={(event) =>
                setFilter(event.currentTarget.value as Filter)
              }
              options={[
                {
                  label: t('all'),
                  value: 'all',
                  checked: filter === 'all',
                },
                {
                  label: t('visited'),
                  value: 'done',
                  checked: filter === 'done',
                },
                {
                  label: t('planned'),
                  value: 'planned',
                  checked: filter === 'planned',
                },
              ]}
              label={t('filter')}
              name="filter"
              className="absolute left-2 top-2 z-10 hidden focus:bottom-10 md:block"
            />
            <div className="absolute right-3 top-5 z-10 md:hidden">
              <LinkButton
                label={t('addRestaurant')}
                to="/add"
                size={LinkButtonSize.Dot}
              >
                <BiPlus size="20" />
              </LinkButton>
            </div>
            <div className="absolute right-14 top-5 z-10 md:hidden">
              <Button
                type="button"
                aria-label={t('filter')}
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
              <LinkButton
                aria-label={t('addRestaurant')}
                to="/add"
                className="mr-2 shadow-xl"
              >
                {t('addRestaurant')}
              </LinkButton>
              <Button
                type="button"
                aria-label={t('logout')}
                variant={ButtonVariant.Light}
                onClick={() => signOut()}
                className={classNames('mr-2 shadow-xl')}
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
                    navigate({ to: `/restaurant/${restaurant.id}` });
                  }}
                  key={restaurant.id}
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
        </Modal>
      )}

      {location.pathname !== '/' && (
        <Modal onClose={handleCloseRoutedModal}>
          <Outlet />
          {modal.kind === 'filter' && (
            <Filter
              filter={filter}
              onChange={(value) => setFilter(value)}
              onClose={handleCloseRoutedModal}
            />
          )}
        </Modal>
      )}
    </>
  );
};
