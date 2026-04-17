import db from "../models/index.js";

const { sequelize, Users } = db;

let ensureAvatarColumnPromise = null;

export const ensureAvatarColumn = async () => {
  if (!ensureAvatarColumnPromise) {
    ensureAvatarColumnPromise = (async () => {
      const qi = sequelize.getQueryInterface();
      const desc = await qi.describeTable("Users");
      if (!desc.avatar) {
        await qi.addColumn("Users", "avatar", {
          type: db.Sequelize.STRING(1024),
          allowNull: true,
        });
      }
    })();
  }
  await ensureAvatarColumnPromise;
};

export const setUserAvatar = async ({ userId, avatarUrl }) => {
  await ensureAvatarColumn();
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return null;
  const exists = await Users.findByPk(uid);
  if (!exists) return null;
  await sequelize.query(
    "UPDATE Users SET avatar = :avatar WHERE user_ID = :uid",
    {
      replacements: { avatar: String(avatarUrl ?? "").trim() || null, uid },
    },
  );
  return String(avatarUrl ?? "").trim() || null;
};

export const getUserAvatar = async (userId) => {
  await ensureAvatarColumn();
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return null;
  const [rows] = await sequelize.query(
    "SELECT avatar FROM Users WHERE user_ID = :uid LIMIT 1",
    {
      replacements: { uid },
    },
  );
  const avatar = rows?.[0]?.avatar;
  return typeof avatar === "string" && avatar.trim() ? avatar.trim() : null;
};

export default {
  ensureAvatarColumn,
  setUserAvatar,
  getUserAvatar,
};
