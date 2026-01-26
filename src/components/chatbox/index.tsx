import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Avatar } from "antd";
import {
  CoffeeOutlined,
  CloseOutlined,
  SendOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import "./index.scss";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const Chatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Chào mừng bạn đến với Phan Coffee. Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when chatbox opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.",
        "Bạn có muốn biết thêm về sản phẩm của chúng tôi không?",
        "Chúng tôi có nhiều loại cà phê đặc biệt từ Tây Nguyên. Bạn quan tâm loại nào?",
        "Bạn có thể ghé thăm cửa hàng tại 86 Lam Tung, Ia Chim, Kon Tum City, Kon Tum.",
        "Chúng tôi có dịch vụ giao hàng toàn quốc. Bạn có muốn đặt hàng không?",
      ];

      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chatbox">
      {/* Floating Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={isOpen ? <CloseOutlined /> : <CoffeeOutlined />}
        onClick={() => setIsOpen(!isOpen)}
        className="chatbox__toggle"
      />

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox__window">
          {/* Header */}
          <div className="chatbox__header">
            <div className="chatbox__header-info">
              <Avatar
                icon={<CustomerServiceOutlined />}
                className="chatbox__avatar"
              />
              <div>
                <h4>Phan Coffee Support</h4>
                <span className="chatbox__status">Đang hoạt động</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbox__messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbox__message chatbox__message--${msg.sender}`}>
                <div className="chatbox__message-content">
                  <p>{msg.text}</p>
                  <span className="chatbox__message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbox__input-wrapper">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              className="chatbox__input"
              suffix={
                <Button
                  type="text"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="chatbox__send-btn"
                />
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
