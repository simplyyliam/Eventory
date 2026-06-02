import type { HTMLAttributes } from 'react';
import type React from 'react';

export const TableSheetGroup: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`flex flex-col full h-full p-6 gap-2.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
