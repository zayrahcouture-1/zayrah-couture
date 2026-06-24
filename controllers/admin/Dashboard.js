const Product = require("../../models/Product");
const Category = require("../../models/Category");

const loadDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Fetch the latest 5 products, populated with their category name
    const latestProducts = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.render("admin/dashboard", {
      totalProducts,
      totalCategories,
      totalOrders: 0,
      latestProducts,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/login?error=Failed to load dashboard");
  }
};

module.exports = {
  loadDashboard,
};