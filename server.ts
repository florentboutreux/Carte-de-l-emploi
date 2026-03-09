import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("jobmap.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    title TEXT,
    company TEXT,
    location TEXT,
    description TEXT,
    url TEXT,
    lat REAL,
    lng REAL,
    contractType TEXT,
    experienceLevel TEXT,
    salary TEXT,
    industry TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    query TEXT,
    location TEXT,
    radius INTEGER,
    contractType TEXT,
    experienceLevel TEXT,
    minSalary INTEGER,
    maxSalary INTEGER,
    industry TEXT,
    emailEnabled INTEGER,
    createdAt TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/favorites", (req, res) => {
    const favorites = db.prepare("SELECT * FROM favorites").all();
    res.json(favorites);
  });

  app.post("/api/favorites", (req, res) => {
    const job = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO favorites (id, title, company, location, description, url, lat, lng, contractType, experienceLevel, salary, industry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(job.id, job.title, job.company, job.location, job.description, job.url, job.lat, job.lng, job.contractType, job.experienceLevel, job.salary, job.industry);
    res.json({ status: "ok" });
  });

  app.delete("/api/favorites/:id", (req, res) => {
    db.prepare("DELETE FROM favorites WHERE id = ?").run(req.params.id);
    res.json({ status: "ok" });
  });

  app.get("/api/alerts", (req, res) => {
    const alerts = db.prepare("SELECT * FROM alerts").all();
    res.json(alerts.map((a: any) => ({
      ...a,
      emailEnabled: !!a.emailEnabled,
      filters: {
        contractType: a.contractType,
        experienceLevel: a.experienceLevel,
        salaryRange: [a.minSalary, a.maxSalary],
        industry: a.industry
      }
    })));
  });

  app.post("/api/alerts", (req, res) => {
    const alert = req.body;
    const insert = db.prepare(`
      INSERT INTO alerts (id, query, location, radius, contractType, experienceLevel, minSalary, maxSalary, industry, emailEnabled, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      alert.id, 
      alert.query, 
      alert.location, 
      alert.radius, 
      alert.filters.contractType, 
      alert.filters.experienceLevel, 
      alert.filters.salaryRange[0], 
      alert.filters.salaryRange[1], 
      alert.filters.industry, 
      alert.emailEnabled ? 1 : 0, 
      alert.createdAt
    );
    res.json({ status: "ok" });
  });

  app.delete("/api/alerts/:id", (req, res) => {
    db.prepare("DELETE FROM alerts WHERE id = ?").run(req.params.id);
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
