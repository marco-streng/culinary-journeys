import { useTranslation } from 'react-i18next';
import { LinkButton, LinkButtonVariant } from './LinkButton';

export const CloseRoutedModalButton = () => {
  const { t } = useTranslation();

  return (
    <LinkButton to="/" className="mr-2" variant={LinkButtonVariant.Secondary}>
      {t('close')}
    </LinkButton>
  );
};
