'use client';

import { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Dialog Component
 * Confirmation/Alert dialog with actions
 * Riferimento: Material Design Dialog
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  onConfirm,
  onCancel,
  variant = 'default',
  size = 'sm',
}: DialogProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      closeOnOverlayClick={false}
    >
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      {children && <div className="mb-6">{children}</div>}
      {/* Riferimento: Nielsen (1994) - Consistency, Material Design Dialog Actions */}
      {/* Button order: Cancel first (left), Confirm last (right) for LTR languages */}
      {/* Riferimento: WCAG 2.4.3 - Focus Order: Primary action should be last in tab order */}
      <div className="flex items-center justify-end gap-3" role="group" aria-label="Dialog actions">
        <Button
          variant="outline"
          onClick={handleCancel}
          // WCAG 2.1.1 - Keyboard: Ensure cancel is accessible
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              handleCancel();
            }
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'default' : 'default'}
          onClick={handleConfirm}
          className={variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}
          // WCAG 2.4.3 - Focus Order: Primary action receives focus last
          autoFocus
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

