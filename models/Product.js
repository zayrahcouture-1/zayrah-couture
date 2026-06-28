const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    images: [
      {
        url: {
          type: String,
          default: "",
        },
        public_id: {
          type: String,
          default: "",
        },
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isListed: {
      type: Boolean,
      default: true,
    },

    variants: [
      {
        name: { type: String, required: true },
        options: { type: [String], default: [] }
      }
    ],

    combinations: [
      {
        attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
        price: { type: Number, required: true },
        discountPrice: { type: Number, default: 0 }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
