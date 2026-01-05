import { register } from "../../../api/authApi";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  User,
} from "../../../api/userApi";

/** Quy ước: 1 = User, 2 = Admin */
export const ROLE = {
  USER: 1,
  ADMIN: 2,
} as const;

export type RoleID = (typeof ROLE)[keyof typeof ROLE];

export type UserFormValues = {
  name: string; // bạn đang dùng name trong form
  email: string;
  password?: string;
  roleID: RoleID; // 1 | 2
};

/** ✅ pick string đầu tiên không rỗng */
const pickFirstNonEmptyString = (...vals: any[]) => {
  for (const v of vals) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
};

/** ✅ FIX: Backend trả user_ID => ưu tiên user_ID */
export const getIdString = (record: any): string => {
  if (!record) return "";
  return pickFirstNonEmptyString(record?.user_ID, record?.id, record?._id);
};

/** ✅ id hiển thị dạng number nếu convert được */
export const getDisplayId = (record: any): number => {
  const s = getIdString(record);
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** ✅ Normalize roleID */
export const getRoleId = (record: any): RoleID => {
  const raw = record?.roleID ?? record?.roleId ?? record?.role ?? ROLE.USER;
  const n = Number(String(raw).trim());
  return n === ROLE.ADMIN ? ROLE.ADMIN : ROLE.USER;
};

// LOAD USERS
export async function fetchUsersService(): Promise<User[]> {
  const list = await getAllUsers();
  return Array.isArray(list) ? list : [];
}

// CREATE USER (POST /api/register)
export async function createUserService(values: UserFormValues) {
  const role: RoleID =
    Number(values.roleID) === ROLE.ADMIN ? ROLE.ADMIN : ROLE.USER;

  const payload = {
    name: values.name,
    email: values.email,
    password: values.password || "",
    address: "",
    phoneNumber: "",
    roleID: String(role),
  };

  return register(payload);
}

// UPDATE USER (PUT /api/users/:id)
// UPDATE USER (PUT /api/users/:id) — forward payload từ UI
export async function updateUserService(id: string, payload: any) {
  const idStr = String(id ?? "").trim();
  const idNum = Number(idStr);

  if (!Number.isFinite(idNum) || idNum <= 0) {
    console.warn("⚠️ updateUserService: id không hợp lệ:", { id, idStr });
    throw new Error("Không tìm thấy user_ID hợp lệ để cập nhật.");
  }

  // ✅ roleID luôn ép về number 1|2 (tránh backend nhận string)
  if (payload?.roleID != null) {
    payload.roleID = Number(payload.roleID) === 2 ? 2 : 1;
  }

  // ✅ nếu status có thể bị undefined thì bỏ đi
  if (payload?.status == null) delete payload.status;

  return updateUser(idNum, payload);
}

// DELETE USER (DELETE /api/users/:id)
export async function deleteUserService(id: string) {
  const idStr = String(id ?? "").trim();
  const idNum = Number(idStr);

  if (!Number.isFinite(idNum) || idNum <= 0) {
    console.warn("⚠️ deleteUserService: id không hợp lệ:", { id, idStr });
    throw new Error("Không tìm thấy user_ID hợp lệ để xóa.");
  }

  return deleteUser(idNum);
}
