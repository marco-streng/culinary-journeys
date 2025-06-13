import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { AddRestaurant } from '../components';

export const Route = createFileRoute('/add')({
  component: AddRestaurant,
  beforeLoad: () => ({
    title: t('addRestaurant'),
  }),
});
