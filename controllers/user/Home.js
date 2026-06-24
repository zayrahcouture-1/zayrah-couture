const Product = require("../../models/Product");
const Category = require("../../models/Category");

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=600&h=800&fit=crop";

const formatProduct = (product) => {
  const price = product.price || 0;
  const salePrice = product.discountPrice > 0 ? product.discountPrice : null;
  const image =
    product.images && product.images[0] && product.images[0].url
      ? product.images[0].url
      : PLACEHOLDER_IMAGE;

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    category:
      product.category && product.category.name
        ? product.category.name
        : "Collection",
    price,
    salePrice,
    image,
    isNew:
      product.createdAt &&
      Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000,
    isSale: salePrice !== null && salePrice < price,
    badge: salePrice ? "SALE" : null,
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

const mockInstagramPosts = [
  {
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
    isReel: false,
    link: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
    isReel: true,
    link: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    isReel: false,
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
      "https://images.unsplash.com/photo-1585487000160-6eacfbeb0d88?w=400&h=400&fit=crop",
    isReel: false,
    link: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1539008835657-9e8e96875907?w=400&h=400&fit=crop",
    isReel: false,
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
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
    isReel: false,
    link: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
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

const storeSettings = {
  storeName: "Zayrah Couture",
  tagline: "Elegant modest fashion for the modern woman",
  email: "hello@zayrahcouture.com",
  phone: "+971 50 123 4567",
  address: "Dubai Design District, UAE",
  instagram: "https://instagram.com/zayrahcouture",
  facebook: "https://facebook.com/zayrahcouture",
  whatsapp: "https://wa.me/971501234567",
};

exports.getHome = async (req, res) => {
  try {
    let featuredProducts = [];
    let bestSellerProducts = [];
    let megaSaleProducts = [];
    let readyToWearProducts = [];
    let featuredCategories = [];
    let searchableProducts = [];

    const dbProducts = await Product.find({ isListed: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const allListedProducts = await Product.find({ isListed: true })
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
      featuredProducts = formatted.filter((p) => p.isNew || p.badge).slice(0, 8);
      if (featuredProducts.length < 4) featuredProducts = formatted.slice(0, 8);

      bestSellerProducts = formatted.slice(0, 10);
      megaSaleProducts = formatted.filter((p) => p.isSale).slice(0, 8);
      if (megaSaleProducts.length < 4) megaSaleProducts = formatted.slice(0, 8);
      readyToWearProducts = formatted.slice(0, 10);
    } else {
      featuredProducts = mockFeaturedProducts;
      bestSellerProducts = mockFeaturedProducts.slice(0, 6);
      megaSaleProducts = mockFeaturedProducts.filter((p) => p.isSale);
      readyToWearProducts = mockFeaturedProducts.slice(2, 8);
    }

    const dbCategories = await Category.find({ isListed: true, isFeatured: true })
      .limit(5)
      .lean();

    if (dbCategories.length >= 3) {
      featuredCategories = dbCategories.map((cat, index) => ({
        title: cat.name,
        subtitle: cat.description || "Explore the collection",
        slug: cat.slug,
        image: cat.image && cat.image.url ? cat.image.url : PLACEHOLDER_IMAGE,
        size: index < 2 ? "large" : "medium",
      }));
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
      instagramPosts: mockInstagramPosts,
      blogPosts: mockBlogPosts,
      storeSettings,
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
      instagramPosts: mockInstagramPosts,
      blogPosts: mockBlogPosts,
      storeSettings,
      pageTitle: "Zayrah Couture | Elegant Modest Fashion",
    });
  }
};
