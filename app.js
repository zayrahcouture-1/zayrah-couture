require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/admin/Auth.js");
const dashboardRoutes = require("./routes/admin/Dashboard.js");
const categoryRoutes = require("./routes/admin/Category");
const productRoutes = require("./routes/admin/Product");
const settingsRoutes = require("./routes/admin/Settings");
const homeRoutes = require("./routes/user/Home");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);


app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use("/", homeRoutes);

app.use("/admin", authRoutes);
app.use("/admin", dashboardRoutes);
app.use("/admin", categoryRoutes);
app.use("/admin", productRoutes);
app.use("/admin", settingsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err);
  
  const referer = req.header('Referer');
  if (referer) {
    try {
      const url = new URL(referer);
      let errMsg = "Upload failed: Please configure CLOUDINARY credentials in your .env file.";
      if (err.message && !err.message.toLowerCase().includes("cloudinary")) {
        errMsg = `Upload failed: ${err.message}`;
      }
      url.searchParams.set('error', errMsg);
      return res.redirect(url.pathname + url.search);
    } catch (e) {
      // fallback
    }
  }
  
  res.status(500).send("Server Error: " + (err.message || "An unexpected error occurred."));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running On ${PORT}`);
});