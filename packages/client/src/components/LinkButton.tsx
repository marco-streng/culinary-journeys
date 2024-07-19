import { Link, LinkProps } from '@tanstack/react-router';

export enum LinkButtonVariant {
  Default,
  Light,
  Secondary,
}

export enum LinkButtonSize {
  Default,
  Small,
  Dot,
}

export type LinkButtonProps = {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  full?: boolean;
  className?: string;
} & LinkProps;

const variants = {
  [LinkButtonVariant.Default]: 'text-white bg-sky-600 hover:bg-sky-700',
  [LinkButtonVariant.Secondary]:
    'text-gray-400 bg-gray-200 hover:bg-gray-300 hover:text-gray-600',
  [LinkButtonVariant.Light]: 'bg-white text-gray-800 hover:bg-gray-200',
};

const sizes = {
  [LinkButtonSize.Default]: 'px-4 py-2 rounded-sm font-semibold',
  [LinkButtonSize.Small]: 'px-2 py-1 rounded-sm font-semibold text-xs',
  [LinkButtonSize.Dot]: 'p-2 rounded-full',
};

export const LinkButton = (props: LinkButtonProps) => {
  const { children, variant, full, size, className, ...rest } = props;

  return (
    <Link
      {...rest}
      className={`inline-block ${sizes[size || LinkButtonSize.Default]} ${
        variants[variant || LinkButtonVariant.Default]
      } ${full && 'w-full'} ${className}`}
    >
      {children}
    </Link>
  );
};
