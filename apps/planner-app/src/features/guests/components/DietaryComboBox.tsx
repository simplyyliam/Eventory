

import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from '@app/shared';

const dietaryRequirements = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Shellfish-Free',
  'Egg-Free',
  'Pescatarian',
  'Low-Carb',
  'Keto',
  'Diabetic-Friendly',
  'Low-Sodium',
  'No Pork',
] as const;

interface DietaryComboBoxProps {
  value: string[]
  onValueChange: (value: string[]) => void
}

export function DietaryComboBox({value, onValueChange}: DietaryComboBoxProps) {
  const anchor = useComboboxAnchor();


  return (
    <Combobox
      multiple
      autoHighlight
      items={dietaryRequirements}
      value={value}
      onValueChange={onValueChange}
    >
      <ComboboxChips ref={anchor} className="w-full">
        <ComboboxValue>
          {(values) => (
            <>
              {values.map((value: string) => (
                <ComboboxChip key={value}>
                  {value}
                </ComboboxChip>
              ))}

              <ComboboxChipsInput placeholder="Add dietary requirements..." />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>

        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}