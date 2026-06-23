require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/admin/Auth.js");
const dashboardRoutes = require("./routes/admin/Dashboard.js");

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

app.get("/", (req, res) => {
  res.render("user/home");
});

app.use("/admin", authRoutes);
app.use("/admin", dashboardRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running On ${PORT}`);
});