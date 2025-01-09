import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';

export const useContrastText = (imageElement) => {
  const [textColor, setTextColor] = useState('black');

  useEffect(() => {
    if (imageElement) {
      const colorThief = new ColorThief();
      const [r, g, b] = colorThief.getColor(imageElement);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const contrastColor = luminance > 128 ? 'black' : 'white';
      setTextColor(contrastColor);
    }
  }, [imageElement]);

  return textColor;
};
