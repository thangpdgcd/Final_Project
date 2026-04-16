import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessageCircle, Pencil, Check, X } from 'lucide-react';

interface ProfileActionsProps {
  isEditing: boolean;
  isLoading: boolean;
  currentTab: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onMessage?: () => void;
}

const btnBase: React.CSSProperties = {
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.07em',
  borderRadius: '0.75rem',
  padding: '0.6rem 1.4rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  cursor: 'pointer',
  border: 'none',
  transition: 'box-shadow 0.3s ease-in-out',
};

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isEditing,
  isLoading,
  currentTab,
  onEdit,
  onSave,
  onCancel,
  onMessage,
}) => {
  if (currentTab !== 'profile') return null;

  return (
    <div className="flex items-center justify-center lg:justify-start flex-wrap gap-3">
      {/* Cancel — slides in from the left when editing */}
      <AnimatePresence>
        {isEditing && (
          <motion.button
            key="cancel"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onCancel}
            style={{
              ...btnBase,
              background: 'transparent',
              color: '#d1c5b6',
              border: '1px solid rgba(229,226,225,0.15)',
            }}
          >
            <X size={14} />
            HỦY
          </motion.button>
        )}
      </AnimatePresence>

      {/* Primary: Edit / Save */}
      <motion.button
        whileHover={{
          scale: 1.04,
          boxShadow: '0 8px 32px -8px #e5c18b50',
        }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        disabled={isLoading}
        onClick={isEditing ? onSave : onEdit}
        style={{
          ...btnBase,
          background: isEditing
            ? 'linear-gradient(135deg, #e5c18b, #c5a370)'
            : 'transparent',
          color: isEditing ? '#0e0e0e' : '#e5c18b',
          border: isEditing ? 'none' : '1px solid rgba(229,193,139,0.22)',
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isEditing ? (
          <Check size={14} />
        ) : (
          <Pencil size={14} />
        )}
        {isEditing ? 'LƯU THAY ĐỔI' : 'CHỈNH SỬA'}
      </motion.button>

      {/* Optional: Message */}
      {onMessage && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onClick={onMessage}
          style={{
            ...btnBase,
            background: 'transparent',
            color: '#d1c5b6',
            border: '1px solid rgba(229,226,225,0.15)',
          }}
        >
          <MessageCircle size={14} />
          TIN NHẮN
        </motion.button>
      )}
    </div>
  );
};

export default ProfileActions;
