"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Clock3,
  Facebook,
  MapPin,
  PhoneCall,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { contactInfo, openingHours, images, getWhatsAppUrl } from "@/lib/website-data";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createSlug } from "@/lib/utils";

type RestaurantStatus = {
  isOpen: boolean;
  message?: string;
};

type FooterItem = {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  link?: string;
  menu_item_name?: string;
  menu_category_id?: string;
};

// Footer Items Section Component
function FooterItemsSection() {
  const { theme } = useTheme();
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch("/api/footer")
      .then((res) => res.json())
      .then((data: FooterItem[]) => {
        if (Array.isArray(data)) {
          setFooterItems(data);
          // Trigger animation after items are loaded
          setTimeout(() => setIsVisible(true), 100);
        }
      })
      .catch(() => {
        // Silently fail - footer items are optional
        setFooterItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || footerItems.length === 0) {
    return null;
  }

  return (
    <section className={`mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 mt-16 rounded-3xl ${
      theme === "dark" ? "bg-slate-900/50" : "bg-slate-50"
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {footerItems.map((item, index) => {
          // Generate link URL: Priority 1 - menu item, Priority 2 - regular link
          let itemUrl: string | null = null;
          const hasMenuLink = item.menu_category_id && 
                              item.menu_item_name && 
                              item.menu_category_id.trim() !== "" && 
                              item.menu_item_name.trim() !== "";
          
          if (hasMenuLink) {
            // Generate menu item URL
            const categorySlug = createSlug(item.menu_category_id);
            const itemSlug = createSlug(item.menu_item_name);
            itemUrl = `/menu/${categorySlug}/${itemSlug}`;
          } else if (item.link) {
            // Use regular link
            itemUrl = item.link;
          }

          const hasLink = itemUrl !== null;
          const animationDelay = index * 150; // Stagger animation delay

          const content = (
            <div 
              className={`p-6 rounded-2xl border transition-all duration-300 ease-out ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
              } ${hasLink ? "cursor-pointer hover:scale-105 hover:shadow-lg" : ""} ${
                isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-4"
              }`}
              style={{
                animationDelay: isVisible ? `${animationDelay}ms` : undefined
              }}
            >
              {item.icon && (
                <div 
                  className={`mb-4 text-3xl transition-transform duration-300 ${
                    theme === "dark" ? "text-amber-300" : "text-amber-600"
                  } ${hasLink ? "group-hover:scale-110 group-hover:rotate-6" : ""} ${
                    isVisible ? "animate-icon-bounce-in" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: isVisible ? `${animationDelay + 200}ms` : undefined
                  }}
                >
                  {item.icon}
                </div>
              )}
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              } ${hasLink ? "group-hover:text-amber-500" : ""}`}>
                {item.title}
              </h3>
              {item.description && (
                <p className={`text-sm transition-colors duration-300 ${
                  theme === "dark" ? "text-white/70" : "text-slate-600"
                }`}>
                  {item.description}
                </p>
              )}
            </div>
          );

          if (hasLink && itemUrl) {
            const isExternalLink = itemUrl.startsWith("http");
            const isMenuLink = hasMenuLink && itemUrl.startsWith("/menu/") && itemUrl.split("/").length >= 4;
            
            // Use Next.js Link for internal menu links to enable focus mode
            if (isMenuLink && !isExternalLink) {
              return (
                <Link
                  key={item.id}
                  href={itemUrl}
                  className="block group"
                >
                  {content}
                </Link>
              );
            }
            
            // Use regular anchor for external links
            return (
              <a
                key={item.id}
                href={itemUrl}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noopener noreferrer" : undefined}
                className="block group"
              >
                {content}
              </a>
            );
          }

          return <div key={item.id} className="group">{content}</div>;
        })}
      </div>
    </section>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState<RestaurantStatus>({ isOpen: true });

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data: RestaurantStatus) => setStatus(data))
      .catch(() => setStatus({ isOpen: true }));
  }, []);

  return (
    <div className={`min-h-screen transition-colors ${
      theme === "dark" 
        ? "bg-slate-950 text-white" 
        : "bg-white text-slate-900"
    }`}>
      <header className={`sticky top-0 z-20 border-b backdrop-blur ${
        theme === "dark"
          ? "border-white/10 bg-slate-950/70"
          : "border-slate-200 bg-white/70"
      }`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image
              src={images.logo}
              alt={`${contactInfo.name} Logo`}
              width={300}
              height={62}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

          {/* Single bar navigation menu */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <a 
              href="/menu" 
              className={`px-4 py-2 rounded-full transition ${
                theme === "dark"
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Menu
            </a>
            <a 
              href="#about" 
              className={`px-4 py-2 rounded-full transition ${
                theme === "dark"
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              À propos
            </a>
            <a 
              href="#contact" 
              className={`px-4 py-2 rounded-full transition ${
                theme === "dark"
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Contact
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <a 
              href={getWhatsAppUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all px-5 py-2 text-sm font-semibold"
            >
              <WhatsAppIcon size={16} />
              Commander maintenant
            </a>
            <a 
              href={`tel:${contactInfo.phone.mobileTel}`}
              className="min-w-[120px] inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <PhoneCall className="h-4 w-4" />
              Appeler
            </a>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full transition ${
                theme === "dark"
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${
            theme === "dark" ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"
          }`}>
            <nav className="mx-auto flex flex-col gap-1 px-4 py-4 max-w-6xl">
              <a
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg transition ${
                  theme === "dark"
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Menu
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg transition ${
                  theme === "dark"
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                À propos
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg transition ${
                  theme === "dark"
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Contact
              </a>
              <div className="flex gap-2 mt-2 pt-4 border-t border-white/10">
                <a 
                  href={getWhatsAppUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 text-sm font-semibold transition"
                >
                  <WhatsAppIcon size={16} />
                  Commander
                </a>
                <a 
                  href={`tel:${contactInfo.phone.mobileTel}`} 
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <PhoneCall className="h-4 w-4" />
                  Appeler
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Status Banner */}
      {!status.isOpen && (
        <div className={`w-full py-3 px-4 text-center ${
          theme === "dark" ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800"
        }`}>
          <p className="font-semibold">
            {status.message || "Fermé actuellement"}
          </p>
        </div>
      )}

      <main className={`relative isolate ${
        theme === "dark" 
          ? "bg-slate-950" 
          : "bg-white"
      }`}>
        <div className={`pointer-events-none absolute inset-0 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.15),_transparent_60%)]"
            : "bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.05),_transparent_60%)]"
        }`} />

        <div className="h-8" />

        <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-[32px] border ${
            theme === "dark"
              ? "border-white/10 bg-slate-900"
              : "border-slate-200 bg-slate-100"
          }`}>
            {/* Hero Image - Restaurant exterior from website */}
            <div className="absolute inset-0">
              <Image
                src={images.hero}
                alt={`${contactInfo.name} - Restaurant extérieur`}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
            {theme === "dark" && (
            <div className="absolute inset-0 bg-slate-950/70" />
            )}

            <div className="relative z-10 flex flex-col gap-8 px-6 py-12 sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between my-8">
              <div className="max-w-2xl space-y-6">
                <p className={`text-sm font-semibold uppercase tracking-[0.4em] ${
                  theme === "dark" 
                    ? "text-amber-200" 
                    : "text-amber-600 drop-shadow-lg"
                }`}>
                  Depuis 1998
                </p>
                <h1 className={`text-4xl font-black leading-tight sm:text-5xl lg:text-6xl ${
                  theme === "dark" 
                    ? "text-white" 
                    : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                }`}>
                  La meilleure friterie du Sart-Tilman
                </h1>
                <p className={`text-lg ${
                  theme === "dark" 
                    ? "text-white/80" 
                    : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                }`}>
                  {contactInfo.description} Recettes maisons, frites croustillantes et ambiance
                  chaleureuse. Passez commande ou venez savourer nos
                  spécialités sur place.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href={getWhatsAppUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all text-base px-6 py-3 font-semibold"
                  >
                    <WhatsAppIcon size={20} />
                    Commander sur WhatsApp
                  </a>
                  <a 
                    href="/menu"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10 shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Voir le menu
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <div className={`rounded-3xl border p-6 backdrop-blur ${
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-slate-300/50 bg-white/20"
              }`}>
                <p className={`text-sm uppercase tracking-[0.3em] ${
                  theme === "dark" ? "text-amber-200" : "text-amber-600"
                }`}>
                  Horaires
                </p>
                <ul className={`mt-4 space-y-3 ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  {openingHours.map((slot) => (
                    <li
                      key={slot.days}
                      className="flex items-center justify-between gap-4 text-sm font-semibold"
                    >
                      <span className="min-w-[120px]">{slot.days}</span>
                      <span className={`text-right ${
                        theme === "dark" ? "text-white/70" : "text-slate-600"
                      }`}>{slot.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Items Section */}
        <FooterItemsSection />

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <a 
            href="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-lg px-8 py-6 shadow-2xl hover:shadow-2xl transition-all duration-300 border border-white/10 font-semibold"
          >
            Voir le menu complet
            <ArrowRight className="h-5 w-5" />
          </a>
        </section>

        <section
          id="about"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8"
        >
          <div className="flex-1 space-y-6">
            <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${
              theme === "dark" ? "text-amber-200" : "text-amber-600"
            }`}>
              Fait maison
            </p>
            <h2 className={`text-3xl font-bold sm:text-4xl ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              Des classiques revisités et des recettes exclusives.
            </h2>
            <p className={theme === "dark" ? "text-white/70" : "text-slate-600"}>
              Ingrédients locaux, sauces préparées sur place et cuisson
              minute : La Baguette Magique perpétue la tradition de la
              vraie friterie belge, tout en proposant des créations
              originales pour surprendre vos papilles.
            </p>
            <div className={`flex flex-wrap gap-4 text-sm ${
              theme === "dark" ? "text-white/70" : "text-slate-600"
            }`}>
              <div className="flex items-center gap-2">
                <MapPin className={`h-4 w-4 ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`} />
                {contactInfo.address.full}
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className={`h-4 w-4 ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`} />
                Service continu midi & soir
              </div>
            </div>
          </div>

          <div className={`flex-1 space-y-4 rounded-3xl border p-8 shadow-2xl ${
            theme === "dark"
              ? "border-white/10 bg-gradient-to-br from-slate-900 to-slate-800"
              : "border-slate-200 bg-gradient-to-br from-slate-50 to-white"
          }`}>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-4">
              <Image
                src={images.restaurant}
                alt={`${contactInfo.name} - Restaurant`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <h3 className={`text-xl font-semibold ${
              theme === "dark" ? "text-amber-200" : "text-amber-600"
            }`}>
              À emporter ou à déguster sur place
            </h3>
            <p className={theme === "dark" ? "text-white/80" : "text-slate-700"}>
              Précommandez par téléphone et récupérez votre commande
              sans attente. Notre équipe prépare vos frites uniquement
              à la commande pour garantir chaleur et croustillant.
            </p>
            <div className={`flex flex-col gap-3 text-sm ${
              theme === "dark" ? "text-white/80" : "text-slate-700"
            }`}>
              <span className={`font-semibold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                Options :
              </span>
              <ul className={`list-disc pl-5 ${
                theme === "dark" ? "text-white/70" : "text-slate-600"
              }`}>
                <li>Sauces maison et mayonnaise à la belge</li>
                <li>Pains artisanaux livrés chaque matin</li>
                <li>Menu étudiant du lundi au jeudi</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className={`mt-16 border-t pt-8 ${
          theme === "dark"
            ? "border-white/10 bg-slate-900/80"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <h3 className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              Passez nous voir
            </h3>
            <p className={theme === "dark" ? "text-white/70" : "text-slate-600"}>
              {contactInfo.address.full}
            </p>
            <div className="space-y-2">
              <div className={`flex items-center gap-3 ${
                theme === "dark" ? "text-white/80" : "text-slate-700"
              }`}>
                <PhoneCall className={`h-4 w-4 ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`} />
                <a href={`tel:${contactInfo.phone.mobileTel}`} className={`hover:${
                  theme === "dark" ? "text-amber-200" : "text-amber-700"
                }`}>
                  {contactInfo.phone.mobile}
                </a>
              </div>
              <div className={`flex items-center gap-3 ${
                theme === "dark" ? "text-white/80" : "text-slate-700"
              }`}>
                <PhoneCall className={`h-4 w-4 ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`} />
                <a href={`tel:${contactInfo.phone.landlineTel}`} className={`hover:${
                  theme === "dark" ? "text-amber-200" : "text-amber-700"
                }`}>
                  {contactInfo.phone.landline}
                </a>
              </div>
              <div className={`flex items-center gap-3 ${
                theme === "dark" ? "text-white/80" : "text-slate-700"
              }`}>
                <Mail className={`h-4 w-4 ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`} />
                <a href={`mailto:${contactInfo.email}`} className={`hover:${
                  theme === "dark" ? "text-amber-200" : "text-amber-700"
                }`}>
                  {contactInfo.email}
                </a>
              </div>
              <a 
                href={getWhatsAppUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-3 transition-colors ${
                  theme === "dark" 
                    ? "text-white/80 hover:text-green-400" 
                    : "text-slate-700 hover:text-green-600"
                }`}
              >
                <WhatsAppIcon size={20} className="text-green-500" />
                <span className="font-medium">Commander sur WhatsApp</span>
              </a>
            </div>
            <div className="flex gap-4">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-500 bg-green-600 text-white transition-all hover:bg-green-700 hover:border-green-600 hover:scale-110 shadow-lg hover:shadow-green-500/50"
                aria-label="Commander sur WhatsApp"
                title="Commander sur WhatsApp"
              >
                <WhatsAppIcon size={24} />
                <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${
                  theme === "dark" ? "bg-slate-800" : "bg-slate-900"
                }`}>
                  Commander
                </span>
              </a>
              <a
                href="https://www.facebook.com/ben.karim.2904/"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${
                  theme === "dark"
                    ? "border-white/20 text-white/70 hover:border-white hover:text-white"
                    : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                }`}
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(contactInfo.address.full)}+Belgique&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
                title={`Localisation ${contactInfo.name} - ${contactInfo.address.full}`}
              />
              {/* Mobile Google Maps button overlay */}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address.full)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg hover:shadow-xl transition-all px-4 py-2.5 text-sm font-semibold border border-gray-200 active:scale-95"
                aria-label="Ouvrir dans Google Maps"
              >
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Ouvrir dans Maps</span>
              </a>
            </div>
            <p className={`text-xs ${
              theme === "dark" ? "text-white/50" : "text-slate-400"
            }`}>
              © {new Date().getFullYear()} La Baguette Magique — Tous
              droits réservés.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
