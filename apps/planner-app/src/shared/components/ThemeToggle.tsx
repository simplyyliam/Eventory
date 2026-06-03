import { Check, Laptop, Moon, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import type { Theme } from '@/components/theme-provider';
import { IconButton } from './IconButton';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';

const themes: Array<{ label: string; value: Theme; Icon: typeof Sun }> = [
  { label: 'Light', value: 'light', Icon: Sun },
  { label: 'Dark', value: 'dark', Icon: Moon },
  { label: 'System', value: 'system', Icon: Laptop },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            Icon={resolvedTheme === 'dark' ? Moon02Icon : Sun03Icon}
          />
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        {themes.map(({ label, value, Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon className="size-4" />
            <span>{label}</span>
            {theme === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
