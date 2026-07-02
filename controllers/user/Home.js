const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Settings = require("../../models/Settings");

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=600&h=800&fit=crop";

const formatProduct = (product) => {
  const price = product.price || 0;
  const salePrice = product.discountPrice > 0 ? product.discountPrice : null;
  const image =
    product.images && product.images[0] && product.images[0].url
      ? product.images[0].url
      : PLACEHOLDER_IMAGE;

  const displaySlug = product.sku ? `ZC-${product.sku}` : product.slug;

  return {
    id: product._id,
    name: product.name,
    slug: displaySlug,
    category:
      product.category && product.category.name
        ? product.category.name
        : "Collection",
    price,
    salePrice,
    image,
    hoverImage:
      product.images && product.images[1] && product.images[1].url
        ? product.images[1].url
        : image,
    stock: product.isListed ? (typeof product.stock === "number" ? product.stock : 0) : 0,
    inStock: product.isListed ? true : false,
    isFeatured: Boolean(product.isFeatured),
    isListed: Boolean(product.isListed),
    isNew:
      product.createdAt &&
      Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000,
    isSale: salePrice !== null && salePrice < price,
    badge: salePrice ? "SALE" : product.isFeatured ? "NEW" : null,
    createdAt: product.createdAt || new Date(),
  };
};

const mockFeaturedProducts = [
  {
    id: "1",
    name: "Silk Embroidered Abaya",
    slug: "silk-embroidered-abaya",
    category: "Luxury Collection",
    price: 289,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    isNew: true,
    isSale: false,
    badge: "NEW",
  },
  {
    id: "2",
    name: "Velvet Evening Gown",
    slug: "velvet-evening-gown",
    category: "Party Wear",
    price: 349,
    salePrice: 279,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop",
    isNew: false,
    isSale: true,
    badge: "SALE",
  },
  {
    id: "3",
    name: "Linen Modest Dress",
    slug: "linen-modest-dress",
    category: "Casual Collection",
    price: 159,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop",
    isNew: true,
    isSale: false,
    badge: "NEW",
  },
  {
    id: "4",
    name: "Pearl Detail Kaftan",
    slug: "pearl-detail-kaftan",
    category: "Ready To Wear",
    price: 219,
    salePrice: 189,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop",
    isNew: false,
    isSale: true,
    badge: "SALE",
  },
  {
    id: "5",
    name: "Chiffon Draped Set",
    slug: "chiffon-draped-set",
    category: "New Arrivals",
    price: 199,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop",
    isNew: true,
    isSale: false,
    badge: "NEW",
  },
  {
    id: "6",
    name: "Satin Wrap Dress",
    slug: "satin-wrap-dress",
    category: "Casual Collection",
    price: 175,
    salePrice: 149,
    image:
      "https://images.unsplash.com/photo-1585487000160-6eacfbeb0d88?w=600&h=800&fit=crop",
    isNew: false,
    isSale: true,
    badge: "SALE",
  },
  {
    id: "7",
    name: "Floral Print Maxi",
    slug: "floral-print-maxi",
    category: "Summer Sale",
    price: 129,
    salePrice: 99,
    image:
      "https://images.unsplash.com/photo-1572804013309-59aaffb0f731?w=600&h=800&fit=crop",
    isNew: false,
    isSale: true,
    badge: "SALE",
  },
  {
    id: "8",
    name: "Classic Tailored Coat",
    slug: "classic-tailored-coat",
    category: "Luxury Collection",
    price: 399,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1539008835657-9e8e96875907?w=600&h=800&fit=crop",
    isNew: true,
    isSale: false,
    badge: "NEW",
  },
];

