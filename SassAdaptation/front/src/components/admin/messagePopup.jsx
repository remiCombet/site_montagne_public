import { useEffect } from 'react';

const MessagePopup = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <>
      <aside className="popup-overlay" role="dialog" aria-modal="true" />
      <article className={`message-popup ${type}`} role="alert">
        <p className="message-text">{message}</p>
      </article>
    </>
  );
};

export default MessagePopup;