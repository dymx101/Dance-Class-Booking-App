import React, { useRef, KeyboardEvent, ChangeEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange, disabled = false }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  React.useEffect(() => {
    if (!disabled) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return;

    // Use a fixed length array to avoid holes and "jumping" characters
    const newValue = Array(length).fill('');
    const currentChars = value.split('');
    for (let i = 0; i < length; i++) {
      newValue[i] = currentChars[i] || '';
    }
    
    // Update the character at the current index
    newValue[index] = val.slice(-1);
    
    // Join and trim to get the continuous string
    const newStringValue = newValue.join('');
    onChange(newStringValue);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Redirect focus to the first empty box if user clicks ahead
    const firstEmptyIndex = value.length;
    if (index > firstEmptyIndex) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
      } else {
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, length).replace(/[^0-9]/g, '');
    onChange(pasteData);
    const focusIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
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
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-bold bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
};
