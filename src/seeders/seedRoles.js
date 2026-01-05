import { Role } from "../models/index.js";

export const seedRoles = async () => {
  await Role.bulkCreate([
    { name: "User", description: "Người dùng thông thường" },
    { name: "Admin", description: "Quản trị viên hệ thống" },
    { name: "Manager", description: "Quản lý cấp trung" },
  ]);
};
