import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "menu.db");

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  ensureDataDir();
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  
  // Initialize schema
  initializeSchema(db);
  
  return db;
}

function initializeSchema(database: Database.Database) {
  // Categories table
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Menu items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      image TEXT,
      highlight INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Images table
  database.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      original_filename TEXT NOT NULL,
      path TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      size INTEGER NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Footer items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS footer_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      link TEXT,
      menu_item_name TEXT,
      menu_category_id TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      visible INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add new columns if they don't exist (migration)
  try {
    database.exec(`
      ALTER TABLE footer_items ADD COLUMN menu_item_name TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }
  
  try {
    database.exec(`
      ALTER TABLE footer_items ADD COLUMN menu_category_id TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  // Initialize default admin user if none exists
  const existingAdmin = database.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (existingAdmin.count === 0) {
    database.prepare(`
      INSERT INTO admin_users (username, password)
      VALUES (?, ?)
    `).run('admin', 'password');
  }

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
    CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
    CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(category_id, "order");
    CREATE INDEX IF NOT EXISTS idx_footer_items_order ON footer_items("order");
    CREATE INDEX IF NOT EXISTS idx_footer_items_visible ON footer_items(visible);
  `);
}

// Close database connection (useful for cleanup)
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

