import { useTranslation } from 'react-i18next';
import { CloseRoutedModalButton } from './CloseRoutedModalButton';

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
        <div className="inline-block overflow-hidden rounded-sm">
          <button
            onClick={() => handleChange('all')}
            className={`border-2 border-sky-600 px-8 py-4 font-semibold ${
              filter !== 'all' ? ' text-gray-500' : 'bg-sky-600 text-white'
            }`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => handleChange('done')}
            className={`border-2 border-l-0 border-sky-600 px-8 py-4 font-semibold ${
              filter !== 'done' ? ' text-gray-500' : 'bg-sky-600 text-white'
            }`}
          >
            {t('visited')}
          </button>
          <button
            onClick={() => handleChange('planned')}
            className={`border-2 border-l-0 border-sky-600 px-8 py-4 font-semibold ${
              filter !== 'planned' ? ' text-gray-500' : 'bg-sky-600 text-white'
            }`}
          >
            {t('planned')}
          </button>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3">
        <div className="flex flex-row">
          <div className="grow">
            <CloseRoutedModalButton />
          </div>
        </div>
      </div>
    </>
  );
};
