import React, { useRef, KeyboardEvent, ChangeEvent, ClipboardEvent, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange, disabled = false }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (!disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    // Keep only digits
    const cleanedVal = val.replace(/[^0-9]/g, '');
    
    // Construct the new OTP array
    const newValue = Array(length).fill('');
    const currentChars = value.split('');
    for (let i = 0; i < length; i++) {
      newValue[i] = currentChars[i] || '';
    }

    if (!cleanedVal) {
      // If it was cleared
      newValue[index] = '';
      onChange(newValue.join(''));
      return;
    }

    // Take the last character typed to handle replacing/overwriting
    const lastChar = cleanedVal.slice(-1);
    newValue[index] = lastChar;
    const newStringValue = newValue.join('');
    onChange(newStringValue);

    // Auto-advance to the next input if we typed a character
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      // Select the content of the next input for easy overwrite
      setTimeout(() => {
        inputRefs.current[index + 1]?.select();
      }, 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, index: number) => {
    e.target.select(); // Auto-select text on focus so typing overwrites it
    
    // Redirect focus to the first empty box if user clicks ahead of active input
    const firstEmptyIndex = value.length;
    if (index > firstEmptyIndex) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      // If current is empty, move back and clear previous
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        e.preventDefault();
      } else {
        // Clear current
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain')
      .slice(0, length - index) // only fill from the current active index forward
      .replace(/[^0-9]/g, '');

    if (!pasteData) return;

    const newValue = value.split('');
    // Fill from current index onwards
    for (let i = 0; i < pasteData.length; i++) {
      if (index + i < length) {
        newValue[index + i] = pasteData[i];
      }
    }

    const newStringValue = newValue.join('').slice(0, length);
    onChange(newStringValue);

    // Set focus to the next empty input or the last input
    const nextFocusIndex = Math.min(index + pasteData.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
    setTimeout(() => {
      inputRefs.current[nextFocusIndex]?.select();
    }, 0);
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2} // Allow 2 characters temporarily to handle overwrite smoothly
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => handleFocus(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-bold bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
};
