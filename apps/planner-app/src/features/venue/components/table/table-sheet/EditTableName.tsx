import { useTableStore } from '@/store/useTableStore';
import { useEffect, useRef, useState } from 'react';

interface EditTableNameProps {
  tableName: string;
  tableId: string;
}

export const EditTableName = ({ tableName, tableId }: EditTableNameProps) => {
  const [newName, setNewName] = useState(tableName);
  const [isEditing, setIsEditing] = useState(true);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const updateTableName = useTableStore((s) => s.updateTableName);

  useEffect(() => {
    const updateName = () => {
      setNewName(tableName);
    };

    updateName();
  }, [tableName]);

  useEffect(() => {
    if (!isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const saveName = () => {
    updateTableName(tableId, newName.trim() || tableName);
    setIsEditing(true);
  };

  return (
    <input
      ref={inputRef}
      placeholder={tableName}
      className="border-none focus:outline-none"
      value={newName}
      onChange={(e) => {
        setNewName(e.target.value);
      }}
      onDoubleClick={() => setIsEditing(false)}
      onBlur={saveName}
      onKeyDown={(e) => {
        if (e.key === 'Enter') saveName();
      }}
      readOnly={isEditing}
    />
  );
};
