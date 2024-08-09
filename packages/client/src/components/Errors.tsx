import { ValidationError } from '@tanstack/react-form';
import { BsExclamationCircleFill } from 'react-icons/bs';

export type ErrorProps = {
  messages: ValidationError[];
};

export const Errors = (props: ErrorProps) => {
  const { messages } = props;

  if (messages.length === 0) return null

  return (
    <div
      className="mt-2 flex items-center rounded-sm border px-3 py-2 text-sm text-gray-600"
      role="alert"
    >
      <BsExclamationCircleFill size={18} className="fill-sky-600" />
      {messages.filter((message) => typeof message === 'string').map((message) => <p className="pl-2" key={message}>{message}</p>)}
    </div>
  );
};
