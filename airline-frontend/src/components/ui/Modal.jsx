import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  showCloseButton = true,
  closeOnBackdrop = true,
  footer,
  headerAction
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className={`
            inline-block w-full align-bottom bg-white dark:bg-gray-900 rounded-lg shadow-xl transform transition-all 
            sm:my-8 sm:align-middle ${sizeClasses[size]} ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton || headerAction) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {title && (
                  <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {title}
                  </h3>
                )}
                {headerAction && headerAction}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'danger', 'warning'
  loading = false
}) => {
  const getConfirmButtonProps = () => {
    switch (type) {
      case 'danger':
        return { 
          className: 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
        };
      case 'warning':
        return { 
          className: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600' 
        };
      default:
        return {};
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
            {...getConfirmButtonProps()}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-light-text-secondary dark:text-dark-text-secondary">
        {message}
      </p>
    </Modal>
  );
};

// Form Modal Component
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields = [],
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  size = 'md',
  disabled = false,
  initialData = {},
  children
}) => {
  const [formData, setFormData] = useState(() => {
    const data = {};
    fields.forEach(field => {
      data[field.name] = initialData[field.name] || field.defaultValue || '';
    });
    return data;
  });

  // Update form data when initialData changes
  React.useEffect(() => {
    const data = {};
    fields.forEach(field => {
      data[field.name] = initialData[field.name] || field.defaultValue || '';
    });
    setFormData(data);
  }, [initialData, fields]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            form="modal-form"
            disabled={loading || disabled}
            loading={loading}
          >
            {submitText}
          </Button>
        </>
      }
    >
      <form id="modal-form" onSubmit={handleSubmit} className="space-y-4">
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div key={field.name || index} className="space-y-1">
              {field.type !== 'checkbox' && (
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select {field.label}...</option>
                  {(field.options || []).map((option, idx) => (
                    <option key={idx} value={option.value || option}>
                      {option.label || option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows || 3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-light-text-primary dark:text-dark-text-primary">
                    {field.label}
                  </label>
                </div>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))
        ) : (
          children
        )}
      </form>
    </Modal>
  );
};

export { Modal };
export default Modal;