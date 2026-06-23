const loadLogin = (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect("/admin/dashboard");
  }

  res.render("admin/auth/login", {
    error: null,
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("admin/auth/login", {
      error: "Please enter email and password",
    });
  }

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.render("admin/auth/login", {
      error: "Invalid email or password",
    });
  }

  req.session.isAdmin = true;

  return res.redirect("/admin/dashboard");
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

module.exports = {
  loadLogin,
  login,
  logout,
};