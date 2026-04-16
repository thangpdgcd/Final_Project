import type { ChatRole } from '../types';

const normalizeRole = (roleID: unknown): ChatRole => {
  const raw = String(roleID ?? '').toLowerCase().trim();
  if (raw === 'admin' || raw === '1') return 'admin';
  if (raw === 'staff' || raw === '2') return 'staff';
  return 'user';
};

export const isAdmin = (user: { roleID?: unknown } | null | undefined) => normalizeRole(user?.roleID) === 'admin';

export const toChatUserRef = (user: { user_ID: number; name: string; roleID?: unknown }): {
  id: string;
  name: string;
  role: ChatRole;
} => ({
  id: String(user.user_ID),
  name: user.name || `user${user.user_ID}`,
  role: normalizeRole(user.roleID),
});

