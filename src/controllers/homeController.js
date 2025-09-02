// controllers/homeController.js
export const homePage = (req, res) => {
  res.render("/", { user: req.user });
};
