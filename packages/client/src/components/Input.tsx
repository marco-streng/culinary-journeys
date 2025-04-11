import { forwardRef, InputHTMLAttributes } from 'react';
import classNames from 'classnames';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <input
      ref={ref}
      {...rest}
      className={classNames(
        'text-md w-full rounded-sm border border-gray-300 bg-gray-50 p-2 text-gray-900 outline-sky-900',
        className
      )}
    />
  );
});

export const InputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);
