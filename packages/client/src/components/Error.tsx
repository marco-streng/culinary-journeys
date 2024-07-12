import { BsExclamationCircleFill } from 'react-icons/bs';

export type ErrorProps = {
  message: string;
};

export const Error = (props: ErrorProps) => {
  const { message } = props;

  return (
    <div
      className="mt-2 flex items-center rounded-sm border px-3 py-2 text-sm text-gray-600"
      role="alert"
    >
      <BsExclamationCircleFill size={18} className="fill-sky-600" />
      <p className="pl-2">{message}</p>
    </div>
  );
};
