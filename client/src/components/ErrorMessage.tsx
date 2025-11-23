interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div
      style={{
        backgroundColor: '#fee',
        border: '1px solid #f88',
        borderRadius: '4px',
        padding: '12px',
        margin: '12px 0',
        color: '#c33',
      }}
    >
      <strong>Error:</strong> {message}
      <button
        onClick={onDismiss}
        style={{
          marginLeft: '8px',
          background: 'transparent',
          border: 'none',
          color: '#c33',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        ×
      </button>
    </div>
  );
}
