import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { getImageUrl, PLACEHOLDER_IMG } from '../utils/imageUrl';

const INITIAL_MESSAGE = {
  id: 'init',
  role: 'agent',
  text: "Hi! I'm your shopping assistant. Tell me what you're looking for — products, categories, budget, or use cases — and I'll find the best matches for you.",
};

const SuggestionAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart } = useCart();

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: query }]);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      const { data } = await api.post('/suggestions', { query, limit: 6 });
      const { suggestions: products = [], message } = data.data;

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'agent', text: message },
      ]);
      setSuggestions(products);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'agent',
          text: "Sorry, I'm having trouble right now. Please try again or browse our store directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product._id, 1);
  };

  // ── Theming ──────────────────────────────────────────────────────────────
  const secondary = 'var(--secondary)';
  const bgColor = 'var(--surface)';
  const borderColor = 'var(--border)';
  const textColor = 'var(--text-main)';
  const mutedColor = 'var(--text-muted)';

  // ── Collapsed button ─────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: secondary, color: '#fff' }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex flex-col items-center justify-center gap-0.5 hover:opacity-90 transition-all"
        aria-label="Open shopping assistant"
      >
        <Sparkles size={20} strokeWidth={2} />
        <span className="text-[8px] font-bold uppercase tracking-widest leading-none">AI</span>
      </button>
    );
  }

  // ── Chat window ──────────────────────────────────────────────────────────
  return (
    <div
      style={{ backgroundColor: bgColor, borderColor }}
      className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div
        style={{ backgroundColor: secondary, color: '#fff' }}
        className="flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} strokeWidth={2} />
          <span className="font-semibold text-sm">Shopping Assistant</span>
          <span className="text-[10px] opacity-70 bg-white/20 px-1.5 py-0.5 rounded-full">AI</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:opacity-80 transition-opacity rounded p-0.5"
          aria-label="Close assistant"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              style={
                msg.role === 'user'
                  ? { backgroundColor: secondary, color: '#fff' }
                  : { backgroundColor: 'var(--bg-elevated)', color: textColor, borderColor }
              }
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-br-sm'
                  : 'border rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && (
          <div className="flex justify-start">
            <div
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor }}
              className="border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5"
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  style={{ backgroundColor: secondary, animationDelay: `${delay}ms` }}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                />
              ))}
            </div>
          </div>
        )}

        {/* Product cards */}
        {!loading && suggestions.length > 0 && (
          <div className="space-y-2 mt-1">
            {suggestions.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
                secondary={secondary}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        style={{ borderColor }}
        className="flex items-center gap-2 border-t px-3 py-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. wireless headphones under $100"
          style={{ backgroundColor: 'var(--bg)', color: textColor, borderColor }}
          className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:border-secondary transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: input.trim() && !loading ? secondary : 'var(--border)',
            color: input.trim() && !loading ? '#fff' : mutedColor,
          }}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:cursor-not-allowed shrink-0"
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

// ── Product Card (extracted for clarity) ─────────────────────────────────────

const ProductCard = ({ product, onAddToCart, borderColor, textColor, mutedColor, secondary }) => (
  <div
    style={{ borderColor }}
    className="flex items-center gap-3 border rounded-xl p-2.5 hover:shadow-md transition-shadow bg-white/5"
  >
    <Link
      to={`/product/${product._id}`}
      className="shrink-0"
      title="View product"
    >
      <img
        src={getImageUrl(product.image)}
        alt={product.name}
        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
        className="w-12 h-12 object-contain rounded-lg bg-white"
      />
    </Link>
    <div className="flex-1 min-w-0">
      <Link
        to={`/product/${product._id}`}
        style={{ color: textColor }}
        className="text-sm font-semibold line-clamp-1 hover:underline transition-colors"
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
        onClick={() => onAddToCart(product)}
        style={{ backgroundColor: secondary, color: '#fff' }}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-85 transition-opacity"
        title="Add to cart"
      >
        <ShoppingCart size={13} />
      </button>
      <Link
        to={`/product/${product._id}`}
        style={{ borderColor, color: textColor }}
        className="w-8 h-8 rounded-lg flex items-center justify-center border hover:bg-white/10 transition-colors"
        title="View product"
      >
        <ArrowRight size={13} />
      </Link>
    </div>
  </div>
);

export default SuggestionAgent;