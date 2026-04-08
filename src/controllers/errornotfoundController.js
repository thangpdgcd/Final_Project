// controllers/homeController.js
export const notfoundPage = (req, res) => {
  res.render("notfound", { user: req.user });
};