const mockFeaturedCategories = [
  {
    title: "Casual Collection",
    subtitle: "Effortless everyday elegance",
    slug: "casual-collection",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
    size: "large",
  },
  {
    title: "Ready To Wear Collection",
    subtitle: "Curated pieces, ready for you",
    slug: "ready-to-wear",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop",
    size: "large",
  },
  {
    title: "Party Wear",
    subtitle: "Celebrate in style",
    slug: "party-wear",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=600&fit=crop",
    size: "medium",
  },
  {
    title: "Luxury Collection",
    subtitle: "Timeless refined pieces",
    slug: "luxury-collection",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop",
    size: "medium",
  },
  {
    title: "Sale Collection",
    subtitle: "Exclusive offers await",
    slug: "sale-collection",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
    size: "medium",
  },
];

const shopCategories = [
  { name: "Abayas", slug: "abayas" },
  { name: "Dresses", slug: "dresses" },
  { name: "Hijabs", slug: "hijabs" },
  { name: "Ready To Wear", slug: "ready-to-wear" },
  { name: "Party Wear", slug: "party-wear" },
  { name: "Luxury Collection", slug: "luxury-collection" },
];

const mockShopProducts = [
  ...mockFeaturedProducts,
  {
    id: "9",
    name: "Noor Pleated Abaya",
    slug: "noor-pleated-abaya",
    category: "Abayas",
    price: 6999,
    salePrice: 5499,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&h=900&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=900&fit=crop",
    stock: 8,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isSale: true,
    badge: "SALE",
    createdAt: "2026-06-12",
  },
  {
    id: "10",
    name: "Ivory Chiffon Hijab",
    slug: "ivory-chiffon-hijab",
    category: "Hijabs",
    price: 999,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1585487000160-6eacfbeb0d88?w=700&h=900&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&h=900&fit=crop",
    stock: 0,
    inStock: false,
    isFeatured: false,
    isNew: true,
    isSale: false,
    badge: "NEW",
    createdAt: "2026-06-18",
  },
  {
    id: "11",
    name: "Amani Satin Co-ord Set",
    slug: "amani-satin-coord-set",
    category: "Ready To Wear",
    price: 4499,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&h=900&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&h=900&fit=crop",
    stock: 14,
    inStock: true,
    isFeatured: true,
    isNew: true,
    isSale: false,
    badge: "NEW",
    createdAt: "2026-06-20",
  },
  {
    id: "12",
    name: "Zarina Beaded Evening Dress",
    slug: "zarina-beaded-evening-dress",
    category: "Party Wear",
    price: 11999,
    salePrice: 8999,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=700&h=900&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1539008835657-9e8e96875907?w=700&h=900&fit=crop",
    stock: 5,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isSale: true,
    badge: "SALE",
    createdAt: "2026-05-28",
  },
].map((product, index) => ({
  stock: index % 5 === 0 ? 0 : 10 + index,
  inStock: index % 5 !== 0,
  isFeatured: index % 3 === 0 || Boolean(product.isFeatured),
  hoverImage: product.hoverImage || product.image,
  createdAt: product.createdAt || new Date(Date.now() - index * 86400000),
  ...product,
}));

const mockInstagramPosts = [
  {
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
    isReel: true,
    link: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1572804013309-59aaffb0f731?w=400&h=400&fit=crop",
    isReel: true,
    link: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=400&h=400&fit=crop",
    isReel: true,
    link: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
    isReel: false,
    link: "#",
  },
];

const mockBlogPosts = [
  {
    title: "The Art of Modest Fashion in Modern Times",
    excerpt:
      "Explore how contemporary modest fashion blends tradition with runway-inspired silhouettes for the modern woman.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
    date: "Jun 12, 2026",
    slug: "art-of-modest-fashion",
  },
  {
    title: "Styling Tips for Elegant Evening Wear",
    excerpt:
      "Discover how to layer textures, accessories, and refined tones to create unforgettable evening looks.",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=400&fit=crop",
    date: "Jun 5, 2026",
    slug: "styling-evening-wear",
  },
  {
    title: "Sustainable Luxury: Our Fabric Philosophy",
    excerpt:
      "Learn about the premium natural fabrics we source and our commitment to conscious couture craftsmanship.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    date: "May 28, 2026",
    slug: "sustainable-luxury",
  },
];

