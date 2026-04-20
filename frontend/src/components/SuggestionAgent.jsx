import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { getImageUrl, PLACEHOLDER_IMG } from '../utils/imageUrl';
import { useTheme } from '../context/ThemeContext';

const SuggestionAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'agent',
      text: "Hi! I'm your shopping assistant. Tell me what you're looking for — products, categories, budget, or use cases — and I'll find the best matches for you.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const { addToCart } = useCart();
  const { theme } = useTheme();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    const query = input.trim();
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      const { data } = await api.post('/suggestions', { query, limit: 6 });
      const { suggestions: products, message } = data.data;

      const agentMsg = {
        id: Date.now() + 1,
        role: 'agent',
        text: message || (products.length > 0
          ? `I found ${products.length} product${products.length > 1 ? 's' : ''} matching "${query}":`
          : `I couldn't find exact matches for "${query}", but here are some popular options:`
        ),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setSuggestions(products || []);
    } catch {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'agent',
        text: "Sorry, I'm having trouble right now. Please try again or browse our store directly.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (product) => {
    addToCart(product._id, 1);
  };

  const bgColor = theme === 'dark' ? 'var(--surface)' : 'var(--bg-elevated)';
  const borderColor = 'var(--border)';
  const textColor = 'var(--text-main)';
  const mutedColor = 'var(--text-muted)';
  const secondary = 'var(--secondary)';

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: secondary, color: '#fff' }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:opacity-90 transition-all flex-col gap-1"
        aria-label="Open shopping assistant"
      >
        <MessageCircle size={22} strokeWidth={2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Assistant</span>
      </button>
    );
  }

  return (
    <div
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
      className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div
        style={{ backgroundColor: secondary, color: '#fff' }}
        className="flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={18} strokeWidth={2} />
          <span className="font-bold text-sm">Shopping Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:opacity-80 transition-opacity"
          aria-label="Close assistant"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? secondary : 'var(--bg-elevated)',
              color: msg.role === 'user' ? '#fff' : textColor,
              borderColor: borderColor,
            }}
            className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
              msg.role === 'user' ? '' : 'border'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Suggestions as mini product cards */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((product) => (
              <div
                key={product._id}
                style={{ borderColor }}
                className="flex items-center gap-3 border rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                  className="w-12 h-12 object-contain rounded bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${product._id}`}
                    style={{ color: textColor }}
                    className="text-sm font-semibold line-clamp-1 hover:text-secondary transition-colors"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ color: secondary }} className="text-xs font-mono font-bold">
                      ${Number(product.price ?? 0).toFixed(2)}
                    </span>
                    {product.rating > 0 && (
                      <span style={{ color: mutedColor }} className="text-xs">
                        ★ {product.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleSuggestionClick(product)}
                    style={{ backgroundColor: secondary, color: '#fff' }}
                    className="w-8 h-8 rounded-md flex items-center justify-center hover:opacity-85 transition-opacity"
                    title="Add to cart"
                  >
                    <ShoppingCart size={14} />
                  </button>
                  <Link
                    to={`/product/${product._id}`}
                    style={{ borderColor, color: textColor }}
                    className="w-8 h-8 rounded-md flex items-center justify-center border hover:bg-white/5 transition-colors"
                    title="View product"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ color: mutedColor }} className="text-sm animate-pulse">
            Searching...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        style={{ borderColor }}
        className="flex items-center gap-2 border-t px-4 py-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 'wireless headphones under $100' or 'gaming laptops'"
          style={{ backgroundColor: 'var(--bg)', color: textColor, borderColor }}
          className="flex-1 px-3 py-2 text-sm border rounded-md outline-none focus:border-secondary transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{ backgroundColor: input.trim() && !loading ? secondary : 'var(--border)', color: input.trim() && !loading ? '#fff' : mutedColor }}
          className="w-9 h-9 rounded-md flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

export default SuggestionAgent;