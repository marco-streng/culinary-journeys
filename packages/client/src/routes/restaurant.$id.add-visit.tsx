import { createFileRoute } from '@tanstack/react-router';
import { Visit } from '../components';

export const Route = createFileRoute('/restaurant/$id/add-visit')({
  component: Visit,
});
