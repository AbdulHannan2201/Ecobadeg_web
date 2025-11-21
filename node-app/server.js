import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import morgan from "morgan";
import session from "express-session";
import { getDashboardData } from "./dataService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://127.0.0.1:5000";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ecobadge-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/");
}

app.get("/", async (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session && req.session.user) {
    return res.redirect(303, "/dashboard");
  }
  const flaskOnline = await isFlaskReachable();
  console.log(JSON.stringify(null || null));
  res.render("index", { flash: null, mode: "signup", flaskOnline });
});

app.get('/login', (req, res) => {
  const error = req.query.error;
  let flash = null;
  if (error === 'exists') {
    flash = { type: 'warning', message: 'Email already registered. Please log in.' };
  } else if (error) {
    flash = { type: 'warning', message: error };
  }
  res.render('login', { mode: 'login', flash, flaskOnline: true });
});

app.get('/signup', (req, res) => {
  const error = req.query.error;
  if (error === 'exists') {
    return res.redirect('/login?error=exists');
  }
  let flash = null;
  if (error === 'failed') {
    flash = { type: 'error', message: 'Signup failed. Please try again.' };
  }
  res.render('index', { mode: 'signup', flash, flaskOnline: true }); // Assuming flask is online for rendering signup page
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Demo Bypass for Testing
  if (email === "pilot@ecobadge.org" && password === "password") {
    req.session.user = { email, id: "demo-user" };
    return res.redirect(303, "/dashboard");
  }

  // Demo check: if email already exists (demo email), redirect back with error
  if (email === 'pilot@ecobadge.org') {
    // Redirect to signup with error message
    return res.redirect(303, '/signup?error=exists');
  }

  const flash = await proxyAuthRequest("/signup", { email, password });

  if (flash.type === "success") {
    // Store user in session
    req.session.user = {
      email,
      id: flash.data?.user_id || email,
    };
    return res.redirect(303, "/dashboard");
  }

  // If signup failed, redirect to signup with error
  return res.redirect(303, `/signup?error=${encodeURIComponent(flash.message)}`);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Debug logging
  console.log('Login attempt received:', {
    email: `"${email}"`,
    password: `"${password}"`,
    emailLength: email?.length,
    passwordLength: password?.length
  });

  // Demo Bypass for Testing
  if (email === "pilot@ecobadge.org" && password === "password") {
    req.session.user = { email, id: "demo-user" };
    return res.redirect(303, "/dashboard");
  }

  const flash = await proxyAuthRequest("/login", { email, password });

  if (flash.type === "success") {
    // Store user in session
    req.session.user = {
      email,
      id: flash.data?.user_id || email,
    };
    return res.redirect(303, "/dashboard");
  }

  const flaskOnline = await isFlaskReachable();
  res.render("index", { flash, mode: "login", flaskOnline });
});

app.get("/dashboard", requireAuth, async (req, res) => {
  const flaskOnline = await isFlaskReachable();
  const dashboardData = getDashboardData();

  res.render("dashboard", {
    flaskOnline,
    dashboardData,
    user: req.session.user
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect(303, "/");
  });
});

async function proxyAuthRequest(pathSuffix, payload) {
  try {
    const response = await axios.post(`${FLASK_BASE_URL}${pathSuffix}`, payload);
    return {
      type: "success",
      message: response.data?.message || "Request succeeded.",
      data: response.data,
    };
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unknown error from auth server.";
    return {
      type: status >= 500 ? "error" : "warning",
      message,
      data: error.response?.data ?? null,
    };
  }
}

async function isFlaskReachable() {
  if (!FLASK_BASE_URL) {
    return false;
  }

  try {
    await axios.get(`${FLASK_BASE_URL}/`, { timeout: 1500 });
    return true;
  } catch (error) {
    return false;
  }
}

app.listen(PORT, () => {
  console.log(`Node client listening on http://localhost:${PORT}`);
  console.log(`Proxying auth calls to ${FLASK_BASE_URL}`);
});

