import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`toast ${isSuccess ? 'success' : isError ? 'error' : ''}`}
          >
            {isSuccess && <CheckCircle2 size={18} color="#34d399" />}
            {isError && <AlertCircle size={18} color="#f87171" />}
            {!isSuccess && !isError && <Info size={18} color="#60a5fa" />}

            <span style={{ flex: 1 }}>{toast.message}</span>

            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                color: 'currentColor',
                opacity: 0.7,
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
