import React from 'react';
import { MessageCircle } from 'lucide-react';

type Props = {
  unreadCount: number;
  onClick: () => void;
};

export const SupportWidgetButton: React.FC<Props> = ({ unreadCount, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-4 right-4 z-[60] h-14 w-14 rounded-full bg-[#1877f2] text-white shadow-lg shadow-black/30 hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
      aria-label="Open support chat"
    >
      <span className="grid place-items-center">
        <MessageCircle size={22} />
      </span>

      {unreadCount > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold grid place-items-center ring-2 ring-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </button>
  );
};

