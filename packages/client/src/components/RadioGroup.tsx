import { ChangeEvent } from 'react';

export type RadioGroupProps = {
  label: string;
  name: string;
  options: {
    label: string;
    value: string;
    checked?: boolean;
  }[];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export const RadioGroup = (props: RadioGroupProps) => {
  const { label, name, options, onChange, className } = props;

  return (
    <div role="radiogroup" aria-label={label} className={className}>
      {options.map((option) => (
        <label className="mr-2 inline-block cursor-pointer rounded-sm bg-white px-4 py-2 font-semibold text-gray-800 opacity-50 shadow-xl outline-sky-900 hover:bg-gray-200 hover:opacity-100 has-[:checked]:opacity-100">
          <input
            onChange={onChange}
            checked={option.checked}
            className="m-0 appearance-none"
            type="radio"
            name={name}
            value={option.value}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};
