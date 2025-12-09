"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { menuCategories, getWhatsAppOrderUrl } from "@/lib/website-data";
import { useTheme } from "@/components/ThemeProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export type MenuItem = {
  name: string;
  description: string;
  price: string;
  highlight?: boolean;
  image?: string;
};

export type MenuCategory = {
  id: string;
  label: string;
  items: MenuItem[];
};

// Menu data structure matching website categories from https://labaguettemagiquesarttilman.be/
export const menuData: MenuCategory[] = [
  {
    id: "sandwiches-classique",
    label: "Sandwiches Classique",
    items: [
      {
        name: "Roi Dagobert",
        description: "Dagobert avec œufs mimosa. Petit: 5,50€ / Grand: 6,50€",
        price: "5,50 € - 6,50 €",
      },
      {
        name: "Américain Maison",
        description: "Steak haché maison, frites, sauce au choix. Petit: 5,00€ / Grand: 6,00€",
        price: "5,00 € - 6,00 €",
      },
      {
        name: "Dagobert",
        description: "Classique belge. Petit: 5,00€ / Grand: 6,00€",
        price: "5,00 € - 6,00 €",
      },
      {
        name: "Fromage",
        description: "Pain baguette, fromage belge, beurre, salade. Petit: 4,00€ / Grand: 5,00€",
        price: "4,00 € - 5,00 €",
      },
      {
        name: "Jambon",
        description: "Pain baguette, jambon artisanal, salade. Petit: 4,00€ / Grand: 5,00€",
        price: "4,00 € - 5,00 €",
      },
      {
        name: "Thon Maison",
        description: "Thon avec mayonnaise, cocktail ou piquant. Petit: 5,00€ / Grand: 6,00€",
        price: "5,00 € - 6,00 €",
      },
      {
        name: "Thon Pêches",
        description: "Thon avec pêches. Petit: 5,50€ / Grand: 6,50€",
        price: "5,50 € - 6,50 €",
      },
      {
        name: "Poulet Curry",
        description: "Poulet au curry, salade, tomate. Petit: 5,00€ / Grand: 6,00€",
        price: "5,00 € - 6,00 €",
      },
      {
        name: "Boulet Maison",
        description: "Boulet maison, compotée d'oignons. Petit: 5,00€ / Grand: 6,00€",
        price: "5,00 € - 6,00 €",
      },
      {
        name: "Sandwich du Chef",
        description: "Spécialité du chef. Petit: 6,00€ / Grand: 7,00€",
        price: "6,00 € - 7,00 €",
      },
    ],
  },
  {
    id: "sandwiches-speciaux",
    label: "Sandwiches spéciaux",
    items: [
      {
        name: "Salade Oeufs Mimosa Maison",
        description: "Oeufs mimosa maison. Petit: 4,50€ / Grand: 5,00€",
        price: "4,50 € - 5,00 €",
      },
      {
        name: "Italien",
        description: "Jambon de Parme, tomates séchées, parmesan, crème balsamique. Petit: 5,00€ / Grand: 6,00€",
        price: "5,00 € - 6,00 €",
      },
      {
        name: "Méditerranéo",
        description: "Italien avec pesto maison. Petit: 5,50€ / Grand: 6,50€",
        price: "5,50 € - 6,50 €",
      },
      {
        name: "Poulet Grillé Maison",
        description: "Poulet aux herbes de Provence, sauce Magique. Petit: 6,00€ / Grand: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Le Brie",
        description: "Brie, sirop de Liège et noix. Petit: 5,00€ / Grand: 6,00€",
        price: "5,00 € - 6,00 €",
      },
      {
        name: "Le Norvégien",
        description: "Saumon fumé, crudités, sauce Magique. Petit: 5,50€ / Grand: 6,50€",
        price: "5,50 € - 6,50 €",
        highlight: true,
      },
      {
        name: "Spécial Norvégien",
        description: "Norvégien avec fromages fines herbes. Petit: 6,00€ / Grand: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Le Danois",
        description: "Escalope de poulet, pesto maison, mozzarella, roquette et tomate fraîche. Petit: 6,50€ / Grand: 7,50€",
        price: "6,50 € - 7,50 €",
      },
      {
        name: "Le Végétarien",
        description: "Feta, concombre, chou, olives, tomates fraîches et sauce Magique. Petit: 4,50€ / Grand: 5,00€",
        price: "4,50 € - 5,00 €",
      },
    ],
  },
  {
    id: "sandwiches-chauds",
    label: "Sandwiches chauds",
    items: [
      {
        name: "Boulet Liégeois",
        description: "Boulet chaud, compotée d'oignons, frites croustillantes.",
        price: "9,80 €",
        highlight: true,
      },
      {
        name: "Américain",
        description: "Steak haché, frites, sauce andalouse, salade, tomate.",
        price: "8,50 €",
      },
      {
        name: "Poulet Curry",
        description: "Poulet grillé, curry, salade, tomate, sauce blanche.",
        price: "8,90 €",
      },
    ],
  },
  {
    id: "pitas",
    label: "Pitas",
    items: [
      {
        name: "Pita Normale",
        description: "Pita classique. Petite: 6,50€ / Grande: 9,00€",
        price: "6,50 € - 9,00 €",
      },
      {
        name: "Pita Fromage",
        description: "Pita avec fromage. Petite: 7,00€ / Grande: 9,50€",
        price: "7,00 € - 9,50 €",
      },
      {
        name: "Pita Hawaï",
        description: "Pita avec ananas et jambon. Petite: 7,00€ / Grande: 9,50€",
        price: "7,00 € - 9,50 €",
      },
      {
        name: "Pita Feta",
        description: "Pita avec feta grecque. Petite: 7,00€ / Grande: 9,50€",
        price: "7,00 € - 9,50 €",
      },
      {
        name: "Pita Falafel",
        description: "Pita avec falafel. Petite: 7,00€ / Grande: 9,50€",
        price: "7,00 € - 9,50 €",
      },
      {
        name: "Pita Toute Viande",
        description: "Pita avec toutes les viandes. Petite: 7,00€ / Grande: 9,50€",
        price: "7,00 € - 9,50 €",
      },
      {
        name: "Durüm",
        description: "Durüm classique.",
        price: "9,00 €",
      },
      {
        name: "Durüm Falafel",
        description: "Durüm avec falafel.",
        price: "9,00 €",
      },
      {
        name: "Supplément Fromage",
        description: "Ajout de fromage supplémentaire.",
        price: "0,50 €",
      },
    ],
  },
  {
    id: "salade",
    label: "Salade",
    items: [
      {
        name: "Salade Nature",
        description: "Salade verte fraîche.",
        price: "7,00 €",
      },
      {
        name: "Salade Oeuf Russe",
        description: "Salade avec œufs russes.",
        price: "7,50 €",
      },
      {
        name: "Salade Feta Grecque",
        description: "Feta grecque, olives, tomates fraîches.",
        price: "8,00 €",
      },
      {
        name: "Salade Thon",
        description: "Thon, salade verte, tomates, maïs.",
        price: "9,50 €",
      },
      {
        name: "Salade Américaine",
        description: "Steak haché, salade, tomates, sauce américaine.",
        price: "9,50 €",
      },
      {
        name: "Salade Poulet Grillé",
        description: "Poulet grillé, salade, tomates, sauce au choix.",
        price: "9,50 €",
      },
      {
        name: "Salade Falafel",
        description: "Falafel, salade, tomates, sauce tahini.",
        price: "9,50 €",
      },
      {
        name: "Salade Crousti",
        description: "Salade avec croûtons et fromage.",
        price: "9,50 €",
      },
      {
        name: "Salade Pita",
        description: "Salade avec pita et sauce au choix.",
        price: "9,50 €",
      },
      {
        name: "Salade Pêche",
        description: "Salade avec pêches et thon.",
        price: "9,50 €",
      },
    ],
  },
  {
    id: "assiettes-preparees",
    label: "Assiettes préparées",
    items: [
      {
        name: "Assiette Mixte",
        description: "Frites, viande au choix, salade, sauce au choix.",
        price: "12,50 €",
      },
      {
        name: "Assiette Poulet",
        description: "Frites, poulet grillé, salade, sauce au choix.",
        price: "11,90 €",
      },
      {
        name: "Assiette Kebab",
        description: "Frites, viande kebab, salade, tomate, sauce au choix.",
        price: "12,90 €",
      },
    ],
      },
      {
    id: "plats-prepares-commande",
    label: "Plats préparés sur commande",
    items: [
      {
        name: "Couscous Maison",
        description: "Couscous maison préparé sur commande. Servi avec salade et frites.",
        price: "16,00 €",
        highlight: true,
      },
      {
        name: "Lasagne Maison",
        description: "Lasagne maison. Petite: 6,00€ / Grande: 9,00€",
        price: "6,00 € - 9,00 €",
      },
      {
        name: "Supplément Aubergine",
        description: "Supplément aubergine. Petite: 6,00€ / Grande: 10,00€",
        price: "6,00 € - 10,00 €",
      },
      {
        name: "Merguez Kefta Brochette Gyros",
        description: "Assortiment merguez, kefta, brochette et gyros. Servi avec salade et frites.",
        price: "14,00 €",
      },
      {
        name: "2 Boulets Lapin",
        description: "Deux boulets lapin. Servi avec salade et frites.",
        price: "12,00 €",
      },
      {
        name: "2 Brochettes",
        description: "Deux brochettes. Servi avec salade et frites.",
        price: "12,00 €",
      },
      {
        name: "Filet Américain",
        description: "Filet américain. Servi avec salade et frites.",
        price: "12,00 €",
      },
      {
        name: "Merguez",
        description: "Merguez. Servi avec salade et frites.",
        price: "12,00 €",
      },
      {
        name: "Gyros",
        description: "Gyros. Servi avec salade et frites.",
        price: "12,00 €",
      },
      {
        name: "Falafel",
        description: "Falafel. Servi avec salade et frites.",
        price: "12,00 €",
      },
    ],
  },
  {
    id: "frites-snacks",
    label: "Frites & Snacks",
    items: [
      {
        name: "Frites",
        description: "Frites dorées maison. Petite: 3,00€ / Grande: 3,50€",
        price: "3,00 € - 3,50 €",
      },
      {
        name: "Sauces",
        description: "Mayonnaise, Tartare, Andalouse, Cocktail, Samouraï, Américain, Ketchup, Curry, Aioli, Aigre douce, Bicky, Hawaï, Sauce Lapin, Béarnaise, USA Forte.",
        price: "0,80 €",
      },
      {
        name: "Fricadelle / Viandelle",
        description: "Fricadelle ou viandelle. Petite: 3,00€",
        price: "3,00 €",
      },
      {
        name: "Boulet Froid / Cervelas",
        description: "Boulet froid ou cervelas.",
        price: "3,00 €",
      },
      {
        name: "Pouly Croc / Mexicanos",
        description: "Pouly croc ou mexicanos.",
        price: "3,00 €",
      },
      {
        name: "Boulet Lapin",
        description: "Boulet au lapin.",
        price: "3,50 €",
      },
      {
        name: "Mini Loempia / Chix Fingers",
        description: "6 pièces de mini loempia ou chix fingers.",
        price: "3,50 €",
      },
      {
        name: "Croquette de Volaille",
        description: "Croquette de volaille croustillante.",
        price: "3,00 €",
      },
      {
        name: "Cheese Crack",
        description: "Cheese crack croustillant.",
        price: "3,00 €",
      },
      {
        name: "Fricadelle / Viandelle",
        description: "Fricadelle ou viandelle. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Double Fricadelle / Viandelle",
        description: "Double portion. Petite: 8,00€ / Grande: 9,00€",
        price: "8,00 € - 9,00 €",
      },
      {
        name: "Hamburger",
        description: "Hamburger classique. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Double Hamburger",
        description: "Double hamburger. Petite: 8,00€ / Grande: 9,00€",
        price: "8,00 € - 9,00 €",
      },
      {
        name: "Pouly Croc",
        description: "Pouly croc croustillant. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Double Pouly Croc",
        description: "Double pouly croc. Petite: 8,00€ / Grande: 9,00€",
        price: "8,00 € - 9,00 €",
      },
      {
        name: "Cervelas",
        description: "Cervelas belge. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Mexicanos",
        description: "Mexicanos épicés. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Brochette",
        description: "Brochette de viande. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Merguez",
        description: "Merguez épicée. Petite: 7,00€ / Grande: 8,00€",
        price: "7,00 € - 8,00 €",
      },
      {
        name: "Double Merguez",
        description: "Double merguez. Petite: 8,00€ / Grande: 9,00€",
        price: "8,00 € - 9,00 €",
      },
      {
        name: "Bicky Burger",
        description: "Bicky burger belge.",
        price: "6,00 €",
      },
      {
        name: "Crocky",
        description: "Crocky croustillant. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Falafel",
        description: "Falafel maison. Petite: 6,00€ / Grande: 7,00€",
        price: "6,00 € - 7,00 €",
      },
      {
        name: "Magic Burger",
        description: "Burger spécial de la maison.",
        price: "9,00 €",
        highlight: true,
      },
      {
        name: "PITA",
        description: "Pita classique.",
        price: "8,00 €",
      },
    ],
  },
];

