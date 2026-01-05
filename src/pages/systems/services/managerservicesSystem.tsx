import {
  getAllUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
  type User,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../../../api/userApi";

// ==================== TYPES ====================
export type AdminFormValues = {
  name: string;
  email: string;
  address?: string;
  phoneNumber?: string;
  roleID: string; // "1" | "2" | "3"
  status?: "active" | "inactive";
};

// ==================== HELPERS ====================

// ✅ Lấy đúng user_ID từ backend
export const getDisplayId = (record: any): number => {
  if (!record) throw new Error("Record không hợp lệ.");

  // ưu tiên mọi key có thể chứa ID
  const id = Number(record?.user_ID ?? 0);

  if (!id || isNaN(id)) {
    console.warn("⚠️ Không tìm thấy user_ID hợp lệ trong record:", record);
    throw new Error("Không tìm thấy user_ID hợp lệ.");
  }

  return id;
};

// ✅ Chuẩn hóa roleID về dạng số
export const normalizeRoleID = (raw: any): number => {
  const r = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (r === "1" || raw === 1) return 1;
  if (r === "2" || raw === 2) return 2;
  if (r === "3" || raw === 3) return 3;
  if (r === "user") return 1;
  if (r === "manager") return 2;
  if (r === "admin") return 3;
  return 1;
};

// ✅ Chuẩn hóa dữ liệu user từ BE trả về
export const normalizeUser = (u: any): User & any => ({
  ...u,
  user_ID: Number(u?.user_ID ?? 0),
  id: Number(u?.user_ID ?? 0), // để Table hiển thị key
  username: u?.username ?? u?.name ?? "",
  roleID: normalizeRoleID(u?.roleID ?? u?.role ?? 1),
  status: u?.status ?? "inactive",
  email: u?.email ?? "",
  phoneNumber: u?.phoneNumber ?? "",
});

// ==================== SERVICE ====================

// ✅ Lấy danh sách user
export async function fetchUsers(): Promise<User[]> {
  const list = await getAllUsers();
  return Array.isArray(list) ? list.map(normalizeUser) : [];
}

// ✅ Tạo user mới
export async function createUser(values: AdminFormValues) {
  const payload: CreateUserPayload = {
    username: values.name,
    email: values.email,
    password: "123456", // mặc định
    roleID: normalizeRoleID(values.roleID),
  };
  return apiCreateUser(payload);
}

// ✅ Cập nhật user
export async function editUser(
  idOrUser: any,
  values: Partial<AdminFormValues>
) {
  const id = getDisplayId(idOrUser);

  const payload: UpdateUserPayload = {
    username: values.name,
    email: values.email,
    roleID:
      values.roleID !== undefined ? normalizeRoleID(values.roleID) : undefined,
  };

  // xóa field undefined để không ghi đè
  Object.keys(payload).forEach((k) => {
    const key = k as keyof UpdateUserPayload;
    if (payload[key] === undefined) delete payload[key];
  });

  console.log("🟡 PUT /users/:id", id, payload);
  return apiUpdateUser(id, payload);
}

// ✅ Xóa user
export async function removeUser(idOrUser: any) {
  const id = getDisplayId(idOrUser);
  console.log("🔴 DELETE /users/:id", id);
  return apiDeleteUser(id);
}

// ✅ UI Role label
export function roleToLabel(roleID: any) {
  const r = normalizeRoleID(roleID);
  if (r === 1) return { color: "blue", text: "User" };
  if (r === 2) return { color: "green", text: "Manager" };
  if (r === 3) return { color: "red", text: "Admin" };
  return { color: "default", text: "Unknown" };
}
