import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon, CloseIcon, SendIcon } from './Icon';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

const SUGGESTED_QUESTIONS = [
  "What would you add to my team?",
  "Tell me about your background.",
  "What is your tech stack?"
];

const TEASER_MESSAGES = [
  "Hi there! I'm Ângelo's AI assistant. 👋",
  "Ask me anything about his experience and skills.",
  "I can summarize Ângelo's technical projects for you.",
  "Curious about my Lean Champion role? Just ask!",
  "Ask me about his current focus in AI and AWS."
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm Ângelo's AI assistant. Ask me anything about his experience and skills." }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Teaser State
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [showTeaser, setShowTeaser] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Cycle Teaser Messages
  useEffect(() => {
    if (isOpen) {
      setShowTeaser(false);
      return;
    }

    // Initial delay
    const initialDelay = setTimeout(() => {
      setShowTeaser(true);
    }, 2000);

    // Rotation timer
    const interval = setInterval(() => {
      if (!isHoveringButton) {
        setShowTeaser(false);
        setTimeout(() => {
          setTeaserIndex((prev) => (prev + 1) % TEASER_MESSAGES.length);
          if (!isOpen) setShowTeaser(true);
        }, 500); // Wait for fade out transition
      }
    }, 8000); // Rotate every 8 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [isOpen, isHoveringButton]);

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
        
        {/* Chat Window - In flow, pushes up if needed */}
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
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-850/90 custom-scrollbar"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              style={{ overscrollBehavior: 'contain' }}
            >
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

        {/* Wrapper for Button and Teaser - Keeps Teaser out of flex flow */}
        <div className="relative">
            {/* Floating Teaser Bubble - Absolute Positioned */}
            <div 
              className={`absolute bottom-full right-0 mb-4 transition-all duration-500 ease-out transform ${
                showTeaser && !isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
               <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-4 py-3 rounded-2xl shadow-xl min-w-[280px] max-w-[360px] w-max leading-relaxed relative whitespace-normal">
                  {TEASER_MESSAGES[teaserIndex]}
               </div>
               {/* Triangle pointer */}
               <div className="absolute -bottom-2 right-5 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-slate-700 border-r-[8px] border-r-transparent"></div>
               {/* Inner triangle for border illusion */}
               <div className="absolute -bottom-[7px] right-5 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-slate-800 border-r-[8px] border-r-transparent"></div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
              className={`group relative flex h-14 w-14 items-center justify-center rounded-full bg-teal-300 text-slate-900 shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-900 z-50`}
              aria-label="Toggle Chat"
            >
              {isOpen ? <CloseIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
              
              {/* Unread Indicator Dot */}
              {!isOpen && showTeaser && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
                </span>
              )}
            </button>
        </div>
      </div>

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};