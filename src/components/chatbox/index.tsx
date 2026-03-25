import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Coffee,
  MoreVertical
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  sender: "user" | "bot";
  timestamp: Date;
  text?: string;
  textKey?: string;
}

const TypingIndicator = () => (
  <div className="flex gap-1 px-2 py-1">
    {[0, 0.2, 0.4].map((delay) => (
      <motion.span
        key={delay}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay }}
        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
      />
    ))}
  </div>
);

const Chatbox: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const BOT_RESPONSE_KEYS = [
    "chatbox.botResponse1",
    "chatbox.botResponse2",
    "chatbox.botResponse3",
    "chatbox.botResponse4",
  ] as const;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      textKey: "chatbox.greeting",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const randomKey =
        BOT_RESPONSE_KEYS[Math.floor(Math.random() * BOT_RESPONSE_KEYS.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        textKey: randomKey,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[calc(100vw-2rem)] max-w-[380px] h-[70vh] max-h-[520px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 dark:border-zinc-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-[#4B3621] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <Coffee size={20} className="text-amber-200" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#4B3621] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none mb-1">
                    {t("common.brandName")}
                  </h3>
                  <p className="text-[10px] text-amber-200/70 font-bold uppercase tracking-widest">
                    {t("chatbox.alwaysOnline")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.sender === 'user'
                        ? 'bg-[#4B3621] text-white rounded-tr-none'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-tl-none'
                      }`}
                    >
                      {msg.textKey ? t(msg.textKey) : msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-zinc-800 p-2 rounded-2xl rounded-tl-none shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
              <div className="relative flex items-center bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm focus-within:ring-2 focus-within:ring-[#4B3621]/20 transition-all overflow-hidden">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("chatbox.placeholder")}
                  className="w-full py-4 pl-5 pr-14 bg-transparent outline-none text-sm dark:text-zinc-200"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 p-3 bg-[#4B3621] text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:bg-[#3d2c1b] active:scale-95 shadow-lg shadow-[#4B3621]/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

   
    </div>
  );
};

export default Chatbox;
