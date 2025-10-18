"use client";

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface TextInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (text: string) => void;
  initialText?: string;
  position?: { x: number; y: number };
}

export function TextInputDialog({
  open,
  onOpenChange,
  onSave,
  initialText = '',
  position,
}: TextInputDialogProps) {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset text when dialog opens with new initial value
  useEffect(() => {
    if (open) {
      setText(initialText);
      // Auto-focus input field
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, initialText]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      setText('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setText('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Text Note</h3>
          <button
            onClick={handleCancel}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add note..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            maxLength={200}
          />
          <p className="mt-1 text-xs text-gray-500">
            {text.length}/200 characters
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
