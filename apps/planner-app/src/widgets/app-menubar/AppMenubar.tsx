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
import { MenubarGroup } from './MenubarGroup';
import { buildEventPayload } from '@/lib/buildEventPayload';
import axios from 'axios';

export const AppMenubar = () => {
  const addTable = useTableStore((s) => s.addTables);
  const tables = useTableStore((s) => s.tables);

  const PublishEvent = async () => {
    const payload = buildEventPayload();
    console.log('Frontend Payload:', payload);

    try {
      const res = await axios.post('http://localhost:3001/events', payload);
      console.log('Server Response:', res.data);
    } catch (error) {
      console.error('Failed to publish event', error);
    }
  };

  return (
    <div className="flex items-center justify-between h-fit w-full shrink-0 p-2.5 z-10 absolute">
      <MenubarGroup>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <IconButton Label="Table Properties" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit">
            <DropdownMenuGroup>
              <div className=" p-3 text-sm backdrop-blur-md">
                {tables.length > 0 ? (
                  <ul className="space-y-1">
                    {tables.map((table) => (
                      <li key={table.id} className="flex gap-2">
                        <span>{table.name}</span>
                        <span className="text-muted-foreground">
                          {table.id} - {table.seatCount} seats
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No tables yet</p>
                )}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </MenubarGroup>

      <MenubarGroup>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <IconButton Label="Add table" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => addTable('rectangle', 8)}>
                Long Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addTable('circle', 8)}>
                Round Table
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <IconButton
          Label="Publish Event"
          onClick={() => {
            PublishEvent();
          }}
        />
        <IconButton Icon={Download01Icon} />
      </MenubarGroup>
    </div>
  );
};
