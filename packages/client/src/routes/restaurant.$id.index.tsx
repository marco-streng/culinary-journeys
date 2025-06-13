import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Details } from '../components';

export const Route = createFileRoute('/restaurant/$id/')({
  component: Details,
  beforeLoad: () => ({
    title: t('details'),
  }),
});