const defaultSettings = {
  storeName: "Zayrah Couture",
  tagline: "Elegant modest fashion for the modern woman",
  heroEyebrow: "New Season",
  heroHeading: "From Zayrah, With Love",
  email: "hello@zayrahcouture.com",
  phone: "+971 50 123 4567",
  address: "Dubai Design District, UAE",
  instagram: "https://instagram.com/zayrahcouture",
  whatsapp: "https://wa.me/971501234567",
  heroImagePrimary: {
    url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=700&fit=crop"
  },
  heroImageSecondary: {
    url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=550&fit=crop"
  },
  instagramPosts: [
    {
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
      isReel: true,
      link: "#",
    },
    {
      image: "https://images.unsplash.com/photo-1572804013309-59aaffb0f731?w=400&h=400&fit=crop",
      isReel: true,
      link: "#",
    },
    {
      image: "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=400&h=400&fit=crop",
      isReel: true,
      link: "#",
    },
    {
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      isReel: false,
      link: "#",
    },
  ],
  additionalInfo: "• Premium quality fabrics only.\n• Handcraft details and embroidery.\n• Dry clean or gentle hand wash recommended.",
  shippingPolicy: "• Free shipping on orders over ₹5,000.\n• Standard delivery takes 3-5 business days within metropolitan areas, and 5-7 business days elsewhere.\n• Tracking information will be emailed once your order is dispatched.",
  returnPolicy: "• We accept returns within 7 days of delivery.\n• Items must be unused, unwashed, and in their original packaging with all tags attached.\n• Custom-made or altered garments are not eligible for returns or exchanges."
};

