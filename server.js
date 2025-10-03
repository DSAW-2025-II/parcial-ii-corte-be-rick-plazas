require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "User not authenticated" });
    req.user = user;
    next();
  });
}

// login
app.post("/api/v1/auth", (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD

  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return res.json({ token });
  }

  return res.status(400).json({ error: "invalid credentials" });
});

//Endpoint
app.post("/api/v1/pokemonDetails", authenticateToken, async (req, res) => {
  const { pokemonName } = req.body;

  if (!pokemonName) {
    return res.status(400).json({
      name: "",
      species: "",
      weight: "",
      img_url: "",
    });
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);

    if (!response.ok) {
      return res.status(400).json({
        name: "",
        species: "",
        weight: "",
        img_url: "",
      });
    }

    const data = await response.json();

    const resultado = {
      name: data.name,
      species: data.species.name,
      weight: data.weight,
      img_url: data.sprites.front_default,
    };

    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching Pokémon data" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
