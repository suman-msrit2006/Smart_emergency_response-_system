import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: '✓',
          progress: 'bg-green-300',
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: '✕',
          progress: 'bg-red-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: '⚠',
          progress: 'bg-yellow-300',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: 'ℹ',
          progress: 'bg-blue-300',
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className={`${styles.bg} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}
      role="alert"
    >
      <span className="text-2xl font-bold">{styles.icon}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-xl font-bold"
        aria-label="Close"
      >
        ×
      </button>
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 w-full overflow-hidden rounded-b-lg">
          <div 
            className={`h-full ${styles.progress} animate-shrink`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}
