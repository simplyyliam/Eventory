import { IconButton } from "@/shared/components"
import type { SeatingTable } from "@/store/useTableStore"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@app/shared/components/ui/dropdown-menu"

interface TablePropertiesProps {
    tables: SeatingTable[]
}

export const TableProperties = ({tables}:TablePropertiesProps) => {
    return (
    <DropdownMenu>
        <DropdownMenuTrigger
        render={<IconButton Label="Table Properties" />}
        />
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
    )
}