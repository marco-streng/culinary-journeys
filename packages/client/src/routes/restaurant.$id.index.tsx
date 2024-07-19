import { createFileRoute } from '@tanstack/react-router';
import { Details } from '../components';

export const Route = createFileRoute('/restaurant/$id/')({
  component: Details,
});
