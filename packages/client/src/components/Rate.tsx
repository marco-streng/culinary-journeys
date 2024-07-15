import { ErrorMessage } from '@hookform/error-message';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AiFillStar } from 'react-icons/ai';
import { Scalars } from '../types/gql';
import { Button, ButtonVariant } from './Button';
import { Error } from './Error';
import { Label } from './Label';
import { Textarea } from './Textarea';

type FormData = {
  value: number;
  comment?: string;
};

export const Rate = ({
  restaurant,
  onSubmit,
  onClose,
}: {
  restaurant: {
    id: Scalars['ID']['input'];
    name: string;
  };
  onSubmit: (
    id: Scalars['ID']['input'],
    { value, comment }: { value: number; comment?: string },
  ) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  const {
    control,
    register,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    setFocus('comment');
  }, [setFocus]);

  const submit = (data: FormData) => {
    onSubmit(restaurant.id, data);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="p-5">
        <h2 className="mb-8 text-xl font-bold">
          {restaurant.name}
          {` `}
          {t('rate')}
        </h2>

        <div className="mb-8 flex flex-row">
          <div className="basis-1/4">
            <Label>{t('stars')}</Label>
          </div>
          <div className="basis-3/4">
            <Controller
              name="value"
              control={control}
              rules={{
                required: t('missingRateValue'),
              }}
              render={({ field }) => (
                <>
                  {Array.from({ length: 5 }).map((_, nr) => (
                    <AiFillStar
                      size={55}
                      className={`ci-rating_star ${
                        (field.value ?? 0) >= nr + 1 && 'ci-rating_star--active'
                      }`}
                      onClick={() => field.onChange(nr + 1)}
                    />
                  ))}
                  <ErrorMessage
                    errors={errors}
                    name="value"
                    render={({ message }) => <Error message={message} />}
                  />
                </>
              )}
            />
          </div>
        </div>

        <div className="mb-8 flex flex-row">
          <div className="basis-1/4">
            <Label htmlFor="comment">{t('comment')}</Label>
          </div>
          <div className="basis-3/4">
            <Textarea {...register('comment')} />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3">
        <div className="flex flex-row">
          <div className="grow">
            <Button
              className="mr-2"
              variant={ButtonVariant.Secondary}
              onClick={onClose}
            >
              {t('close')}
            </Button>
          </div>
          <div>
            <Button type="submit" className="mr-2">
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
