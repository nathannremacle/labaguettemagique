"use client";

import { useMemo, useState, memo } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { getWhatsAppOrderUrl } from "@/lib/website-data";
import { useTheme } from "@/components/ThemeProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export type MenuItem = {
  id?: number;
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

interface MenuSectionProps {
  data: MenuCategory[];
}

export const MenuSection = memo(function MenuSection({ data }: MenuSectionProps) {
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
                  {item.price && !item.price.includes('€') ? `${item.price} €` : item.price}
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
});