interface MenuSectionProps {
  data?: MenuCategory[];
}

export function MenuSection({ data = menuData }: MenuSectionProps) {
  const tabs = data.map((category) => ({ value: category.id, label: category.label }));
  const [activeCategory, setActiveCategory] = useState(tabs[0]?.value ?? "");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const currentItems = useMemo(
    () => data.find((category) => category.id === activeCategory)?.items ?? [],
    [activeCategory, data]
  );

  if (!tabs.length) {
    return null;
  }

  const { theme } = useTheme();

  return (
    <section id="menu" className="flex w-full flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${
          theme === "dark" ? "text-amber-300" : "text-amber-600"
        }`}>Menu Signature</p>
        <h2 className={`text-3xl font-bold sm:text-4xl ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}>Croquez dans le Sart-Tilman</h2>
        <p className={theme === "dark" ? "text-white/70" : "text-slate-600"}>
          Sélectionnez une catégorie pour découvrir nos créations craquantes, servies tous les jours avec des produits
          locaux et des frites croustillantes.
        </p>
      </div>

      <Tabs
        tabs={tabs}
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="w-full"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.map((item) => (
          <Card
            key={item.name}
            className={item.highlight ? "border-amber-400/40 bg-white/10" : undefined}
            onClick={() => setSelectedItem(item)}
          >
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-2xl font-bold whitespace-nowrap ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`}>
                  {item.price}
                </span>
              {item.highlight && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    theme === "dark"
                      ? "bg-amber-400/20 text-amber-200"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                  Coup de cœur
                </span>
              )}
              </div>
              <a
                href={getWhatsAppOrderUrl(item.name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full flex justify-center"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all py-2.5 px-4 sm:px-6 max-w-[140px] w-full sm:w-auto">
                  <WhatsAppIcon size={16} className="mr-2" />
                  <span className="text-sm sm:text-base">Commander</span>
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
        >
          <div className="space-y-4">
            <p className={`text-lg ${
              theme === "dark" ? "text-white/90" : "text-slate-700"
            }`}>{selectedItem.description}</p>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${
                theme === "dark" ? "text-amber-300" : "text-amber-600"
              }`}>{selectedItem.price}</span>
              {selectedItem.highlight && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  theme === "dark"
                    ? "bg-amber-400/20 text-amber-200"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  Coup de cœur
                </span>
              )}
            </div>
            <a
              href={getWhatsAppOrderUrl(selectedItem.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <WhatsAppIcon size={16} className="mr-2" />
                Commander {selectedItem.name}
              </Button>
            </a>
          </div>
        </Dialog>
      )}
    </section>
  );
}