exports.getHome = async (req, res) => {
  let storeSettings = defaultSettings;
  try {
    const dbSettings = await Settings.findOne().lean();
    if (dbSettings) {
      storeSettings = dbSettings;
    }
    let featuredProducts = [];
    let bestSellerProducts = [];
    let megaSaleProducts = [];
    let readyToWearProducts = [];
    let featuredCategories = [];
    let searchableProducts = [];

    const dbFeatured = await Product.find({ isFeatured: true, isListed: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const dbProducts = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const allListedProducts = await Product.find()
      .populate("category")
      .sort({ name: 1 })
      .lean();

    if (allListedProducts.length > 0) {
      searchableProducts = allListedProducts.map(formatProduct);
    } else {
      searchableProducts = mockFeaturedProducts;
    }

    if (dbProducts.length >= 4) {
      const formatted = dbProducts.map(formatProduct);
      
      if (dbFeatured.length > 0) {
        featuredProducts = dbFeatured.map(formatProduct);
      } else {
        featuredProducts = formatted.filter((p) => p.isNew || p.badge).slice(0, 20);
        if (featuredProducts.length < 4) featuredProducts = formatted.slice(0, 20);
      }

      bestSellerProducts = formatted.slice(0, 10);
      megaSaleProducts = formatted.filter((p) => p.isSale).slice(0, 8);
      if (megaSaleProducts.length < 4) megaSaleProducts = formatted.slice(0, 8);
      readyToWearProducts = formatted.slice(0, 10);
    } else {
      featuredProducts = dbFeatured.length > 0 ? dbFeatured.map(formatProduct) : mockFeaturedProducts;
      bestSellerProducts = mockFeaturedProducts.slice(0, 6);
      megaSaleProducts = mockFeaturedProducts.filter((p) => p.isSale);
      readyToWearProducts = mockFeaturedProducts.slice(2, 8);
    }

    const dbCategories = await Category.find({ isListed: true, isFeatured: true })
      .limit(5)
      .lean();

    if (dbCategories.length > 0) {
      featuredCategories = dbCategories.map((cat, index) => {
        let size = "medium";
        if (dbCategories.length === 5) {
          size = index < 2 ? "large" : "medium";
        } else if (dbCategories.length === 4) {
          size = "large";
        } else if (dbCategories.length === 3) {
          size = "medium";
        } else if (dbCategories.length === 2) {
          size = "large";
        } else if (dbCategories.length === 1) {
          size = "large";
        }
        return {
          title: cat.name,
          subtitle: cat.description || "Explore the collection",
          slug: cat.slug,
          image: cat.image && cat.image.url ? cat.image.url : PLACEHOLDER_IMAGE,
          size,
        };
      });
    } else {
      featuredCategories = mockFeaturedCategories;
    }

    res.render("user/home", {
      featuredProducts,
      bestSellerProducts,
      megaSaleProducts,
      readyToWearProducts,
      featuredCategories,
      searchableProducts,
      instagramPosts: (storeSettings.instagramPosts && storeSettings.instagramPosts.length) ? storeSettings.instagramPosts : defaultSettings.instagramPosts,
      blogPosts: mockBlogPosts,
      storeSettings,
      pageName: "home",
      pageTitle: "Zayrah Couture | Elegant Modest Fashion",
    });
  } catch (error) {
    console.error("Home page error:", error);
    res.render("user/home", {
      featuredProducts: mockFeaturedProducts,
      bestSellerProducts: mockFeaturedProducts.slice(0, 6),
      megaSaleProducts: mockFeaturedProducts.filter((p) => p.isSale),
      readyToWearProducts: mockFeaturedProducts.slice(2, 8),
      featuredCategories: mockFeaturedCategories,
      searchableProducts: mockFeaturedProducts,
      instagramPosts: (storeSettings.instagramPosts && storeSettings.instagramPosts.length) ? storeSettings.instagramPosts : defaultSettings.instagramPosts,
      blogPosts: mockBlogPosts,
      storeSettings,
      pageName: "home",
      pageTitle: "Zayrah Couture | Elegant Modest Fashion",
    });
  }
};

exports.getShop = async (req, res) => {
  let storeSettings = defaultSettings;
  try {
    const { categorySlug } = req.params;
    const dbSettings = await Settings.findOne().lean();
    if (dbSettings) {
      storeSettings = dbSettings;
    }
    const dbProducts = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    const products =
      dbProducts.length > 0 ? dbProducts.map(formatProduct) : mockShopProducts;

    const dbCategories = await Category.find({ isListed: true })
      .sort({ name: 1 })
      .lean();

    const categories =
      dbCategories.length > 0
        ? dbCategories.map((cat) => ({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
          }))
        : shopCategories;

    const searchCategories = dbCategories.length > 0
      ? dbCategories.map(c => ({ title: c.name, slug: c.slug }))
      : shopCategories.map(c => ({ title: c.name, slug: c.slug }));

    const searchableProducts = dbProducts.length > 0
      ? dbProducts.map(formatProduct)
      : mockShopProducts;

    res.render("user/shop", {
      products,
      categories,
      featuredProducts: products.filter((product) => product.isFeatured).slice(0, 8),
      storeSettings,
      pageName: "shop",
      pageTitle: "Shop Collection | Zayrah Couture",
      pageCss: "/css/user/shop.css",
      pageJs: "/js/user/shop.js",
      selectedCategorySlug: categorySlug || null,
      searchableProducts,
      featuredCategories: searchCategories,
    });
  } catch (error) {
    console.error("Shop page error:", error);
    res.render("user/shop", {
      products: mockShopProducts,
      categories: shopCategories,
      featuredProducts: mockShopProducts
        .filter((product) => product.isFeatured)
        .slice(0, 8),
      storeSettings,
      pageName: "shop",
      pageTitle: "Shop Collection | Zayrah Couture",
      pageCss: "/css/user/shop.css",
      pageJs: "/js/user/shop.js",
      selectedCategorySlug: null,
      searchableProducts: mockShopProducts,
      featuredCategories: shopCategories.map(c => ({ title: c.name, slug: c.slug })),
    });
  }
};

exports.getProductDetails = async (req, res) => {
  let storeSettings = defaultSettings;
  try {
    const dbSettings = await Settings.findOne().lean();
    if (dbSettings) {
      storeSettings = dbSettings;
    }

    const { slug } = req.params;
    const cleanSku = slug.startsWith("ZC-") ? slug.replace("ZC-", "") : slug;

    const product = await Product.findOne({
      $or: [
        { sku: cleanSku },
        { slug: slug }
      ]
    }).populate("category").lean();

    if (!product) {
      return res.redirect("/shop?error=Product not found");
    }

    // Fetch related products (same category, excluding current product)
    let relatedProducts = [];
    const dbRelated = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }
    })
      .populate("category")
      .limit(4)
      .lean();

    if (dbRelated.length > 0) {
      relatedProducts = dbRelated.map(formatProduct);
    } else {
      // Fallback: load some featured products
      const dbAll = await Product.find({ _id: { $ne: product._id } })
        .populate("category")
        .limit(4)
        .lean();
      relatedProducts = dbAll.length > 0 ? dbAll.map(formatProduct) : mockShopProducts.slice(0, 4);
    }

    const shareUrl = `${req.protocol}://${req.get("host")}/product/${product.slug}`;

    const formattedProduct = {
      ...formatProduct(product),
      sku: product.sku || "",
      description: product.description || "",
      images: product.images && product.images.length > 0 ? product.images : [{ url: PLACEHOLDER_IMAGE }],
      variants: product.variants || [],
      combinations: product.combinations || []
    };

    res.render("user/product", {
      product: formattedProduct,
      relatedProducts,
      storeSettings,
      shareUrl,
      pageName: "product-details",
      pageTitle: `${formattedProduct.name} | Zayrah Couture`,
      pageCss: "/css/user/product.css",
      pageJs: "/js/user/product.js",
    });
  } catch (error) {
    console.error("Product details page error:", error);
    res.redirect("/shop?error=Something went wrong");
  }
};

