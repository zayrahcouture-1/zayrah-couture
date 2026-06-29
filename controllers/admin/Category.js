const Category = require("../../models/Category");
const Product = require("../../models/Product");
const cloudinary = require("../../config/cloudinary");

const generateUniqueCategorySlug = async (name, excludeId = null) => {
  const baseSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
  let slug = baseSlug;
  let count = 1;
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Category.findOne(query);
    if (!existing) {
      break;
    }
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
};

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
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (cloudinaryErr) {
          console.error("Cloudinary cleanup error:", cloudinaryErr);
        }
      }
      return res.render("admin/categories/add", {
        error: "Category already exists",
      });
    }

    if (!req.file) {
      return res.render("admin/categories/add", {
        error: "Category image is required",
      });
    }

    if (isFeatured === "on") {
      const featuredCount = await Category.countDocuments({ isFeatured: true });
      if (featuredCount >= 5) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (cloudinaryErr) {
          console.error("Cloudinary cleanup error:", cloudinaryErr);
        }
        return res.render("admin/categories/add", {
          error: "Cannot feature more than 5 categories",
        });
      }
    }

    let variants = [];
    if (req.body.variantNames && req.body.variantOptions) {
      const names = Array.isArray(req.body.variantNames) ? req.body.variantNames : [req.body.variantNames];
      const optionsList = Array.isArray(req.body.variantOptions) ? req.body.variantOptions : [req.body.variantOptions];

      for (let i = 0; i < names.length; i++) {
        const nameVal = names[i].trim();
        const optionsString = optionsList[i] || "";
        if (nameVal) {
          const options = optionsString
            .split(",")
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);
          variants.push({ name: nameVal, options });
        }
      }
    }

    if (variants.length === 0) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cloudinaryErr) {
        console.error("Cloudinary cleanup error:", cloudinaryErr);
      }
      return res.render("admin/categories/add", {
        error: "At least one category variant is required",
      });
    }

    const categoryData = {
      name,
      slug: await generateUniqueCategorySlug(name),
      description,
      isFeatured: isFeatured === "on",
      isListed: isListed === "on",
      variants,
    };

    categoryData.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await Category.create(categoryData);

    res.redirect("/admin/categories?success=Category added successfully");
  } catch (error) {
    console.log(error);
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cloudinaryErr) {
        console.error("Cloudinary cleanup error:", cloudinaryErr);
      }
    }
    res.redirect("/admin/categories?error=Failed to add category");
  }
};

const toggleStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      return res.redirect("/admin/categories?error=Category not found");
    }

    category.isListed = !category.isListed;
    await category.save();

    if (!category.isListed) {
      await Product.updateMany({ category: category._id }, { isListed: false });
    }

    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, message: "Category status updated" });
    }
    res.redirect("/admin/categories?success=Category status updated");
  } catch (error) {
    console.log(error);
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(500).json({ success: false, message: "Failed to update category status" });
    }
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
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (cloudinaryErr) {
          console.error("Cloudinary cleanup error:", cloudinaryErr);
        }
      }
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(400).json({ success: false, error: "A category with this name already exists" });
      }
      return res.render("admin/categories/edit", {
        category,
        error: "A category with this name already exists",
      });
    }

    if (isFeatured === "on" && !category.isFeatured) {
      const featuredCount = await Category.countDocuments({ isFeatured: true });
      if (featuredCount >= 5) {
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(req.file.filename);
          } catch (cloudinaryErr) {
            console.error("Cloudinary cleanup error:", cloudinaryErr);
          }
        }
        if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
          return res.status(400).json({ success: false, error: "Cannot feature more than 5 categories" });
        }
        return res.render("admin/categories/edit", {
          category,
          error: "Cannot feature more than 5 categories",
        });
      }
    }

    let variants = [];
    if (req.body.variantNames && req.body.variantOptions) {
      const names = Array.isArray(req.body.variantNames) ? req.body.variantNames : [req.body.variantNames];
      const optionsList = Array.isArray(req.body.variantOptions) ? req.body.variantOptions : [req.body.variantOptions];

      for (let i = 0; i < names.length; i++) {
        const nameVal = names[i].trim();
        const optionsString = optionsList[i] || "";
        if (nameVal) {
          const options = optionsString
            .split(",")
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);
          variants.push({ name: nameVal, options });
        }
      }
    }

    category.name = name.trim();
    category.slug = await generateUniqueCategorySlug(name, category._id);
    category.description = description || "";
    category.isFeatured = isFeatured === "on";
    category.isListed = isListed === "on";
    category.variants = variants;

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

    if (!category.isListed) {
      await Product.updateMany({ category: category._id }, { isListed: false });
    }

    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, message: "Category updated successfully" });
    }
    res.redirect("/admin/categories?success=Category updated successfully");
  } catch (error) {
    console.log(error);
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(500).json({ success: false, error: "Failed to update category" });
    }
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
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      return res.redirect("/admin/categories?error=Category not found");
    }

    if (!category.isFeatured) {
      const featuredCount = await Category.countDocuments({ isFeatured: true });
      if (featuredCount >= 5) {
        if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
          return res.status(400).json({ success: false, message: "Cannot feature more than 5 categories" });
        }
        return res.redirect("/admin/categories?error=Cannot feature more than 5 categories");
      }
    }

    category.isFeatured = !category.isFeatured;
    await category.save();

    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, message: "Category featured status updated" });
    }
    res.redirect("/admin/categories?success=Category featured status updated");
  } catch (error) {
    console.log(error);
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(500).json({ success: false, message: "Failed to update category featured status" });
    }
    res.redirect("/admin/categories?error=Failed to update category featured status");
  }
};

const checkDuplicate = async (req, res) => {
  try {
    const { name, id } = req.body;
    if (!name) {
      return res.json({ exists: false });
    }

    const query = {
      name: name.trim()
    };

    if (id) {
      query._id = { $ne: id };
    }

    const existingCategory = await Category.findOne(query);
    return res.json({ exists: !!existingCategory });
  } catch (error) {
    console.error("Error checking duplicate category name:", error);
    return res.status(500).json({ error: "Server error" });
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
  checkDuplicate,
};
