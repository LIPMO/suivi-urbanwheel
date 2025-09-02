const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Charger les clients
function loadClients() {
  if (!fs.existsSync("clients.json")) return [];
  return JSON.parse(fs.readFileSync("clients.json", "utf8"));
}

// Sauvegarder les clients
function saveClients(data) {
  fs.writeFileSync("clients.json", JSON.stringify(data, null, 2));
}

// Page publique
app.get("/", (req, res) => {
  res.render("index");
});

// Vérification du code
app.post("/track", (req, res) => {
  const { code } = req.body;
  const clients = loadClients();
  const client = clients.find(c => c.code === code);

  if (!client) {
    return res.render("result", { error: "❌ Code invalide", client: null });
  }

  res.render("result", { error: null, client });
});

// Admin (clé basique)
app.get("/admin", (req, res) => {
  if (req.query.key !== "admin123") return res.send("Accès refusé ❌");
  const clients = loadClients();
  res.render("admin", { clients });
});

// Ajouter un client
app.post("/admin/add", (req, res) => {
  const { nom, statut } = req.body;
  const clients = loadClients();

  const code = "UW-" + Math.random().toString(36).substring(2, 7).toUpperCase();

  clients.push({ nom, statut, code });
  saveClients(clients);

  res.redirect("/admin?key=admin123");
});

// Mettre à jour un statut
app.post("/admin/update", (req, res) => {
  const { code, statut } = req.body;
  const clients = loadClients();
  const client = clients.find(c => c.code === code);

  if (client) {
    client.statut = statut;
    saveClients(clients);
  }

  res.redirect("/admin?key=admin123");
});

app.listen(PORT, () => console.log(`🚀 UrbanWheel Tracker lancé sur port ${PORT}`));
