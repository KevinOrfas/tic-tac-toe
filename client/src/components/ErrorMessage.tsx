import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className={styles['error-message']}>
      <span className={styles['error-message__text']}>
        <strong>⚠️</strong> {message}
      </span>
      <button
        onClick={onDismiss}
        className={styles['error-message__close-button']}
      >
        ×
      </button>
    </div>
  );
}
