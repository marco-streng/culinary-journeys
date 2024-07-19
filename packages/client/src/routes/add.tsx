import { createFileRoute } from '@tanstack/react-router';
import { AddRestaurant } from '../components';

export const Route = createFileRoute('/add')({
  component: AddRestaurant,
});
