import authService from "../service/authService.js";

let registerUser = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, password, roleID } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Tên, Email và mật khẩu là bắt buộc." });
    }
    const finalRoleID =
      roleID !== undefined && roleID !== null && `${roleID}`.trim() !== ""
        ? String(roleID)
        : "1";

    const userData = await authService.registerUser({
      name,
      email,
      address,
      phoneNumber,
      password,
      roleID: finalRoleID,
    });

    console.log("✅ Người dùng đã đăng ký thành công:", userData);
    return res
      .status(201)
      .json({ message: "Đăng ký thành công", user: userData });
  } catch (error) {
    console.error("❌ Lỗi register:", error);
    return res.status(400).json({ message: error.message });
  }
};

let login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
  }
  console.log("🔑 Thông tin đăng nhập:", { email, password: "[Đã ẩn]" });
  try {
    const result = await authService.login(email, password);
    return res.status(200).json({ message: "Đăng nhập thành công", ...result });
  } catch (error) {
    console.error("❌ Lỗi login:", error);

    return res.status(401).json({ message: error.message });
  }
};

let showLoginPage = (_, res) => {
  res.render("login", { message: null });
};

let loginEJS = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", { message: "Email và mật khẩu là bắt buộc." });
  }

  try {
    const { token, user } = await authService.login(email, password);

    // Lưu vào session
    req.session.user = user;
    req.session.token = token;

    // Chuyển hướng sang trang homeapi
    return res.redirect("/");
  } catch (error) {
    return res.render("login", { message: error.message });
  }
};

let showRegisterPage = (_, res) => {
  res.render("register", { message: null });
};

let registerEJS = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, password, roleID } = req.body;

    if (!name || !email || !password) {
      return res.render("register", {
        message: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    const allowedRoles = ["1", "2", "3"];
    const validatedRole = allowedRoles.includes(roleID) ? roleID : "1"; // default là "1" (user)

    await authService.register({
      name,
      email,
      address,
      phoneNumber,
      password,
      role: validatedRole,
    });

    return res.redirect("/login"); // Chuyển đến trang login sau khi đăng ký
  } catch (error) {
    return res.render("register", { message: error.message });
  }
};

export default {
  registerUser,
  login,
  showLoginPage,
  loginEJS,
  showRegisterPage,
  registerEJS,
};
