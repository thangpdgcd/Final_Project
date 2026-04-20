export type SupportChatRole = 'customer' | 'staff';

const normalizeRole = (roleID: unknown): 'admin' | 'staff' | 'user' => {
  const raw = String(roleID ?? '')
    .toLowerCase()
    .trim();
  // Backend convention: 1=customer, 2=admin, 3=staff
  if (raw === 'admin' || raw === '2') return 'admin';
  if (raw === 'staff' || raw === '3') return 'staff';
  return 'user';
};

export const getSupportChatRole = (
  user: { roleID?: unknown } | null | undefined,
): SupportChatRole => {
  const r = normalizeRole(user?.roleID);
  return r === 'staff' || r === 'admin' ? 'staff' : 'customer';
};
