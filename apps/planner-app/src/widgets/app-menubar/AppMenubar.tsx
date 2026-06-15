import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@app/shared/components/ui/dropdown-menu';
import { IconButton } from '@/shared/components';
import { useTableStore } from '@/store/useTableStore';
import { Download01Icon } from '@hugeicons/core-free-icons';
import { MenubarGroup } from './components/MenubarGroup';
import { EventPublishDialog } from '@/features/events/components';
import { TableProperties } from './components/TableProperties';
import { HistoryControls } from './components/HistoryControls';
import { withHistory } from '@/lib/withHistory';
import { SnapToGrid } from './components/snapToGrid';

export const AppMenubar = () => {
  const addTable = useTableStore((s) => s.addTables);
  const tables = useTableStore((s) => s.tables);


  return (
    <div className="flex items-center justify-between h-fit w-full shrink-0 p-2.5 z-10 absolute">
      <MenubarGroup>
        <TableProperties tables={tables}/>
        <HistoryControls/>
        <SnapToGrid/>
      </MenubarGroup>

      <MenubarGroup>
        <DropdownMenu>
          <DropdownMenuTrigger render={<IconButton Label="Add table" />} />
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => withHistory(() => addTable('rectangle', 8))}>
                Long Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => withHistory(() => addTable('circle', 8))}>
                Round Table
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <EventPublishDialog />
        <IconButton Icon={Download01Icon} />
      </MenubarGroup>
    </div>
  );
};