// Render About Page
exports.getAbout = async (req, res) => {
  let storeSettings = defaultSettings;
  try {
    const dbSettings = await Settings.findOne().lean();
    if (dbSettings) {
      storeSettings = dbSettings;
    }

    const dbCategories = await Category.find({ isListed: true }).sort({ name: 1 }).lean();
    const featuredCategories = dbCategories.map(c => ({ title: c.name, slug: c.slug }));

    const allProducts = await Product.find().populate("category").sort({ name: 1 }).lean();
    const searchableProducts = allProducts.map(formatProduct);

    res.render("user/about", {
      storeSettings,
      featuredCategories,
      searchableProducts,
      pageName: "about",
      pageTitle: "About Us | Zayrah Couture",
      pageCss: "/css/user/shop.css",
    });
  } catch (error) {
    console.error("About page error:", error);
    res.redirect("/?error=Failed to load About page");
  }
};

// Render Contact Page
exports.getContact = async (req, res) => {
  let storeSettings = defaultSettings;
  try {
    const dbSettings = await Settings.findOne().lean();
    if (dbSettings) {
      storeSettings = dbSettings;
    }

    const dbCategories = await Category.find({ isListed: true }).sort({ name: 1 }).lean();
    const featuredCategories = dbCategories.map(c => ({ title: c.name, slug: c.slug }));

    const allProducts = await Product.find().populate("category").sort({ name: 1 }).lean();
    const searchableProducts = allProducts.map(formatProduct);

    res.render("user/contact", {
      storeSettings,
      featuredCategories,
      searchableProducts,
      pageName: "contact",
      pageTitle: "Contact Us | Zayrah Couture",
      pageCss: "/css/user/shop.css",
    });
  } catch (error) {
    console.error("Contact page error:", error);
    res.redirect("/?error=Failed to load Contact page");
  }
};

