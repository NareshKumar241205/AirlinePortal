import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

// Input component with validation
export const FormInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  validation,
  options = [],
  rows = 3,
  value,
  onChange,
  error,
  disabled = false,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors duration-200 
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
    }
    ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-900'}
    text-light-text-primary dark:text-dark-text-primary
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${className}
  `;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={inputClasses}
          >
            <option value="">Select an option...</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={`${inputClasses} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={name}
              checked={value || false}
              onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-light-text-primary dark:text-dark-text-primary">
              {label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  name={name}
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  onChange={onChange}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-light-text-primary dark:text-dark-text-primary">
                  {option.label || option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClasses}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {error && (
          <div className="flex items-center space-x-1 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && type !== 'checkbox' && (
        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <div className="flex items-center space-x-1 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Form validation utility functions
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },

  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Please enter a valid number';
    }
    return null;
  },

  phone: (value) => {
    if (value && !/^[+]?[1-9]?[0-9]{7,15}$/.test(value.replace(/\\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  }
};

// Enhanced Form Modal with validation
export const EnhancedFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields = [],
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  size = 'md',
  initialData = {}
}) => {
  const [formData, setFormData] = useState(() => {
    const data = {};
    fields.forEach(field => {
      data[field.name] = initialData[field.name] || field.defaultValue || '';
    });
    return data;
  });

  const [errors, setErrors] = useState({});

  // Update form data when initialData changes
  React.useEffect(() => {
    const data = {};
    fields.forEach(field => {
      data[field.name] = initialData[field.name] || field.defaultValue || '';
    });
    setFormData(data);
  }, [initialData, fields]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateField = (field, value) => {
    const fieldErrors = [];
    
    // Required validation
    if (field.required) {
      const requiredError = validators.required(value);
      if (requiredError) fieldErrors.push(requiredError);
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !field.required) return null;
    
    // Custom validation
    if (field.validation) {
      if (Array.isArray(field.validation)) {
        field.validation.forEach(validator => {
          const error = validator(value);
          if (error) fieldErrors.push(error);
        });
      } else {
        const error = field.validation(value);
        if (error) fieldErrors.push(error);
      }
    }
    
    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return fields.every(field => {
      return !validateField(field, formData[field.name]);
    });
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
            form="enhanced-form"
            disabled={loading || !isFormValid()}
            loading={loading}
          >
            {submitText}
          </Button>
        </>
      }
    >
      <form id="enhanced-form" onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, index) => (
          <FormInput
            key={field.name || index}
            {...field}
            value={formData[field.name] || ''}
            onChange={handleInputChange}
            error={errors[field.name]}
          />
        ))}
      </form>
    </Modal>
  );
};

// Form builder hook for easier form management
export const useForm = (initialData = {}, validationRules = {}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = (name, value) => {
    setData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when value changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const setError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const rules = validationRules[fieldName];
      const value = data[fieldName];
      
      if (Array.isArray(rules)) {
        for (const rule of rules) {
          const error = rule(value);
          if (error) {
            newErrors[fieldName] = error;
            break;
          }
        }
      } else {
        const error = rules(value);
        if (error) {
          newErrors[fieldName] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = (newData = initialData) => {
    setData(newData);
    setErrors({});
    setTouched({});
  };

  return {
    data,
    errors,
    touched,
    setValue,
    setError,
    clearErrors,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

export default FormInput;