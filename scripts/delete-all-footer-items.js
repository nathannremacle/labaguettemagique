const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "menu.db");
const db = new Database(dbPath);

try {
  console.log("Suppression de tous les éléments du footer...");
  
  const stmt = db.prepare("DELETE FROM footer_items");
  const result = stmt.run();
  
  console.log(`✓ ${result.changes} élément(s) du footer supprimé(s) de la base de données`);
  console.log("✓ Tous les éléments du footer ont été supprimés");
} catch (error) {
  console.error("Erreur lors de la suppression des éléments du footer :", error);
  process.exit(1);
} finally {
  db.close();
}


