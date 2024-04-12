export enum ButtonVariant {
  Default,
  Light,
  Secondary,
}

export enum ButtonSize {
  Default,
  Small,
  Dot,
}

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
} & Record<string, unknown>;

const variants = {
  [ButtonVariant.Default]: 'text-white bg-sky-600 hover:bg-sky-700',
  [ButtonVariant.Secondary]:
    'text-gray-400 bg-gray-200 hover:bg-gray-300 hover:text-gray-600',
  [ButtonVariant.Light]: 'bg-white text-gray-800 hover:bg-gray-200',
};

const sizes = {
  [ButtonSize.Default]: 'px-4 py-2 rounded-sm font-semibold',
  [ButtonSize.Small]: 'px-2 py-1 rounded-sm font-semibold text-xs',
  [ButtonSize.Dot]: 'p-2 rounded-full',
};

export const Button = (props: ButtonProps) => {
  const { children, variant, full, size, className, ...rest } = props;

  return (
    <button
      {...rest}
      className={`${sizes[size || ButtonSize.Default]} ${
        variants[variant || ButtonVariant.Default]
      } ${full && 'w-full'} ${className}`}
    >
      {children}
    </button>
  );
};
