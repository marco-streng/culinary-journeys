import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Scalars } from '../types/gql';
import { Button, ButtonVariant } from './Button';
import { Input } from './Input';
import { Label } from './Label';

export const Visit = ({
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
    date: Scalars['AWSDate']['input'],
  ) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dateInputRef.current?.focus();
  }, []);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (restaurant.id) {
            onSubmit(
              restaurant.id,
              dayjs(dateInputRef.current?.value).format('YYYY-MM-DD'),
            );
          }
        }}
      >
        <div className="p-5">
          <h2 className="mb-8 text-xl font-bold">
            {restaurant?.name}
            {t('visit')}
          </h2>

          <Label htmlFor="date">{t('date')}</Label>
          <Input
            id="date"
            name="date"
            ref={dateInputRef}
            type="date"
            required
          />
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
              <Button>{t('save')}</Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
