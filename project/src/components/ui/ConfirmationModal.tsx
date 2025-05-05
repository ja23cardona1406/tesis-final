import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  // Set styles based on variant
  const getStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
          headerBg: 'bg-yellow-50 border-yellow-100'
        };
      case 'danger':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700',
          headerBg: 'bg-red-50 border-red-100'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-blue-500" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700',
          headerBg: 'bg-blue-50 border-blue-100'
        };
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700',
          headerBg: 'bg-red-50 border-red-100'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className={`p-4 ${styles.headerBg} border-b flex items-center justify-between`}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 flex items-start space-x-4">
          {styles.icon}
          <div className="mt-1">
            <p className="text-gray-700">{message}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white ${styles.confirmButton} transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;