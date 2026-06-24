const Category = require("../../models/Category");
const cloudinary = require("../../config/cloudinary");

const loadCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      createdAt: -1,
    });

    res.render("admin/categories/list", {
      categories,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadAddCategory = (req, res) => {
  res.render("admin/categories/add", {
    error: req.query.error || null,
  });
};

const addCategory = async (req, res) => {
  try {
    const { name, description, isFeatured, isListed } = req.body;

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.render("admin/categories/add", {
        error: "Category already exists",
      });
    }

    const categoryData = {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description,
      isFeatured: isFeatured === "on",
      isListed: isListed === "on",
    };

    if (req.file) {
      categoryData.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await Category.create(categoryData);

    res.redirect("/admin/categories?success=Category added successfully");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/categories?error=Failed to add category");
  }
};

const toggleStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect("/admin/categories?error=Category not found");
    }

    category.isListed = !category.isListed;
    await category.save();

    res.redirect("/admin/categories?success=Category status updated");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/categories?error=Failed to update category status");
  }
};

const loadEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect("/admin/categories?error=Category not found");
    }

    res.render("admin/categories/edit", {
      category,
      error: req.query.error || null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/categories?error=Failed to load category");
  }
};

const editCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect("/admin/categories?error=Category not found");
    }

    const { name, description, isFeatured, isListed, removeImage } = req.body;

    // Check for duplicate name (excluding current category)
    const existingCategory = await Category.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });

    if (existingCategory) {
      return res.render("admin/categories/edit", {
        category,
        error: "A category with this name already exists",
      });
    }

    category.name = name.trim();
    category.slug = name.toLowerCase().replace(/\s+/g, "-");
    category.description = description || "";
    category.isFeatured = isFeatured === "on";
    category.isListed = isListed === "on";

    // Handle image: new upload replaces old
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (category.image && category.image.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }
      category.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    } else if (removeImage === "true") {
      // User removed the image without uploading a new one
      if (category.image && category.image.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }
      category.image = { url: "", public_id: "" };
    }

    await category.save();

    res.redirect("/admin/categories?success=Category updated successfully");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/categories?error=Failed to update category");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect("/admin/categories?error=Category not found");
    }

    if (category.image && category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.redirect("/admin/categories?success=Category deleted successfully");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/categories?error=Failed to delete category");
  }
};

const toggleFeatured = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect("/admin/categories?error=Category not found");
    }

    category.isFeatured = !category.isFeatured;
    await category.save();

    res.redirect("/admin/categories?success=Category featured status updated");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/categories?error=Failed to update category featured status");
  }
};

module.exports = {
  loadCategories,
  loadAddCategory,
  addCategory,
  toggleStatus,
  toggleFeatured,
  loadEditCategory,
  editCategory,
  deleteCategory,
};
