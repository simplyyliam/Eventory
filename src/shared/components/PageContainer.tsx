import type { HTMLAttributes } from 'react';

export const PageContainer: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={`flex w-screen h-screen p-2.5 ${className}`} {...props}>
      {children}
    </div>
  );
};
