const loadDashboard = (req, res) => {
  res.render("admin/dashboard", {
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
  });
};

module.exports = {
  loadDashboard,
};