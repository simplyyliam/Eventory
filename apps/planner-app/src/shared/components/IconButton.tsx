import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface IconButtonProps {
  Label?: string | number;
  Icon?: IconSvgElement;
  onClick?: () => void;
  stretch?: boolean;
  className?: string
}
export const IconButton = ({ Label, Icon, onClick, stretch = false, className}: IconButtonProps) => {
  const icon = Icon;

  return (
    <Button
      size={!Label ? 'icon' : undefined}
      variant="outline"
      className={`flex items-center ${className} ${stretch ? "flex-1" : ""}`}
      onClick={onClick}
    >
      {icon ? <HugeiconsIcon icon={icon} /> : null}
      {Label && <span>{Label}</span>}
    </Button>
  );
};
