import { AiFillStar } from 'react-icons/ai';
import classNames from 'classnames';

export const Rating = ({
  value,
  count,
  size = 18,
  hideCount = false,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  hideCount?: boolean;
  className?: string;
}) => (
  <div className={classNames('inline-flex items-center', className)}>
    {[...Array(value)].map((_, i) => (
      <AiFillStar
        size={size}
        key={i}
        className="inline-block fill-yellow-400"
      />
    ))}
    {[...Array(5 - value)].map((_, i) => (
      <AiFillStar size={size} key={i} className="inline-block fill-gray-200" />
    ))}
    {(count ?? 0) > 0 && !hideCount && (
      <small className="inline-block pl-1 text-gray-400">({count})</small>
    )}
  </div>
);
