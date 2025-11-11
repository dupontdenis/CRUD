import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./db.mjs";
import postRoutes from "./routes/postRoutes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Make the mount base available to views so templates can build URLs dynamically
app.locals.basePath = "/posts";

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect to database
await connectToDatabase();

// Routes
app.use("/posts", postRoutes);
app.get("/", (req, res) => res.redirect("/posts"));

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Educational routes:`);
  console.log(`   - http://localhost:${PORT}/ (List all posts)`);
});
