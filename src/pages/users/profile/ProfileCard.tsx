import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/store/themes/ThemeContext';
import AvatarSection from './AvatarSection';
import ProfileInfo from './ProfileInfo';
import ProfileActions from './ProfileActions';
import ProfileSkeleton from './ProfileSkeleton';
import { getAvatarImageSrc } from '@/utils/images/image';
import type { AuthUser } from '@/types/index';

export interface ProfileCardProps {
  user: AuthUser | null;
  previewAvatar: string | null;
  isEditing: boolean;
  isLoading: boolean;
  currentTab: string;
  ordersCount: number;
  voucherCount: number;
  onAvatarClick: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onMessage?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  previewAvatar,
  isEditing,
  isLoading,
  currentTab,
  ordersCount,
  voucherCount,
  onAvatarClick,
  onEdit,
  onSave,
  onCancel,
  onMessage,
}) => {
  const { dark } = useTheme();
  const showSkeleton = !user;
  const avatarSrc = getAvatarImageSrc(previewAvatar || user?.avatar);

  return (
    <AnimatePresence mode="wait">
      {showSkeleton ? (
        <ProfileSkeleton key="skeleton" />
      ) : (
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: dark ? '#1c1b1b' : '#ffffff',
            boxShadow: dark ? 'none' : '0 2px 24px rgba(0,0,0,0.06)',
            transition: 'background 0.4s ease',
          }}
          className="rounded-2xl p-6 sm:p-8"
        >
          {/*
            Responsive layout:
            - Mobile/Tablet (<lg): stacked, centered
            - Desktop (lg+):       side-by-side, left-aligned
          */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start">
            {/* Avatar */}
            <AvatarSection src={avatarSrc} onClick={onAvatarClick} size="lg" />

            {/* Info + Actions */}
            <div className="flex flex-col gap-5 text-center lg:text-left w-full min-w-0">
              <ProfileInfo
                name={user.name}
                email={user.email}
                roleID={user.roleID as string | number}
                ordersCount={ordersCount}
                voucherCount={voucherCount}
              />

              <ProfileActions
                isEditing={isEditing}
                isLoading={isLoading}
                currentTab={currentTab}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                onMessage={onMessage}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileCard;
