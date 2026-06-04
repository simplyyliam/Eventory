import { DialogHeader, DialogTitle } from '@app/shared/components/ui/dialog';
import type { HTMLAttributes } from 'react';

interface StateContainerProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export const StateContainer = ({
  children,
  className,
  title,
  description,
  ...props
}: StateContainerProps) => {
  return (
    <div
      className={`flex h-80 w-full flex-col items-center justify-between ${className ?? ''}`}
      {...props}
    >
      <DialogHeader className='items-center'>
        <DialogTitle>{title}</DialogTitle>
        {description && <span>{description}</span>}
      </DialogHeader>

      {children} 
    </div>
  );
};
