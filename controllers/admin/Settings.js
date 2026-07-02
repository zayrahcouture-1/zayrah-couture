const Settings = require("../../models/Settings");
const cloudinary = require("../../config/cloudinary");

const loadSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.render("admin/settings/edit", {
      settings,
      success: req.query?.success || null,
      error: req.query?.error || null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/dashboard?error=Failed to load settings");
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const { tagline, email, phone, address, instagram, whatsapp, additionalInfo, shippingPolicy, returnPolicy, heroEyebrow, heroHeading } = req.body;

    settings.tagline = tagline ? tagline.trim() : "";
    settings.heroEyebrow = heroEyebrow ? heroEyebrow.trim() : "";
    settings.heroHeading = heroHeading ? heroHeading.trim() : "";
    settings.email = email ? email.trim() : "";
    settings.phone = phone ? phone.trim() : "";
    settings.address = address ? address.trim() : "";
    settings.instagram = instagram ? instagram.trim() : "";
    settings.whatsapp = whatsapp ? whatsapp.trim() : "";
    settings.additionalInfo = additionalInfo ? additionalInfo.trim() : "";
    settings.shippingPolicy = shippingPolicy ? shippingPolicy.trim() : "";
    settings.returnPolicy = returnPolicy ? returnPolicy.trim() : "";

    // Check if new images were uploaded
    if (req.files) {
      if (req.files["heroImagePrimary"] && req.files["heroImagePrimary"][0]) {
        const file = req.files["heroImagePrimary"][0];
        if (settings.heroImagePrimary && settings.heroImagePrimary.public_id) {
          try {
            await cloudinary.uploader.destroy(settings.heroImagePrimary.public_id);
          } catch (err) {
            console.error("Failed to delete primary hero image from Cloudinary:", err);
          }
        }
        settings.heroImagePrimary = {
          url: file.path,
          public_id: file.filename,
        };
      }

      if (req.files["heroImageSecondary"] && req.files["heroImageSecondary"][0]) {
        const file = req.files["heroImageSecondary"][0];
        if (settings.heroImageSecondary && settings.heroImageSecondary.public_id) {
          try {
            await cloudinary.uploader.destroy(settings.heroImageSecondary.public_id);
          } catch (err) {
            console.error("Failed to delete secondary hero image from Cloudinary:", err);
          }
        }
        settings.heroImageSecondary = {
          url: file.path,
          public_id: file.filename,
        };
      }
    }

    // Process Instagram Posts
    const instagramPosts = [];
    const defaultMocks = [
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
    ];

    for (let i = 0; i < 4; i++) {
      const link = req.body[`instagramPostLink${i}`] || "#";
      const isReel = req.body[`instagramPostIsReel${i}`] === "true" || req.body[`instagramPostIsReel${i}`] === true;
      
      const currentPost = (settings.instagramPosts && settings.instagramPosts[i]) 
        ? settings.instagramPosts[i] 
        : defaultMocks[i];
        
      let image = currentPost.image;
      let public_id = currentPost.public_id;
      
      if (req.files && req.files[`instagramPostImage${i}`] && req.files[`instagramPostImage${i}`][0]) {
        const file = req.files[`instagramPostImage${i}`][0];
        if (public_id) {
          try {
            await cloudinary.uploader.destroy(public_id);
          } catch (err) {
            console.error(`Failed to delete instagram post ${i} image from Cloudinary:`, err);
          }
        }
        image = file.path;
        public_id = file.filename;
      }
      
      instagramPosts.push({ image, link, isReel, public_id });
    }
    settings.instagramPosts = instagramPosts;

    await settings.save();
    res.redirect("/admin/settings?success=Settings updated successfully");
  } catch (error) {
    console.log(error);
    if (req.files) {
      if (req.files["heroImagePrimary"] && req.files["heroImagePrimary"][0]) {
        try {
          await cloudinary.uploader.destroy(req.files["heroImagePrimary"][0].filename);
        } catch (err) {}
      }
      if (req.files["heroImageSecondary"] && req.files["heroImageSecondary"][0]) {
        try {
          await cloudinary.uploader.destroy(req.files["heroImageSecondary"][0].filename);
        } catch (err) {}
      }
      for (let i = 0; i < 4; i++) {
        if (req.files[`instagramPostImage${i}`] && req.files[`instagramPostImage${i}`][0]) {
          try {
            await cloudinary.uploader.destroy(req.files[`instagramPostImage${i}`][0].filename);
          } catch (err) {}
        }
      }
    }

    const settings = (await Settings.findOne()) || {};
    res.render("admin/settings/edit", {
      settings,
      error: "Failed to update settings",
    });
  }
};

module.exports = {
  loadSettings,
  updateSettings,
};
