import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Coffee
} from "lucide-react";
import { toast } from "react-toastify";
import "./index.scss";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const TypingIndicator = () => (
  <div className="chatbox__typing">
    <motion.span
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
    />
    <motion.span
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
    />
    <motion.span
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

const Chatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Phan Coffee có thể giúp gì cho bạn hôm nay?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      const botResponses = [
        "Chúng tôi cung cấp các loại cà phê rang mộc nguyên chất 100%.",
        "Bạn có thể xem thực đơn tại phần 'Cà phê' trên thanh menu nhé!",
        "Phan Coffee có dịch vụ giao hàng tận nơi tại Kon Tum và toàn quốc.",
        "Cảm ơn bạn đã quan tâm, chúng tôi sẽ sớm có nhân viên hỗ trợ trực tiếp.",
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      toast.info("Yêu cầu của bạn đã được tiếp nhận!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbox">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbox__window"
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="chatbox__header">
              <div className="chatbox__header-info">
                <div className="chatbox__avatar-status">
                  <Coffee size={20} className="text-[#dfa88b]" />
                  <span className="chatbox__status-dot" />
                </div>
                <div>
                  <h3>Phan Coffee</h3>
                  <p>Hỗ trợ trực tuyến</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="chatbox__close">
                <X size={20} />
              </button>
            </div>

            <div className="chatbox__messages">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`chatbox__message chatbox__message--${msg.sender}`}
                >
                  <div className="chatbox__message-bubble">
                    {msg.text}
                  </div>
                  <span className="chatbox__message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <div className="chatbox__message chatbox__message--bot">
                  <div className="chatbox__message-bubble">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbox__input-area">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Câu hỏi của bạn..."
                className="chatbox__input"
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim()}
                className="chatbox__send"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`chatbox__toggle ${isOpen ? 'chatbox__toggle--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
           <motion.span 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="chatbox__badge"
           >
             1
           </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default Chatbox;
