import { useTranslation } from 'react-i18next';
import { LinkButton, LinkButtonVariant } from './LinkButton';

export const CloseRoutedModalButton = () => {
  const { t } = useTranslation();

  return (
    <LinkButton
      to="/"
      aria-label={t('close')}
      className="mr-2"
      variant={LinkButtonVariant.Secondary}
    >
      {t('close')}
    </LinkButton>
  );
};
