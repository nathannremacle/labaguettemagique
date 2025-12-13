const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "menu.db");
const db = new Database(dbPath);

try {
  console.log("Deleting all footer items...");
  
  const stmt = db.prepare("DELETE FROM footer_items");
  const result = stmt.run();
  
  console.log(`✓ Deleted ${result.changes} footer item(s) from database`);
  console.log("✓ All footer items have been removed");
} catch (error) {
  console.error("Error deleting footer items:", error);
  process.exit(1);
} finally {
  db.close();
}

