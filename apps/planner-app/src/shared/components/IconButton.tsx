import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Button } from '@app/shared/components/ui/button';

interface IconButtonProps {
  Label?: string | number;
  Icon?: IconSvgElement;
  onClick?: () => void;
  stretch?: boolean;
  className?: string;
  disabled?: boolean;
}

export const IconButton = ({ Label, Icon, onClick, stretch = false, className, disabled }: IconButtonProps) => {
  return (
    <Button
      size={!Label ? 'icon' : undefined}
      variant="outline"
      className={`flex items-center ${className} ${stretch ? "flex-1" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon ? <HugeiconsIcon icon={Icon} /> : null}
      {Label && <span>{Label}</span>}
    </Button>
  );
};