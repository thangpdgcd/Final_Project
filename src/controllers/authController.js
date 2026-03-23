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
        : "1"; // role.user , roleId.user

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
    const { token, user } = result;

    // HttpOnly cookie - JavaScript không đọc được, không lưu localStorage
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/",
    });

    // Trả user. Token KHÔNG trả trong body → frontend không lưu localStorage được.
    // Chỉ trả token khi có header X-Auth-Mode: bearer (Swagger/Postman test)
    const useCookieOnly = req.get("X-Auth-Mode") !== "bearer";
    const response = { message: "Đăng nhập thành công", user };
    if (!useCookieOnly) response.token = token;
    return res.status(200).json(response);
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
        message: "Please fill in all the information.",
      });
    }

    const allowedRoles = ["1", "2", "3"];
    const validatedRole = allowedRoles.includes(roleID) ? roleID : "1"; // default là "1" (user)

    await authService.registerUser({
      name,
      email,
      address,
      phoneNumber,
      password,
      roleID: validatedRole,
    });

    return res.redirect("/login"); // Chuyển đến trang login sau khi đăng ký
  } catch (error) {
    return res.render("register", { message: error.message });
  }
};

let getMe = (req, res) => {
  return res.status(200).json({ user: req.user });
};

let logout = (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  if (req.session) {
    req.session.destroy();
  }
  return res.status(200).json({ message: "Đăng xuất thành công." });
};

export default {
  registerUser,
  login,
  showLoginPage,
  loginEJS,
  showRegisterPage,
  registerEJS,
  getMe,
  logout,
};
