import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface IconButtonProps {
  label?: string;
  Icon: IconSvgElement;
}

export const IconButton = ({ label, Icon }: IconButtonProps) => {
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
