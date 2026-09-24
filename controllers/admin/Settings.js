const Settings = require("../../models/Settings");

const {
  deleteHeroImageFile,
  cleanupUploadedHeroFile,
  deleteInstagramImageFile,
  cleanupUploadedInstagramFile,
} = require("../../utils/storageHelper");

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
  let settingsSaved = false;
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

    // Track old hero images and flags for post-save local file deletion
    const oldHeroPrimary = settings.heroImagePrimary
      ? { url: settings.heroImagePrimary.url, public_id: settings.heroImagePrimary.public_id }
      : null;
    let shouldDeleteOldPrimaryLocal = false;

    const oldHeroSecondary = settings.heroImageSecondary
      ? { url: settings.heroImageSecondary.url, public_id: settings.heroImageSecondary.public_id }
      : null;
    let shouldDeleteOldSecondaryLocal = false;

    // Check if new hero images were uploaded
    if (req.files) {
      if (req.files["heroImagePrimary"] && req.files["heroImagePrimary"][0]) {
        const file = req.files["heroImagePrimary"][0];
        settings.heroImagePrimary = {
          url: `/uploads/hero/${file.filename}`,
          public_id: file.filename,
        };
        if (oldHeroPrimary && oldHeroPrimary.url && oldHeroPrimary.url.startsWith("/uploads/hero/")) {
          shouldDeleteOldPrimaryLocal = true;
        }
      }

      if (req.files["heroImageSecondary"] && req.files["heroImageSecondary"][0]) {
        const file = req.files["heroImageSecondary"][0];
        settings.heroImageSecondary = {
          url: `/uploads/hero/${file.filename}`,
          public_id: file.filename,
        };
        if (oldHeroSecondary && oldHeroSecondary.url && oldHeroSecondary.url.startsWith("/uploads/hero/")) {
          shouldDeleteOldSecondaryLocal = true;
        }
      }
    }

    // Track old local Instagram images to delete after successful save
    const oldLocalInstagramImagesToDelete = [];

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

        // If old image was local, mark for post-save deletion
        if (currentPost.image && typeof currentPost.image === "string" && currentPost.image.startsWith("/uploads/instagram/")) {
          if (currentPost.public_id) {
            oldLocalInstagramImagesToDelete.push(currentPost.public_id);
          }
        }
        // If old image was legacy Cloudinary, leave it untouched in Cloudinary

        image = `/uploads/instagram/${file.filename}`;
        public_id = file.filename;
      }
      
      instagramPosts.push({ image, link, isReel, public_id });
    }
    settings.instagramPosts = instagramPosts;

    await settings.save();
    settingsSaved = true;

    // After successful database save, delete old local Hero images if applicable
    if (shouldDeleteOldPrimaryLocal && oldHeroPrimary && oldHeroPrimary.public_id) {
      await deleteHeroImageFile(oldHeroPrimary.public_id);
    }
    if (shouldDeleteOldSecondaryLocal && oldHeroSecondary && oldHeroSecondary.public_id) {
      await deleteHeroImageFile(oldHeroSecondary.public_id);
    }

    // After successful database save, delete old local Instagram images if applicable
    for (const oldPublicId of oldLocalInstagramImagesToDelete) {
      await deleteInstagramImageFile(oldPublicId);
    }

    res.redirect("/admin/settings?success=Settings updated successfully");
  } catch (error) {
    console.log(error);
    if (req.files) {
      // ONLY clean up newly uploaded local files if settings was NOT saved yet
      if (!settingsSaved) {
        if (req.files["heroImagePrimary"] && req.files["heroImagePrimary"][0]) {
          await cleanupUploadedHeroFile(req.files["heroImagePrimary"][0]);
        }
        if (req.files["heroImageSecondary"] && req.files["heroImageSecondary"][0]) {
          await cleanupUploadedHeroFile(req.files["heroImageSecondary"][0]);
        }
        for (let i = 0; i < 4; i++) {
          if (req.files[`instagramPostImage${i}`] && req.files[`instagramPostImage${i}`][0]) {
            await cleanupUploadedInstagramFile(req.files[`instagramPostImage${i}`][0]);
          }
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
