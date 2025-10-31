"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  actions?: ToastAction[];
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  description,
  actions = [],
  duration = 5000,
  onClose
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Allow fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  };

  const colors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  };

  const Icon = icons[type];

  // Use assertive for errors/warnings, polite for success/info
  const ariaLive = type === 'error' || type === 'warning' ? 'assertive' : 'polite';

  return (
    <div
      className={cn(
        'fixed top-4 right-4 max-w-sm w-full transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      )}
      style={{ zIndex: 9999 }}
      role="alert"
      aria-live={ariaLive}
    >
      <div className={cn(
        'rounded-lg border p-4 shadow-lg',
        colors[type]
      )}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{title}</h4>
            {description && (
              <p className="text-sm opacity-90 mt-1">{description}</p>
            )}
            {actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      handleClose();
                    }}
                    className="px-3 py-1 text-xs font-medium rounded border border-current/20 hover:bg-current/10 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  description?: string;
  actions?: ToastAction[];
  duration?: number;
}

class ToastManager {
  private toasts: Map<string, ToastProps> = new Map();
  private listeners: Set<(toasts: ToastProps[]) => void> = new Set();

  show(title: string, options: ToastOptions = {}): string {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastProps = {
      id,
      type: options.type || 'info',
      title,
      description: options.description,
      actions: options.actions,
      duration: options.duration ?? 5000,
      onClose: (toastId) => this.remove(toastId),
    };

    this.toasts.set(id, toast);
    this.notify();

    return id;
  }

  remove(id: string): void {
    this.toasts.delete(id);
    this.notify();
  }

  subscribe(listener: (toasts: ToastProps[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const toasts = Array.from(this.toasts.values());
    this.listeners.forEach(listener => listener(toasts));
  }
}

export const toastManager = new ToastManager();

// Convenience functions
export const toast = {
  success: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    toastManager.show(title, { ...options, type: 'success' }),
  error: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    toastManager.show(title, { ...options, type: 'error' }),
  info: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    toastManager.show(title, { ...options, type: 'info' }),
  warning: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    toastManager.show(title, { ...options, type: 'warning' }),
};