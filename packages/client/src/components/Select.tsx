import { forwardRef, SelectHTMLAttributes } from 'react';
import classNames from 'classnames';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & {
    prefix?: string;
    options: { value: string; label: string; selected?: boolean }[];
  }
>((props, ref) => {
  const { className, prefix, options, ...rest } = props;

  return (
    <>
      <select
        ref={ref}
        className={classNames(
          'text-md w-full rounded-sm border border-gray-300 bg-gray-50 p-2 text-gray-900 outline-sky-900',
          className
        )}
        {...rest}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            selected={option.selected}
          >
            {prefix}
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
});

export const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);
