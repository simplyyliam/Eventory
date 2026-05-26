import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Button } from '../ui/button';

interface ButtonIconProps {
  label?: string;
  Icon: IconSvgElement;
}

export const ButtonIcon = ({ label, Icon }: ButtonIconProps) => {
  return (
    <Button
      size={!label ? 'icon' : undefined}
      variant="outline"
      className={`flex items-center ${label ? 'flex-1 gap-2' : ''}`}
    >
      <HugeiconsIcon icon={Icon} />
      <span>{label}</span>
    </Button>
  );
};
