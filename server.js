const express = require("express");
const helmet = require("helmet");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const root = __dirname;

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.static(root, { extensions: ["html"] }));

app.get("/app", (_req, res) => res.sendFile(path.join(root, "apps.html")));
app.get("/arion", (_req, res) => res.sendFile(path.join(root, "apps.html")));
app.get("/arion-vpn", (_req, res) => res.sendFile(path.join(root, "apps.html")));

app.use((_req, res) => {
  res.status(404).sendFile(path.join(root, "index.html"));
});

app.listen(port, () => {
  console.log(`Kzova Labs website running on port ${port}`);
});
