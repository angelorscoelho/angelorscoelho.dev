import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon, CloseIcon, SendIcon } from './Icon';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

const SUGGESTED_QUESTIONS = [
  "What would you add to my team?",
  "Tell me about your AI experience.",
  "What is your tech stack?"
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm Ângelo's AI assistant. Ask me anything about his experience, skills, or how he can contribute to your team." }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Dismiss the floating prompt after interaction
  useEffect(() => {
    if (isOpen) {
      setShowPrompt(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text };
    
    // Optimistic UI update
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Call API
    const responseText = await sendMessageToGemini(messages, text);

    const modelMessage: ChatMessage = { role: 'model', text: responseText };
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Make children clickable */}
      <div className="pointer-events-auto flex flex-col items-end">
        
        {/* Chat Window */}
        {isOpen && (
          <div className="mb-4 w-[90vw] md:w-96 h-[500px] max-h-[70vh] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up ring-1 ring-white/10">
            {/* Header */}
            <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                 <h3 className="text-slate-200 font-semibold text-sm">Chat with Ângelo (AI)</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-teal-300 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-850/90 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-teal-300/10 text-teal-300 border border-teal-300/20 rounded-tr-none' 
                        : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                    }`}
                  >
                    {msg.role === 'model' ? (
                       <MarkdownRenderer content={msg.text} />
                    ) : (
                       msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-lg rounded-tl-none p-3 flex space-x-1 border border-slate-600">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !isLoading && (
              <div className="px-4 pb-2 bg-slate-850/90 flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                          key={i}
                          onClick={() => handleSendMessage(q)}
                          className="text-xs bg-slate-800 border border-teal-300/30 text-teal-300 px-2 py-1 rounded-full hover:bg-teal-300/10 transition-colors"
                      >
                          {q}
                      </button>
                  ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-700">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-300 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-teal-300/10 text-teal-300 p-2 rounded-md hover:bg-teal-300/20 transition-colors disabled:opacity-50 border border-teal-300/20"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Floating Attention Bubble */}
        {!isOpen && showPrompt && (
          <div className="mb-4 mr-2 relative animate-bounce-gentle">
             <div className="bg-slate-200 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg rounded-br-none shadow-lg">
                Ask about my experience!
             </div>
             {/* Triangle pointer */}
             <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-slate-200"></div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-full bg-teal-300 text-slate-900 shadow-[0_0_20px_rgba(45,212,191,0.5)] transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-900 ${!isOpen ? 'animate-pulse-slow' : ''}`}
          aria-label="Toggle Chat"
        >
          {isOpen ? <CloseIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
        </button>
      </div>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(45, 212, 191, 0); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};