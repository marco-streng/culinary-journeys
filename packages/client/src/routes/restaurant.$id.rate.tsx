import { createFileRoute } from '@tanstack/react-router';
import { Rate } from '../components';

export const Route = createFileRoute('/restaurant/$id/rate')({
  component: Rate,
});
