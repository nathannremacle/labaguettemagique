import { MenuSection, menuData } from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock3,
  Facebook,
  Instagram,
  MapPin,
  PhoneCall,
} from "lucide-react";

const openingHours = [
  { days: "Lundi - Vendredi", hours: "11h30 - 22h00" },
  { days: "Samedi", hours: "12h00 - 23h00" },
  { days: "Dimanche", hours: "Fermé" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-amber-400 text-center text-xl font-bold text-slate-950">
              LM
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                La Baguette
              </p>
              <p className="text-base font-semibold text-white">
                Magique
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
            <a href="#menu" className="transition hover:text-white">
              Menu
            </a>
            <a href="#about" className="transition hover:text-white">
              À propos
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </nav>

          <a href="tel:+32400000000" className="hidden md:inline-flex">
            <Button className="min-w-[150px] bg-amber-400 text-slate-950">
              <PhoneCall className="h-4 w-4" />
              Appeler
            </Button>
          </a>

          <a href="tel:+32400000000" className="md:hidden">
            <Button variant="outline">
              <PhoneCall className="h-4 w-4" />
              Appeler
            </Button>
          </a>
        </div>
      </header>

      <main className="relative isolate">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.15),_transparent_60%)]" />

        <section className="relative mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-slate-950/70" />

            <div className="relative z-10 flex flex-col gap-8 px-6 py-12 sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-6">
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-200">
                  Depuis 1998
                </p>
                <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  La meilleure friterie du Sart-Tilman
                </h1>
                <p className="text-lg text-white/80">
                  Recettes maisons, frites croustillantes et ambiance
                  chaleureuse. Passez commande ou venez savourer nos
                  spécialités sur place.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#menu">
                    <Button className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                      Voir le menu
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  <a href="#contact">
                    <Button variant="outline">
                      Commander / Contact
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
                  Horaires
                </p>
                <ul className="mt-4 space-y-3 text-white">
                  {openingHours.map((slot) => (
                    <li
                      key={slot.days}
                      className="flex items-center justify-between text-sm font-semibold"
                    >
                      <span>{slot.days}</span>
                      <span className="text-white/70">{slot.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <MenuSection data={menuData} />

        <section
          id="about"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8"
        >
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
              Fait maison
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Des classiques revisités et des recettes exclusives.
            </h2>
            <p className="text-white/70">
              Ingrédients locaux, sauces préparées sur place et cuisson
              minute : La Baguette Magique perpétue la tradition de la
              vraie friterie belge, tout en proposant des créations
              originales pour surprendre vos papilles.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-300" />
                Rue Sart-Tilman 372, 4031 Angleur
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-amber-300" />
                Service continu midi & soir
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-amber-200">
              À emporter ou à déguster sur place
            </h3>
            <p className="text-white/80">
              Précommandez par téléphone et récupérez votre commande
              sans attente. Notre équipe prépare vos frites uniquement
              à la commande pour garantir chaleur et croustillant.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/80">
              <span className="font-semibold text-white">
                Options :
              </span>
              <ul className="list-disc pl-5 text-white/70">
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
        className="border-t border-white/10 bg-slate-900/80"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Passez nous voir
            </h3>
            <p className="text-white/70">
              Rue Sart-Tilman, 372, 4031 Angleur
            </p>
            <div className="flex items-center gap-3 text-white/80">
              <PhoneCall className="h-4 w-4 text-amber-300" />
              <a href="tel:+32400000000" className="hover:text-amber-200">
                +32 4 00 00 00 00
              </a>
            </div>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10">
              <iframe
                src="https://www.google.com/maps?q=Rue+Sart-Tilman+372,+4031+Angleur,+Belgique&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
                title="Localisation La Baguette Magique - Rue Sart-Tilman 372, 4031 Angleur"
              />
            </div>
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} La Baguette Magique — Tous
              droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
