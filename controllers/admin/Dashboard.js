const Product = require("../../models/Product");
const Category = require("../../models/Category");

const loadDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    res.render("admin/dashboard", {
      totalProducts,
      totalCategories,
      totalOrders: 0,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/login?error=Failed to load dashboard");
  }
};

module.exports = {
  loadDashboard,
};