import { IconButton } from '@/shared/components';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ArrowDown01Icon, ArrowUpDown } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

export const SeatedGuestsSection = () => {
  const [isUnseatedOpen, setIsUnseatedOpen] = useState(true);

  return (
    <SidebarGroup>
      <div className="flex items-center gap-2 px-2">
        <SidebarGroupLabel className="h-10 flex-1 px-0">
          Seated Guests
        </SidebarGroupLabel>
        <IconButton Icon={ArrowUpDown} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-expanded={isUnseatedOpen}
          aria-label="Toggle unseated guests"
          onClick={() => setIsUnseatedOpen((open) => !open)}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              'transition-transform duration-200',
              isUnseatedOpen && 'rotate-180',
            )}
          />
        </Button>
      </div>
      {isUnseatedOpen && (
        <SidebarGroupContent className="px-2">hello</SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};
