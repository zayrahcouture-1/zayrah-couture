const Product = require("../../models/Product");
const Category = require("../../models/Category");
const cloudinary = require("../../config/cloudinary");

// Load all products with category data populated
const loadProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.render("admin/products/list", {
      products,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/dashboard?error=Failed to load products page");
  }
};

// Render Add Product Form
const loadAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true }).sort({ name: 1 });

    res.render("admin/products/add", {
      categories,
      error: req.query.error || null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/products?error=Failed to load add product page");
  }
};

// Handle Add Product Submission
const addProduct = async (req, res) => {
  try {
    const { name, category, description, price, discountPrice, stock, isFeatured, isListed } = req.body;
    const categories = await Category.find({ isListed: true }).sort({ name: 1 });

    // Validate duplicate name
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.render("admin/products/add", {
        categories,
        error: "Product already exists",
      });
    }

    const productData = {
      name: name.trim(),
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      category,
      description: description || "",
      price: parseFloat(price) || 0,
      discountPrice: discountPrice ? parseFloat(discountPrice) : 0,
      stock: parseInt(stock) || 0,
      isFeatured: isFeatured === "on",
      isListed: isListed === "on",
      images: [],
    };

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    await Product.create(productData);

    res.redirect("/admin/products?success=Product added successfully");
  } catch (error) {
    console.log(error);
    const categories = await Category.find({ isListed: true }).sort({ name: 1 });
    res.render("admin/products/add", {
      categories,
      error: "Failed to create product",
    });
  }
};

// Toggle product listed state
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect("/admin/products?error=Product not found");
    }

    product.isListed = !product.isListed;
    await product.save();

    res.redirect("/admin/products?success=Product status updated");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/products?error=Failed to update product status");
  }
};

// Toggle product featured state
const toggleProductFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect("/admin/products?error=Product not found");
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.redirect("/admin/products?success=Product featured status updated");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/products?error=Failed to update product featured status");
  }
};

// Render Edit Product Form
const loadEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.redirect("/admin/products?error=Product not found");
    }

    const categories = await Category.find({ isListed: true }).sort({ name: 1 });

    res.render("admin/products/edit", {
      product,
      categories,
      error: req.query.error || null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/products?error=Failed to load edit product page");
  }
};

// Handle Edit Product Submission
const editProduct = async (req, res) => {
  let product;
  try {
    product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect("/admin/products?error=Product not found");
    }

    const { name, category, description, price, discountPrice, stock, isFeatured, isListed, removedImages } = req.body;
    const categories = await Category.find({ isListed: true }).sort({ name: 1 });

    // Validate duplicate name excluding current product
    const existingProduct = await Product.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });

    if (existingProduct) {
      return res.render("admin/products/edit", {
        product,
        categories,
        error: "A product with this name already exists",
      });
    }

    // Handle deleted images
    if (removedImages) {
      const idsToRemove = removedImages.split(",").filter((id) => id.trim().length > 0);
      for (const public_id of idsToRemove) {
        try {
          await cloudinary.uploader.destroy(public_id);
          product.images = product.images.filter((img) => img.public_id !== public_id);
        } catch (err) {
          console.log("Cloudinary image deletion error:", err);
        }
      }
    }

    // Handle newly uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      product.images.push(...newImages);
    }

    product.name = name.trim();
    product.slug = name.toLowerCase().replace(/\s+/g, "-");
    product.category = category;
    product.description = description || "";
    product.price = parseFloat(price) || 0;
    product.discountPrice = discountPrice ? parseFloat(discountPrice) : 0;
    product.stock = parseInt(stock) || 0;
    product.isFeatured = isFeatured === "on";
    product.isListed = isListed === "on";

    await product.save();

    res.redirect("/admin/products?success=Product updated successfully");
  } catch (error) {
    console.log(error);
    const categories = await Category.find({ isListed: true }).sort({ name: 1 });
    res.render("admin/products/edit", {
      product: product || {},
      categories,
      error: "Failed to update product details",
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect("/admin/products?error=Product not found");
    }

    // Clean up images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (err) {
            console.log("Cloudinary destroy error:", err);
          }
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.redirect("/admin/products?success=Product deleted successfully");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/products?error=Failed to delete product");
  }
};

module.exports = {
  loadProducts,
  loadAddProduct,
  addProduct,
  toggleProductStatus,
  toggleProductFeatured,
  loadEditProduct,
  editProduct,
  deleteProduct,
};
