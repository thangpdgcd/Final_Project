/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    // This project uses ESM (`"type": "module"`). sequelize-cli/umzug loads seeders via CJS,
    // so we must use dynamic `import()` to call ESM seed logic.
    const mod = await import("../scripts/seedChat.js");
    if (typeof mod.seedChat !== "function") {
      throw new Error("seedChat export not found in ../scripts/seedChat.js");
    }
    await mod.seedChat();
  },

  async down() {
    // No-op: seeded chat is idempotent and safe to keep.
  },
};

