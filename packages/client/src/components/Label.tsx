import { LabelHTMLAttributes } from 'react';
import classNames from 'classnames';

export const Label = (props: LabelHTMLAttributes<HTMLLabelElement>) => {
  const { className, ...rest } = props;
  
  return (
    <label
      {...rest}
      className={classNames('mb-2 block text-gray-400', className)}
    >
      {props.children}
    </label>
  );
};
