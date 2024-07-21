import { useEffect, useRef } from 'react';

const isImageZoomOpen = () =>
  document.querySelectorAll('[data-rmiz-portal] > dialog[open]').length > 0;

export const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      !innerRef.current?.contains(event.target as Element) &&
      !isImageZoomOpen()
    ) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, []);

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
            className="relative w-full transform overflow-hidden rounded-sm bg-white text-left shadow-xl transition-all sm:my-8 md:max-w-screen-md"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
