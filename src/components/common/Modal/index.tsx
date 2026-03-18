import React from "react";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className='common-modal-backdrop' onClick={onClose}>
      <div
        className='common-modal'
        onClick={(e) => {
          e.stopPropagation();
        }}>
        {title && <div className='common-modal__header'>{title}</div>}
        <div className='common-modal__body'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;

