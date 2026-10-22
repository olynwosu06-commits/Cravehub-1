import React from 'react';
import { useToast } from '../context/ToastContext';
import './ToastContainer.css';

const ICONS = {
  success: 'bx bx-check-circle',
  error: 'bx bx-error-circle',
  info: 'bx bx-info-circle',
};

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <i className={ICONS[toast.type] || ICONS.info}></i>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;