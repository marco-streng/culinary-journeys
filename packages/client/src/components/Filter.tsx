import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from './Button';
import { RadioGroup } from './RadioGroup';

export type Filter = 'all' | 'planned' | 'done';

export const Filter = ({
  filter,
  onChange,
  onClose,
}: {
  filter: Filter;
  onChange: (filter: Filter) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const handleChange = (filter: Filter) => {
    onChange(filter);
    onClose();
  };

  return (
    <>
      <div className="p-8 text-center">
        <RadioGroup
          onChange={(event) =>
            handleChange(event.currentTarget.value as Filter)
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
          className="rounded-sm bg-gray-200 p-4"
        />
      </div>
      <div className="bg-gray-50 px-4 py-3">
        <div className="flex flex-row">
          <div className="grow">
            <Button
              type="button"
              aria-label={t('close')}
              onClick={onClose}
              className="mr-2"
              variant={ButtonVariant.Secondary}
            >
              {t('close')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
