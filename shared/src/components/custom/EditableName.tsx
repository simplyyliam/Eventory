import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface EditableNameProps {
  name: string;
  onSave: (newName: string) => void;
  className?: string;
  placeholder?: string;
}

export interface EditableNameHandle {
  startEditing: () => void;
}

export const EditableName = forwardRef<EditableNameHandle, EditableNameProps>(({
  name,
  onSave,
  className,
  placeholder,
}, ref) => {
  const [value, setValue] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    startEditing: () => {
      setIsEditing(true)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }))

  useEffect(() => { setValue(name) }, [name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing]);

  const save = () => {
    const trimmed = value.trim() || name;
    setValue(trimmed);
    onSave(trimmed);
    setIsEditing(false);
  };

  return (
    <input
      ref={inputRef}
      placeholder={placeholder ?? name}
      className={className ?? 'border-none focus:outline-none bg-transparent'}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onDoubleClick={() => setIsEditing(true)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save()
        if (e.key === 'Escape') {
          setValue(name)
          setIsEditing(false)
        }
      }}
      readOnly={!isEditing}
    />
  );
});