import { LabelHTMLAttributes } from 'react';

export const Label = (props: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label htmlFor={props.htmlFor} className="mb-2 block text-gray-400">
    {props.children}
  </label>
);
