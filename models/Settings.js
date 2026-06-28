const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    heroImagePrimary: {
      url: {
        type: String,
        default: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=700&fit=crop"
      },
      public_id: {
        type: String,
        default: ""
      }
    },
    heroImageSecondary: {
      url: {
        type: String,
        default: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=550&fit=crop"
      },
      public_id: {
        type: String,
        default: ""
      }
    },
    tagline: {
      type: String,
      default: "Elegant modest fashion for the modern woman"
    },
    email: {
      type: String,
      default: "hello@zayrahcouture.com"
    },
    phone: {
      type: String,
      default: "+971 50 123 4567"
    },
    address: {
      type: String,
      default: "Dubai Design District, UAE"
    },
    instagram: {
      type: String,
      default: "https://instagram.com/zayrahcouture"
    },
    whatsapp: {
      type: String,
      default: "https://wa.me/971501234567"
    },
    instagramPosts: {
      type: [
        {
          image: {
            type: String,
            default: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop"
          },
          link: {
            type: String,
            default: "#"
          },
          isReel: {
            type: Boolean,
            default: true
          },
          public_id: {
            type: String,
            default: ""
          }
        }
      ],
      default: [
        {
          image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
          link: "#",
          isReel: true,
          public_id: ""
        },
        {
          image: "https://images.unsplash.com/photo-1572804013309-59aaffb0f731?w=400&h=400&fit=crop",
          link: "#",
          isReel: true,
          public_id: ""
        },
        {
          image: "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=400&h=400&fit=crop",
          link: "#",
          isReel: true,
          public_id: ""
        },
        {
          image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
          link: "#",
          isReel: false,
          public_id: ""
        }
      ]
    },
    additionalInfo: {
      type: String,
      default: "• Premium quality fabrics only.\n• Handcraft details and embroidery.\n• Dry clean or gentle hand wash recommended."
    },
    shippingPolicy: {
      type: String,
      default: "• Free shipping on orders over ₹5,000.\n• Standard delivery takes 3-5 business days within metropolitan areas, and 5-7 business days elsewhere.\n• Tracking information will be emailed once your order is dispatched."
    },
    returnPolicy: {
      type: String,
      default: "• We accept returns within 7 days of delivery.\n• Items must be unused, unwashed, and in their original packaging with all tags attached.\n• Custom-made or altered garments are not eligible for returns or exchanges."
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
