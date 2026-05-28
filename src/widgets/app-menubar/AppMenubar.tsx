import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconButton } from '@/shared/components';
import { useTableStore } from '@/store/useTableStore';
import { Download01Icon } from '@hugeicons/core-free-icons';

export const AppMenubar = () => {
  const addTable = useTableStore((s) => s.addTables);


  return (
    <div className="flex items-center justify-end h-fit w-full shrink-0 p-2.5 gap-2.5 z-10 absolute">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <IconButton Label="Add table" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => addTable('circle', 1)}>
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => addTable('rectangle', 12)}
            >
              Rectangle
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <IconButton Label="Sign in to save" />
      <IconButton Icon={Download01Icon} />
    </div>
  );
};
