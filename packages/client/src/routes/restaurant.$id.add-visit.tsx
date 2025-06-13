import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Visit } from '../components';

export const Route = createFileRoute('/restaurant/$id/add-visit')({
  component: Visit,
  beforeLoad: () => ({
    title: t('visit'),
  }),
});
