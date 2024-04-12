import { useRef } from 'react';

export const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const innerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!innerRef.current?.contains(event.target as Element)) {
      onClose();
    }
  };

  return (
    <div className="relative z-50" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
          onClick={handleClick}
        >
          <div
            ref={innerRef}
            className="relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 md:max-w-screen-md"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
