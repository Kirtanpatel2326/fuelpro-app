import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Bot, User, Send, Sparkles, Loader2, Info } from 'lucide-react';

const QUICK_CHIPS = [
  "How do I earn points?",
  "Show my MPG stats",
  "Any new discounts?",
  "Explain my Tier benefits"
];

export default function Copilot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your FuelPro Copilot. I see you're currently holding ${user?.total_points || 0} points. How can I help you maximize your savings today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate Gemini API processing
    setTimeout(() => {
      let response = "I can definitely help with that! However, my advanced AI systems are still booting up. Please check back soon!";
      
      // Context-aware simulated responses
      if (text.toLowerCase().includes("earn points")) {
        response = `You currently have ${user?.total_points || 0} points! You earn 10 points for every gallon of fuel, and 50 points when you set a Primary Station in the Finder tab. Want me to open the Finder for you?`;
      } else if (text.toLowerCase().includes("mpg")) {
        response = "Based on your Vehicle Efficiency Tracker in your profile, your average MPG is sitting at 27.8! Keeping your tires properly inflated could boost that to 29 MPG, saving you roughly $12 a month.";
      } else if (text.toLowerCase().includes("discounts")) {
        response = "There's an active coupon for '5% Cashback on Premium Fuel' right now! As a Silver member, you also get an automatic 5¢ off every gallon. Make sure to save the coupon to your wallet!";
      } else if (text.toLowerCase().includes("tier")) {
        response = "You're currently a Silver member! That gives you 5¢ off per gallon and priority pump access. You only need 450 more points to reach Gold, which doubles your discount!";
      }

      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-[#0A1628] flex flex-col pt-12 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="px-5 pb-4 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fp-gold to-fp-red flex items-center justify-center">
          <Bot className="w-5 h-5 text-fp-navy" />
        </div>
        <div>
          <h1 className="font-display text-xl flex items-center gap-2">
            Fuel Advisor <Sparkles className="w-3 h-3 text-fp-gold" />
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-fp-text font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-fp-green" /> Powered by Gemini
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 fp-no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mr-3 mt-1">
                <Bot className="w-4 h-4 text-fp-gold" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-fp-red text-white rounded-tr-sm' 
                : 'bg-fp-mid text-white border border-white/5 rounded-tl-sm shadow-lg'
            }`}>
              {msg.text}
            </div>
            
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-fp-navy border border-white/10 flex items-center justify-center shrink-0 ml-3 mt-1">
                <User className="w-4 h-4 text-white/50" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mr-3 mt-1">
              <Bot className="w-4 h-4 text-fp-gold" />
            </div>
            <div className="bg-fp-mid border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-fp-gold" />
              <span className="text-xs text-fp-text font-medium">Analyzing data...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-5 pb-6 shrink-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628] to-transparent">
        {/* Quick Chips */}
        <div className="flex gap-2 overflow-x-auto fp-no-scrollbar mb-4 pb-2">
          {QUICK_CHIPS.map((chip, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(chip)}
              className="shrink-0 px-3 py-1.5 rounded-full border border-white/10 bg-fp-mid text-xs font-medium text-white/80 hover:bg-white/5 transition-colors fp-press whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..." 
            className="w-full bg-fp-mid border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-fp-gold transition-colors placeholder:text-white/30 shadow-lg"
          />
          <button 
            onClick={() => handleSend()}
            className="absolute right-2 w-10 h-10 rounded-full bg-fp-gold flex items-center justify-center text-fp-navy fp-press"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
        <p className="text-center mt-3 text-[9px] text-fp-text flex items-center justify-center gap-1">
          <Info className="w-3 h-3" /> AI advisor may take a moment to compute insights.
        </p>
      </div>
    </div>
  );
}
