import { useEffect } from 'react';

export function Modal({ open, onClose, title, children, testId }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid={testId}
    >
      <div
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-md mx-auto card p-5 sm:p-6 rounded-t-2xl sm:rounded-2xl max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="display text-xl font-semibold text-ink-100">{title}</h2>
          <button
            type="button"
            className="btn-ghost min-h-[40px] px-3 py-2 text-sm"
            onClick={onClose}
            aria-label="Close dialog"
            data-testid="button-modal-close"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
