import { BsExclamationCircleFill } from 'react-icons/bs';
import classNames from 'classnames';

export type ErrorProps = {
  message: string;
  className?: string;
};

export const Error = (props: ErrorProps) => {
  const { message, className } = props;

  return (
    <div
      className={classNames(
        'mt-2 flex items-center rounded-sm border px-3 py-2 text-sm text-gray-600',
        className
      )}
      role="alert"
    >
      <BsExclamationCircleFill size={18} className="fill-sky-600" />
      <p className="pl-2">{message}</p>
    </div>
  );
};
