"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { submitInquiry } from "@/lib/inquiry";
import { Button } from "@/components/ui/button";
import {
  buildKnowledgeBase,
  DEFAULT_GREETING_BUTTONS,
  extractLeadTag,
  isValidLocation,
  matchKnowledge,
  parseArea,
  parseContact,
  type KnowledgeEntry,
} from "@/lib/chat";

const ASSISTANT_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/nano-assistant`;

type Message = {
  type: "bot" | "user";
  text: string;
  quickReplies?: string[];
  /** čas napsání zprávy (HH:MM:SS) pro přepis v administraci */
  time?: string;
};

const nowTime = () => new Date().toLocaleTimeString("cs-CZ");

type ChatState = "INIT" | "ASK_SERVICE" | "ASK_ADDRESS" | "ASK_AREA" | "ASK_CONTACT" | "FINISHED";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [chatState, setChatState] = useState<ChatState>("INIT");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [botKnowledge, setBotKnowledge] = useState<Record<string, KnowledgeEntry>>({});
  const [greetingButtons, setGreetingButtons] = useState<string[]>([]);

  const [userData, setUserData] = useState({
    service: "",
    location: "",
    area: "",
    contact: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Získá aktuální hodinu pro správný pozdrav
  const getGreeting = () => {
    const hour = new Date().getHours();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const welcome = isMobile
      ? "Zdravím! Jsem váš Nano-asistent. 📱"
      : "Dobrý den! Jsem váš Nano-asistent pro ochranu povrchů.";

    if (hour < 12) return welcome + " Jak vám mohu dnes ráno pomoci?";
    if (hour < 18) return welcome + " S čím vám mohu dnes pomoci?";
    return welcome + " Přejete si probrat ochranu vašeho objektu?";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const initBot = async () => {
      const { data: configData } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "nanobot_enabled")
        .maybeSingle();

      if (configData && configData.value === "true") {
        setIsBotEnabled(true);
        setSessionId(`chat_${crypto.randomUUID()}`);

        // chat se po načtení stránky sám otevře (setIsOpen(true) je idempotentní)
        setTimeout(() => setIsOpen(true), 1200);
      }

      // Load bot knowledge
      const { data: knowledgeData } = await supabase.from("bot_knowledge").select("*").eq("is_active", true);

      if (knowledgeData) {
        setBotKnowledge(buildKnowledgeBase(knowledgeData));

        const greetingEntry = knowledgeData.find((k) => k.title === "GREETING_BUTTONS");
        if (greetingEntry) {
          setGreetingButtons(greetingEntry.content.split(",").map((s: string) => s.trim()));
        } else {
          setGreetingButtons(DEFAULT_GREETING_BUTTONS);
        }
      }
    };

    initBot();
  }, []);

  // Přepis konverzace se ukládá přes serverové API (zobrazí se v administraci → Chaty)
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;

    fetch("/api/chat-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken: sessionId,
        userIdentifier: userData.contact || userData.location || "Návštěvník",
        messages: messages.map((m) => ({
          type: m.type === "bot" ? "Asistent" : "Zákazník",
          role: m.type === "bot" ? "assistant" : "user",
          text: m.text.slice(0, 4000),
          time: m.time ?? nowTime(),
        })),
      }),
    }).catch((err) => console.error("Chat sync error:", err));
  }, [messages, sessionId, userData.contact, userData.location]);

  // Uvítání se zobrazí jednou po otevření chatu. Nikdy nepřepíše zprávy, které
  // zákazník mezitím napsal (efekt se znovu spouští i po načtení tlačítek).
  const greetingScheduled = useRef(false);
  useEffect(() => {
    if (!isOpen || chatState !== "INIT" || greetingScheduled.current) return;
    greetingScheduled.current = true;
    setTimeout(() => {
      setChatState((state) => (state === "INIT" ? "ASK_SERVICE" : state));
      setMessages((prev) => [
        {
          type: "bot",
          text: getGreeting(),
          time: nowTime(),
          quickReplies: greetingButtons.length > 0 ? greetingButtons : DEFAULT_GREETING_BUTTONS,
        },
        ...prev,
      ]);
    }, 500);
  }, [isOpen, chatState, greetingButtons]);

  const handleLeadFlow = (original: string, state: ChatState) => {
    switch (state) {
      case "ASK_SERVICE":
        setUserData((prev) => ({ ...prev, service: original }));
        setChatState("ASK_ADDRESS");
        botSay("Skvělá volba! Pro začátek mi napište **přesnou adresu realizace** (kvůli výpočtu dopravy). 📍");
        break;

      case "ASK_ADDRESS": {
        if (!isValidLocation(original)) {
          botSay("Napište prosím platné město nebo obec, kde se objekt nachází. 📍");
          return;
        }
        setUserData((prev) => ({ ...prev, location: original }));
        setChatState("ASK_AREA");
        botSay(`Děkuji! Lokaci **${original}** jsem uložil. O jak **velkou plochu** (m²) se přibližně jedná?`);
        break;
      }

      case "ASK_AREA": {
        const area = parseArea(original);
        if (!area) {
          botSay("Napište prosím přibližný počet m² (stačí číslo). 🔢");
          return;
        }
        setUserData((prev) => ({ ...prev, area }));
        setChatState("ASK_CONTACT");
        botSay(
          "Děkuji. Poslední krok - zanechte mi prosím vaše **telefonní číslo**, ať se vám můžeme ozvat s nabídkou. 📞"
        );
        break;
      }

      case "ASK_CONTACT": {
        const contact = parseContact(original);
        if (!contact) {
          botSay("Zadejte prosím platné telefonní číslo (např. 774 509 409) nebo e-mail. 📱✉️");
          return;
        }
        // vedlejší efekty (zprávy, uložení poptávky) mimo updater stavu, ať
        // se v React StrictMode neprovedou dvakrát
        const lead = { ...userData, contact: original };
        setUserData(lead);
        setChatState("FINISHED");
        botSay("Perfektní, vaše poptávka je v systému! ✨");
        botSay(
          `**Rekapitulace:**\n• Služba: ${lead.service}\n• Adresa: ${lead.location}\n• Plocha: ${lead.area} m²\n• Kontakt: ${original}\n\n*Kolegové se vám ozvou s finální cenou včetně dopravy do 24 hodin.*`
        );
        botSay("Co by vás zajímalo dál?", ["🔗 Ukázat Recenze", "🔗 Ukázat Realizace", "🔗 Ostatní Služby"]);

        submitInquiry({
          name: "Zákazník z Chatu",
          phone: contact.kind === "phone" ? contact.value : "",
          email: contact.kind === "email" ? contact.value : "",
          service: lead.service || "Konzultace z chatu",
          message: `Poptávka z AI Chatu. Lokace: ${lead.location || "Neznámá"}, Plocha: ${lead.area || "Neznámá"} m².`,
          source: "chat",
        }).catch((err) => console.error("Inquiry Save Error:", err));
        break;
      }

      case "FINISHED":
        botSay("Jsem připraven na vaše dotazy. Co vás konkrétně zajímá ohledně našich technologií nebo záruk?");
        break;

      default:
        botSay("Rozumím. S čím dalším vám mohu pomoci?");
    }
  };

  const botSay = (text: string, quickReplies: string[] = [], delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { type: "bot", text, quickReplies, time: nowTime() }]);
    }, delay);
  };

  const processInput = async (input: string) => {
    // 1. Znalostní báze - rychlá odpověď na časté dotazy bez volání AI
    const knownAnswer = matchKnowledge(input, botKnowledge);
    if (knownAnswer) {
      botSay(knownAnswer);
      if (chatState !== "FINISHED") {
        setTimeout(() => {
          botSay(
            "Vraťme se ale k vaší poptávce - klidně mi řekněte víc o tom, co potřebujete, ať vám můžu pomoct dál. 🙂"
          );
        }, 2500);
      }
      return;
    }

    // 2. Vše ostatní odpovídá AI (edge funkce nano-assistant), která umí vést
    // celý rozhovor včetně získání kontaktu (značka [LEAD: ...] v odpovědi).
    // Řízený dialog (handleLeadFlow) je jen záloha, když volání AI selže.
    // 3. OpenAI Edge Function
    botSay("Půjdu se na to zeptat mého nano-mozku... 🧠", [], 400);

    try {
      const historyToSent = messages.slice(-5).map((h) => ({
        role: h.type === "bot" ? "assistant" : "user",
        content: h.text,
      }));

      // Přidat právě zadanou zprávu, pokud tam ještě není, history se updatuje asynchronně
      historyToSent.push({ role: "user", content: input });

      const response = await fetch(ASSISTANT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages: historyToSent }),
      });

      const data = await response.json();
      if (data.reply) {
        const { lead, text } = extractLeadTag(data.reply);
        if (lead) {
          const contact = parseContact(lead.contact || userData.contact || "");
          submitInquiry({
            name: lead.name || "Zákazník z AI Chatu",
            phone: contact?.kind === "phone" ? contact.value : "",
            email: contact?.kind === "email" ? contact.value : "",
            service: userData.service || "Konzultace z chatu",
            message: `Poptávka vygenerovaná plně přes AI Chat.\nLokace: ${lead.address || userData.location || "Neznámé"}\nPlocha: ${lead.area || "Neznámé"} m²\nJméno: ${lead.name || "Neznámé"}\nKontakt: ${lead.contact || userData.contact || "Neuvedeno"}`,
            source: "chat",
          }).catch((err) => console.error("AI Lead Inquiry Save Error:", err));
          setChatState("FINISHED");
        }
        botSay(text);
      } else {
        throw new Error("No reply from AI");
      }
    } catch (e) {
      console.error("AI Error:", e);
      // Fallback
      handleLeadFlow(input, chatState);
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { type: "user", text, time: nowTime() }]);
    setInputValue("");
    processInput(text);
  };

  // Jednoduchý markdown: **tučně** a zalomení řádků
  const renderText = (text: string) =>
    text.split("\n").map((line, li) => (
      <React.Fragment key={li}>
        {li > 0 && <br />}
        {line
          .split(/(\*\*.*?\*\*)/g)
          .map((part, pi) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={pi}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={pi}>{part}</span>
            )
          )}
      </React.Fragment>
    ));

  if (!isBotEnabled) return null;

  return (
    <>
      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
          aria-label="Otevřít chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Nano-Asistent</h3>
                <p className="text-xs text-white/80">Odborník na hloubkové čištění a ochranu</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    msg.type === "user"
                      ? "bg-amber-500 text-white rounded-br-sm"
                      : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {renderText(msg.text)}
                </div>

                {/* Quick Replies */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.quickReplies.map((reply, ridx) => (
                      <button
                        key={ridx}
                        onClick={() => {
                          if (reply.startsWith("🔗")) {
                            // Simple navigation fallback
                            const target = reply.includes("Recenze")
                              ? "reference"
                              : reply.includes("Realizace")
                                ? "realizace"
                                : reply.includes("Služby")
                                  ? "sluzby"
                                  : "";
                            if (target) {
                              const el = document.getElementById(`${target}-sec`);
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth" });
                                setIsOpen(false);
                              }
                            }
                          } else {
                            handleSend(reply);
                          }
                        }}
                        className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-500 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Napište zprávu..."
              className="flex-1 max-h-32 min-h-[44px] resize-none px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              rows={1}
            />
            <Button
              onClick={() => handleSend(inputValue)}
              variant="primary"
              size="sm"
              className="h-[44px] w-[44px] rounded-xl p-0 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
