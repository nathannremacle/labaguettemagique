"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type MenuItem = {
  name: string;
  description: string;
  price: string;
  highlight?: boolean;
};

export type MenuCategory = {
  id: string;
  label: string;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  {
    id: "sandwiches",
    label: "Sandwiches",
    items: [
      {
        name: "Le Norvégien",
        description: "Saumon fumé, fromage frais citronné, crudités croquantes.",
        price: "8,90 €",
        highlight: true,
      },
      {
        name: "Classique Jambon",
        description: "Pain baguette, jambon artisanal, gouda, salade, sauce maison.",
        price: "6,50 €",
      },
      {
        name: "Boulet Liégeois",
        description: "Boulet chaud, compotée d’oignons, frites croustillantes.",
        price: "9,80 €",
      },
    ],
  },
  {
    id: "frites",
    label: "Frites & Snacks",
    items: [
      {
        name: "Cornet Tradition",
        description: "Frites dorées, sauce au choix, mayo, andalouse ou tartare.",
        price: "3,50 €",
      },
      {
        name: "Croquettes de Fromage",
        description: "Croûte croustillante, cœur coulant de fromage belge.",
        price: "5,90 €",
        highlight: true,
      },
      {
        name: "Frikandel Maison",
        description: "Classique hollandais, sauce pickles, oignons frits.",
        price: "4,60 €",
      },
    ],
  },
  {
    id: "salades",
    label: "Salades",
    items: [
      {
        name: "Salade César",
        description: "Suprêmes de poulet, parmesan affiné, croûtons beurre noisette.",
        price: "11,50 €",
      },
      {
        name: "Veggie Belge",
        description: "Betteraves rôties, chèvre frais, noix grillées, vinaigrette miel.",
        price: "10,80 €",
      },
      {
        name: "Niçoise du Sart",
        description: "Thon mariné, œufs fermiers, olives, pommes grenaille.",
        price: "12,30 €",
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

  const currentItems = useMemo(
    () => data.find((category) => category.id === activeCategory)?.items ?? [],
    [activeCategory, data]
  );

  if (!tabs.length) {
    return null;
  }

  return (
    <section id="menu" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Menu Signature</p>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Croquez dans le Sart-Tilman</h2>
        <p className="text-white/70">
          Sélectionnez une catégorie pour découvrir nos créations craquantes, servies tous les jours avec des produits
          locaux et des frites croustillantes.
        </p>
      </div>

      <Tabs
        tabs={tabs}
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="max-w-3xl"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.map((item) => (
          <Card
            key={item.name}
            className={item.highlight ? "border-amber-400/40 bg-white/10" : undefined}
          >
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-amber-300">{item.price}</span>
              {item.highlight && (
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                  Coup de cœur
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

