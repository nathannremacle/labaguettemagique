// Website content data from https://labaguettemagiquesarttilman.be/

export const contactInfo = {
  name: "La Baguette Magique",
  address: {
    street: "Rue Sart-Tilman, 372",
    city: "4031 Angleur",
    full: "Rue Sart-Tilman, 372, 4031 Angleur",
  },
  phone: {
    mobile: "0474/87.83.85.",
    landline: "043652217",
    formatted: "+32 474 87 83 85",
    mobileTel: "+32474878385", // For tel: links
    landlineTel: "+3243652217", // For tel: links
  },
  email: "karimbenkirane2904@gmail.com",
  vat: "be0870399509",
  description:
    "La Baguette Magique c'est un grand choix de sandwiches, de salades, de plats préparés et de snacks.",
  whatsapp: {
    number: "32474878385", // WhatsApp number (without +)
    message: "Bonjour, je souhaite passer une commande à La Baguette Magique.",
  },
};

// Helper function to generate WhatsApp URL
export function getWhatsAppUrl(customMessage?: string): string {
  const message = encodeURIComponent(
    customMessage || contactInfo.whatsapp.message
  );
  return `https://wa.me/${contactInfo.whatsapp.number}?text=${message}`;
}

// Helper function to generate WhatsApp URL for ordering a specific item
export function getWhatsAppOrderUrl(itemName: string): string {
  const message = `Bonjour, je souhaite commander : ${itemName}`;
  return getWhatsAppUrl(message);
}

export const menuCategories = [
  "Sandwiches Classique",
  "Sandwiches spéciaux",
  "Sandwiches chauds",
  "Pitas",
  "Salade",
  "Assiettes préparées",
  "Plats préparés sur commande",
  "Frites & Snacks",
];

// Opening hours from https://labaguettemagiquesarttilman.be/
export const openingHours = [
  { days: "Lundi", hours: "11h00 - 22h00" },
  { days: "Mardi", hours: "11h00 - 22h00" },
  { days: "Mercredi", hours: "11h00 - 22h00" },
  { days: "Jeudi", hours: "11h00 - 22h00" },
  { days: "Vendredi", hours: "11h00 - 22h00" },
  { days: "Samedi", hours: "11h00 - 22h00" },
  { days: "Dimanche", hours: "Fermé" },
];

// Image paths from https://labaguettemagiquesarttilman.be/
export const images = {
  hero: "/images/exterior.jpg", // Restaurant exterior image
  logo: "/images/cropped-cropped-logos-baguette-magiques-300x62.png", // Restaurant logo
  restaurant: "/images/exterior.jpg", // Restaurant exterior (same as hero)
  // Fallback to high-quality food images if local images not available
  fallback: {
    hero: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80", // Belgian frites
    food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", // Food spread
  },
};

