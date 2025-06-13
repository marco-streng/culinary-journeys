import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Rate } from '../components';

export const Route = createFileRoute('/restaurant/$id/rate')({
  component: Rate,
  beforeLoad: () => ({
    title: t('rate'),
  }),
});
