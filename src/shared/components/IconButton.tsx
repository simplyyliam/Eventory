import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface IconButtonProps {
  label?: string;
  Icon: IconSvgElement;
  onClick?: () => void
}

export const IconButton = ({ label, Icon , onClick}: IconButtonProps) => {
  return (
    <Button
      size={!label ? 'icon' : undefined}
      variant="outline"
      className={`flex items-center ${label ? 'flex-1 gap-2' : ''}`}
      onClick={onClick}
    >
      <HugeiconsIcon icon={Icon} />
      <span>{label}</span>
    </Button>
  );
};
