import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Button } from '@app/shared/components/ui/button';
import { Spinner } from '@app/shared/components/ui/spinner';

interface IconButtonProps {
  Label?: string | number;
  Icon?: IconSvgElement;
  onClick?: () => void;
  stretch?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const IconButton = ({
  Label,
  Icon,
  onClick,
  stretch = false,
  className,
  disabled,
  loading = false,
}: IconButtonProps) => {
  return (
    <Button
      size={!Label ? 'icon' : undefined}
      variant="outline"
      className={`flex items-center ${stretch ? 'flex-1' : ''} ${className ?? ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Spinner/>
      ) : (
        Icon && <HugeiconsIcon icon={Icon} />
      )}

      {Label && <span>{Label}</span>}
    </Button>
  );
};