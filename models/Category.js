const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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

    image: {
      url: {
        type: String,
        default: "",
      },

      public_id: {
        type: String,
        default: "",
      },
    },

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
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);