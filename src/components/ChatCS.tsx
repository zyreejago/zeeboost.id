'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Function untuk format markdown text
const formatMarkdownText = (text: string) => {
  // Replace **text** dengan <strong>text</strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace *text* dengan <em>text</em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace line breaks dengan <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Replace numbered lists
  formatted = formatted.replace(/^(\d+\.)\s/gm, '<strong>$1</strong> ');
  
  // Replace bullet points
  formatted = formatted.replace(/^[-•]\s/gm, '• ');
  
  return formatted;
};

const ChatCS = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Saya **AI Customer Service ZeeBoost** yang siap membantu Anda 24/7. Saya dapat menjawab pertanyaan seputar:\n\n• **Layanan ZeeBoost** (topup Robux, pembayaran)\n• **Roblox** (game, akun, username)\n• **Robux** (mata uang virtual)\n\n📱 **Untuk bantuan langsung dari admin, hubungi WhatsApp kami:**\n**+6287740517441**\n\nAda yang bisa saya bantu?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-cs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.response || "Maaf, terjadi kesalahan. Silakan coba lagi.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (_error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Maaf, terjadi kesalahan koneksi. Silakan coba lagi.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group relative"
        >
          {isOpen ? (
            <i className="fas fa-times text-xl"></i>
          ) : (
            <div className="relative">
              <i className="fas fa-comments text-xl"></i>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
        
        {!isOpen && (
          <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-3 max-w-xs transform transition-all duration-300 hover:scale-105 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800 mb-1">Customer Service 24 Jam!</div>
                <div className="text-xs text-gray-600">Ada yang bisa dibantu?</div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Hide tooltip permanently or set a state to hide it
                  const tooltip = e.currentTarget.closest('.group');
                  if (tooltip) tooltip.style.display = 'none';
                }}
                className="text-gray-400 hover:text-gray-600 ml-2 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-lg"></i>
              </div>
              <div>
                <div className="font-semibold">AI Customer Service</div>
                <div className="text-xs opacity-90 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Online 24/7
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${message.isUser
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                    }`}
                >
                  {message.isUser ? (
                    <div className="text-sm">{message.text}</div>
                  ) : (
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMarkdownText(message.text) 
                      }}
                    />
                  )}
                  <div
                    className={`text-xs mt-2 opacity-70 ${message.isUser ? 'text-white/70' : 'text-gray-500'
                      }`}
                  >
                    {message.timestamp.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-gradient-to-r from-primary to-primary-dark text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatCS;