"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Phone } from "lucide-react";
import { getWhatsAppUrl, contactInfo } from "@/lib/website-data";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "bot" }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          text: `Bonjour ! 👋 Bienvenue chez ${contactInfo.name}. Comment puis-je vous aider ?`,
          sender: "bot",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = { text: message, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);

    // Add bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Parfait ! Je vais ouvrir WhatsApp pour que vous puissiez envoyer votre commande. 📱",
          sender: "bot",
        },
      ]);
    }, 500);

    // Open WhatsApp with the message
    setTimeout(() => {
      const whatsappUrl = getWhatsAppUrl(message);
      window.open(whatsappUrl, "_blank");
      setMessage("");
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickMessages = [
    "Je voudrais passer une commande",
    "Quels sont vos horaires ?",
    "Quelle est votre adresse ?",
    "Avez-vous des options végétariennes ?",
  ];

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full shadow-2xl transition-all hover:scale-105 px-4 py-3 md:px-5 md:py-4 ${
            theme === "dark"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          aria-label="Ouvrir le chat WhatsApp"
        >
          <div className="relative">
            <WhatsAppIcon size={28} className="md:h-7 md:w-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300"></span>
            </span>
          </div>
          <span className="hidden md:block font-semibold text-sm md:text-base pr-2">
            Chat WhatsApp
          </span>
        </button>
      )}

      {/* Chat Widget Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl transition-all w-[90vw] sm:w-96 h-[600px] ${
            theme === "dark"
              ? "bg-slate-900 border border-white/10"
              : "bg-white border border-slate-200"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 rounded-t-2xl ${
              theme === "dark" ? "bg-green-600" : "bg-green-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <WhatsAppIcon size={24} className="text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{contactInfo.name}</h3>
                <p className="text-white/80 text-xs">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${contactInfo.phone.mobileTel}`}
                className="p-2 rounded-full hover:bg-white/20 transition"
                aria-label="Appeler"
              >
                <Phone className="h-5 w-5 text-white" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              theme === "dark" ? "bg-slate-950" : "bg-slate-50"
            }`}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === "user"
                      ? theme === "dark"
                        ? "bg-green-600 text-white"
                        : "bg-green-600 text-white"
                      : theme === "dark"
                        ? "bg-slate-800 text-white"
                        : "bg-white text-slate-900 border border-slate-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Messages */}
          {messages.length <= 2 && (
            <div className={`px-4 py-2 border-t ${
              theme === "dark" ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}>
              <p className={`text-xs mb-2 ${
                theme === "dark" ? "text-white/60" : "text-slate-500"
              }`}>
                Messages rapides :
              </p>
              <div className="flex flex-wrap gap-2">
                {quickMessages.map((quickMsg, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(quickMsg)}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      theme === "dark"
                        ? "bg-slate-800 text-white/80 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {quickMsg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div
            className={`p-4 border-t ${
              theme === "dark"
                ? "border-white/10 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className={`flex-1 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === "dark"
                    ? "bg-slate-800 text-white placeholder:text-white/50"
                    : "bg-slate-100 text-slate-900 placeholder:text-slate-500"
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`p-2 rounded-full transition ${
                  message.trim()
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : theme === "dark"
                      ? "bg-slate-800 text-white/30 cursor-not-allowed"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                aria-label="Envoyer"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className={`text-xs mt-2 text-center ${
              theme === "dark" ? "text-white/50" : "text-slate-500"
            }`}>
              Appuyez sur Entrée pour envoyer
            </p>
          </div>
        </div>
      )}
    </>
  );
}

