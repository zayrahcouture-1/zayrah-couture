const isAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }
    return res.redirect("/admin/login");
  }

  next();
};

module.exports = isAdmin;