import React from 'react';

const useComboboxAnchor = () => {
  return React.useRef<HTMLDivElement | null>(null);
};

export { useComboboxAnchor };
