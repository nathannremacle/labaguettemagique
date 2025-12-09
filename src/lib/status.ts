import fs from "fs";
import path from "path";

const STATUS_FILE = path.join(process.cwd(), "data", "status.json");

export type RestaurantStatus = {
  isOpen: boolean;
  message?: string;
};

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getStatus(): RestaurantStatus {
  ensureDataDir();
  if (fs.existsSync(STATUS_FILE)) {
    try {
      const data = fs.readFileSync(STATUS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return { isOpen: true };
    }
  }
  return { isOpen: true };
}

export function setStatus(status: RestaurantStatus): void {
  ensureDataDir();
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