// Render Checkout Page
exports.getCheckout = async (req, res) => {
  let storeSettings = defaultSettings;
  try {
    const dbSettings = await Settings.findOne().lean();
    if (dbSettings) {
      storeSettings = dbSettings;
    }

    const { slug, variants } = req.query;
    if (!slug) {
      return res.redirect("/shop?error=Invalid checkout details");
    }

    // Find the product
    const cleanSku = slug.startsWith("ZC-") ? slug.replace("ZC-", "") : slug;
    const product = await Product.findOne({
      $or: [
        { sku: cleanSku },
        { slug: slug }
      ]
    }).populate("category").lean();
    if (!product) {
      return res.redirect("/shop?error=Product not found");
    }

    // Parse selected variants
    let selections = {};
    if (variants) {
      try {
        selections = JSON.parse(variants);
      } catch (err) {
        console.error("Failed to parse variants:", err);
      }
    }

    // Match the selections to retrieve the dynamic pricing
    let checkoutPrice = product.price;
    let checkoutDiscountPrice = product.salePrice || 0;
    
    if (product.combinations && product.combinations.length > 0) {
      const matched = product.combinations.find(c => {
        const keys = Object.keys(c.attributes || {});
        const selKeys = Object.keys(selections);
        if (keys.length !== selKeys.length) return false;
        return selKeys.every(k => c.attributes[k] === selections[k]);
      });
      if (matched) {
        checkoutPrice = matched.price;
        checkoutDiscountPrice = matched.discountPrice || 0;
      }
    }

    const dbCategories = await Category.find({ isListed: true }).sort({ name: 1 }).lean();
    const featuredCategories = dbCategories.map(c => ({ title: c.name, slug: c.slug }));

    const allProducts = await Product.find().populate("category").sort({ name: 1 }).lean();
    const searchableProducts = allProducts.map(formatProduct);

    res.render("user/checkout", {
      product: formatProduct(product),
      selections,
      checkoutPrice,
      checkoutDiscountPrice,
      storeSettings,
      featuredCategories,
      searchableProducts,
      pageName: "checkout",
      pageTitle: "Checkout | Zayrah Couture",
      pageCss: "/css/user/shop.css",
    });
  } catch (error) {
    console.error("Checkout page error:", error);
    res.redirect("/shop?error=Failed to load checkout page");
  }
};

exports.getSearchData = async (req, res) => {
  try {
    const dbCategories = await Category.find({ isListed: true }).sort({ name: 1 }).lean();
    const categories = dbCategories.length > 0
      ? dbCategories.map((c) => ({ title: c.name, slug: c.slug }))
      : shopCategories.map((c) => ({ title: c.name, slug: c.slug }));

    const dbProducts = await Product.find({ isListed: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    const products = dbProducts.length > 0
      ? dbProducts.map(formatProduct)
      : mockShopProducts;

    res.json({ products, categories });
  } catch (error) {
    console.error("Error fetching search data:", error);
    res.status(500).json({ error: "Failed to fetch search data" });
  }
};

exports.get404 = async (req, res) => {
  let storeSettings = defaultSettings;
  try {
    const dbSettings = await Settings.findOne().lean();
    if (dbSettings) {
      storeSettings = dbSettings;
    }

    const dbCategories = await Category.find({ isListed: true }).sort({ name: 1 }).lean();
    const featuredCategories = dbCategories.length > 0
      ? dbCategories.map(c => ({ title: c.name, slug: c.slug }))
      : shopCategories.map(c => ({ title: c.name, slug: c.slug }));

    const dbProducts = await Product.find({ isListed: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    const searchableProducts = dbProducts.length > 0
      ? dbProducts.map(formatProduct)
      : mockShopProducts;

    res.status(404).render("user/404", {
      storeSettings,
      featuredCategories,
      searchableProducts,
      pageName: "404",
      pageTitle: "Page Not Found | Zayrah Couture",
    });
  } catch (error) {
    console.error("404 page error:", error);
    res.status(404).render("user/404", {
      storeSettings,
      featuredCategories: shopCategories.map(c => ({ title: c.name, slug: c.slug })),
      searchableProducts: mockShopProducts,
      pageName: "404",
      pageTitle: "Page Not Found | Zayrah Couture",
    });
  }
};
