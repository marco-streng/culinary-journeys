import { FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillStar } from 'react-icons/ai';
import { Scalars } from '../types/gql';
import { Button, ButtonVariant } from './Button';
import { Label } from './Label';
import { Textarea } from './Textarea';

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
  const [value, setValue] = useState<number | undefined>();
  const inputCommentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputCommentRef.current?.focus();
  }, []);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value) return;

    const comment = inputCommentRef.current?.value;

    onSubmit(restaurant.id, {
      value,
      comment,
    });
  };

  return (
    <form onSubmit={handleSignIn}>
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
            {Array.from({ length: 5 }).map((_, nr) => (
              <AiFillStar
                size={55}
                className={`ci-rating_star ${
                  (value ?? 0) >= nr + 1 && 'ci-rating_star--active'
                }`}
                onClick={() => setValue(nr + 1)}
              />
            ))}
          </div>
        </div>

        <div className="mb-8 flex flex-row">
          <div className="basis-1/4">
            <Label htmlFor="comment">{t('comment')}</Label>
          </div>
          <div className="basis-3/4">
            <Textarea
              ref={inputCommentRef}
              id="comment"
              name="comment"
            ></Textarea>
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
