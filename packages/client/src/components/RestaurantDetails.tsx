import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import de from 'dayjs/locale/de';
import { ReactHTMLElement, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { BiUpload } from 'react-icons/bi';
import {
  BsBoxArrowUpRight,
  BsFillPencilFill,
  BsFillPersonFill,
} from 'react-icons/bs';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { uploader } from '../lib';
import {
  RestaurantsQuery,
  useCreateImagesMutation,
  useRestaurantsQuery,
} from '../types/gql';
import { Loader } from './Loader';
import { Rating } from './Rating';

dayjs.locale(de);

export const RestaurantDetails = ({
  restaurant,
  user,
  variant = 'default',
}: ReactHTMLElement<HTMLDivElement>['props'] & {
  restaurant: RestaurantsQuery['restaurants'][0];
  variant?: 'default' | 'small';
  user: {
    id: string;
    group: string;
    groups: string[];
  };
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: createImages } = useCreateImagesMutation();

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);

    const upload = await uploader(files);

    await createImages({
      input: {
        id: restaurant.id,
        fileNames: upload,
      },
    });

    queryClient.invalidateQueries(
      useRestaurantsQuery.getKey({
        group: user.group,
        groups: user.groups,
        from: dayjs().format('YYYY-MM-DD'),
      }),
    );

    setIsUploading(false);
  };

  const data = queryClient
    .getQueryData<RestaurantsQuery>(
      useRestaurantsQuery.getKey({
        group: user.group,
        groups: user.groups,
        from: dayjs().format('YYYY-MM-DD'),
      }),
    )
    ?.restaurants.find((r) => r.id === restaurant.id);

  if (!data) return null;

  const rating =
    data.ratings.length > 0
      ? data.ratings.reduce((prev, curr) => prev + (curr?.value || 0), 0) /
        data.ratings.length
      : 0;

  return (
    <div>
      {variant === 'small' && <div className="ci-arrow" />}

      <div className="flex flex-row">
        <div className="grow">
          <h2 className="flex items-center text-2xl font-bold md:text-4xl">
            {data.name}
          </h2>
          {data.address && <h3 className="text-md">{data.address}</h3>}
          {data.createdBy && (
            <div className="mt-2">
              <BsFillPencilFill
                size={16}
                className="mr-1 inline-block fill-gray-300"
              />
              {data.createdBy.name}
            </div>
          )}
        </div>
        <div>
          {data.website && (
            <a
              className="cursor-pointer text-gray-400"
              href={data.website}
              target="_blank"
            >
              <BsBoxArrowUpRight size={24} />
            </a>
          )}
        </div>
      </div>

      <div className="mb-6" />

      {(data.visits?.length ?? 0) > 0 && (
        <div className="mb-10">
          <Subline>{t('visits')}</Subline>
          <ul>
            {data.visits?.map((date: string) => (
              <li key={date} className="block">
                {dayjs(date).format('dddd - DD.MM.YYYY')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-10">
        <Subline>{t('rate')}</Subline>
        {data.ratings.length > 0 ? (
          <div className="flex">
            <div className="grow">
              {data.ratings.map((rating) => (
                <div key={rating.userId} className="mb-6">
                  <div className="mb-1">
                    <BsFillPersonFill
                      size={16}
                      className="mr-1 inline-block fill-gray-300"
                    />
                    {rating.userName}
                  </div>
                  <div className="mb-4">
                    <Rating size={22} value={rating.value} hideCount />
                  </div>
                  {rating.comment && (
                    <div className="text-xs">
                      {rating.comment
                        .replace('\n\n', '\n')
                        .split('\n')
                        .map((item, key) => {
                          return (
                            <span key={key}>
                              {item}
                              <br />
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="ml-2 mr-10 w-20">
              <span className="mr-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-sky-700 text-2xl font-semibold text-white">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
        ) : (
          <span>{t('noRatings')}</span>
        )}
      </div>

      <div>
        <Subline>{t('photos')}</Subline>
        {(data.images?.length ?? 0) > 0 && (
          <ul className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {data.images?.map((image) => (
              <li
                key={image}
                className="cursor-pointer border border-solid border-gray-100"
              >
                <Zoom>
                  <div
                    role="img"
                    className="rounded-sm hover:scale-110"
                    style={{
                      backgroundColor: '#efefef',
                      backgroundImage: `url(${import.meta.env.VITE_IMAGE_HOST ?? ''}${image}?format=jpeg&width=700)`,
                      backgroundPosition: '50% center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                      height: '0',
                      paddingBottom: '100%',
                      width: '100%',
                    }}
                  />
                </Zoom>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isUploading ? (
        <Loader full={false} />
      ) : (
        <Dropzone onDrop={(files) => handleUpload(files)}>
          {({ getRootProps, getInputProps }) => (
            <>
              <div
                {...getRootProps()}
                className="cursor-pointer border border-dashed border-gray-500 bg-white p-4 text-center"
              >
                <input {...getInputProps()} />
                <BiUpload size={30} className="mb-2 inline-block" />
                <div className="text-xs">{t('uploadHint')}</div>
              </div>
            </>
          )}
        </Dropzone>
      )}
    </div>
  );
};

const Subline = ({ children }: { children: string }) => (
  <h3 className="text-lg font-semibold text-sky-700">{children}</h3>
);
