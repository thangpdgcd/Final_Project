import {
  getAllUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
  type User,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../../../api/userApi";

export type AdminFormValues = {
  name: string;
  email: string;
  address?: string;
  phoneNumber?: string;
  roleID: string;
  status?: "active" | "inactive";
};

export const getDisplayId = (record: any): number => {
  if (!record) throw new Error("Invalid record.");

  const id = Number(record?.user_ID ?? 0);

  if (!id || isNaN(id)) {
    console.warn("Invalid user_ID in record:", record);
    throw new Error("Invalid user_ID.");
  }

  return id;
};

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

export const normalizeUser = (u: any): User & any => ({
  ...u,
  user_ID: Number(u?.user_ID ?? 0),
  id: Number(u?.user_ID ?? 0),
  username: u?.username ?? u?.name ?? "",
  roleID: normalizeRoleID(u?.roleID ?? u?.role ?? 1),
  status: u?.status ?? "inactive",
  email: u?.email ?? "",
  phoneNumber: u?.phoneNumber ?? "",
});

export async function fetchUsers(): Promise<User[]> {
  const list = await getAllUsers();
  return Array.isArray(list) ? list.map(normalizeUser) : [];
}

export async function createUser(values: AdminFormValues) {
  const payload: CreateUserPayload = {
    username: values.name,
    email: values.email,
    password: "123456",
    roleID: normalizeRoleID(values.roleID),
  };
  return apiCreateUser(payload);
}

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

  Object.keys(payload).forEach((k) => {
    const key = k as keyof UpdateUserPayload;
    if (payload[key] === undefined) delete payload[key];
  });

  console.log("🟡 PUT /users/:id", id, payload);
  return apiUpdateUser(id, payload);
}

export async function removeUser(idOrUser: any) {
  const id = getDisplayId(idOrUser);
  console.log("🔴 DELETE /users/:id", id);
  return apiDeleteUser(id);
}

export function roleToLabel(roleID: any) {
  const r = normalizeRoleID(roleID);
  if (r === 1) return { color: "blue", text: "User" };
  if (r === 2) return { color: "green", text: "Manager" };
  if (r === 3) return { color: "red", text: "Admin" };
  return { color: "default", text: "Unknown" };
}
