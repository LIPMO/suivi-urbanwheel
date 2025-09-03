import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Identifiants fixes
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "1234";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "superSecretUltraLong",
    resave: false,
    saveUninitialized: false,
  })
);

const DATA_FILE = path.join(__dirname, "data", "tracking.json");

// Vérifie si data/tracking.json existe
if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
  fs.writeFileSync(DATA_FILE, "[]");
}

// ---------------- API ----------------

// Vérification d’un suivi
app.get("/api/track/:code", (req, res) => {
  const tracking = JSON.parse(fs.readFileSync(DATA_FILE));
  const item = tracking.find((t) => t.code === req.params.code);
  if (!item) return res.status(404).json({ error: "Code introuvable" });
  res.json(item);
});

// Création d’un suivi
app.post("/api/track", (req, res) => {
  const { code, client, status } = req.body;
  if (!code || !client || !status)
    return res.status(400).json({ error: "Données manquantes" });

  const tracking = JSON.parse(fs.readFileSync(DATA_FILE));
  if (tracking.find((t) => t.code === code)) {
    return res.status(400).json({ error: "Code déjà existant" });
  }

  const newItem = { code, client, status };
  tracking.push(newItem);
  fs.writeFileSync(DATA_FILE, JSON.stringify(tracking, null, 2));
  res.json(newItem);
});

// ---------------- LOGIN ----------------

// Page login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Vérification login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.redirect("/admin");
  } else {
    res.send("<h1>❌ Identifiants invalides</h1><a href='/login'>Réessayer</a>");
  }
});

// Déconnexion
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Middleware protection
function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.redirect("/login");
}

// Page admin protégée
app.get("/admin", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ---------------- START ----------------
app.listen(PORT, () => {
  console.log(`✅ UrbanWheel Tracker démarré sur http://localhost:${PORT}`);
});
