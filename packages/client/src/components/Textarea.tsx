import { forwardRef, TextareaHTMLAttributes } from 'react';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <textarea
      ref={ref}
      {...rest}
      className={`text-md h-32 w-full rounded-sm border border-gray-300 bg-gray-50 p-2 text-gray-900 ${className}`}
    />
  );
});
