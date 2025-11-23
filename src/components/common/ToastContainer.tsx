"use client";

import React, { useEffect, useState } from 'react';
import { Toast, ToastProps, toastManager } from './Toast';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            top: `${16 + index * 80}px`, // Stack toasts vertically
          }}
          className="fixed right-4 z-50"
        >
          <Toast {...toast} />
        </div>
      ))}
    </>
  );
}