import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const categories = [
  { name: 'Electronics', emoji: '💻', desc: 'Smartphones, TVs, Audio' },
  { name: 'Fashion', emoji: '👔', desc: 'Trending outfits & styles' },
  { name: 'Gaming', emoji: '🎮', desc: 'Consoles, peripherals & more' },
  { name: 'Home & Kitchen', emoji: '🍳', desc: 'Appliances & cookware' },
  { name: 'Books', emoji: '📚', desc: 'Bestsellers & classics' },
  { name: 'Sports', emoji: '⚽', desc: 'Gear, fitness & outdoors' },
  { name: 'Beauty', emoji: '💄', desc: 'Skincare & makeup' },
  { name: 'Gadgets', emoji: '🔌', desc: 'Smart home & accessories' },
];

const perks = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected transactions' },
  { icon: Zap, title: 'Fast Delivery', desc: 'Same-day in select areas' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always here to help' },
];

// hero image list addded
const heroImages = [
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c", // default (same as tera)
  "https://images.openai.com/static-rsc-4/eCBbTfzi2lXFfCGNap_pTNSQcHpLf_GFrlU8SygxCKG1nsHMBsd3_sxSNzad8nCLo0_jKx-4LJHYqki5JVE_iKW9zk2ftm8wzu7wsNAStH6D1j6rNMUqxzBbd7Q5_wEgvTvy__pA77hz5YNj2m6kGdokLWl986ugLPczBYu4JuEvFO2ubSKOurbDyFT2xZBF?purpose=fullsize",
  "https://images.openai.com/static-rsc-4/agsD0o6HaN_2dEtZBg7XhjXM9Y9-Vx4u347TLGC2sm124jBTLvTlE_asmL1lGYCttT0hLpOIKG5iIA6BFxb5mXEWY3GFk0OOk7uiiUmlzT4q7_UzrwbqZ9hcOfRN1UM9AFu5olSwh3MXnPutqF3flVRXGlosEUCn22P9q9faemJHClleLQLCiXUQCzYFZ4X6?purpose=fullsize",
  "https://images.openai.com/static-rsc-4/cvfagV7odloxypZwGA2Zzc-9KMeAXcciTOgs2p4sKGmB_yauhdyHAp_M9cXDJvm4uWlUeM-z1HSLbe0_Jime6oebnQGn31jtLnRuWrtre4_uiyUxYqB3tn19x9UkObdSa0C7cLgJVJycuPm974iOsSKRdBdyy_RcAzEESaagg14YS70S9pgtRgfIkCgJTR0t?purpose=fullsize"
];

// cta images
const ctaImages = [
  "https://images.openai.com/static-rsc-4/_LtDji2N63NrwW1RXwM6PgEhjMFvy5NORpM54R6bU5pUt1XJCKkqjOt2mHmZVSaJOHC2BqFQDtb7Vq9Cmfr-y9Gkwriw4s1rdrQeiRrdWalwmbse8FHqhDy1WVh7Oku8G0-2dtlXpcSBUIRRgUjs8BiQAUMVyLFQA_6KNVB85WeD7cGYbfBbTnieZNJUuvBA?purpose=fullsize",
  "https://images.openai.com/static-rsc-4/-p0zcjl3vYp1b8j4_8pobe5sjCXUMFAYqKHc8I5zYTpeGhPwM66rjz3ljxEBWEEQ2QkzM3GJQirla8ZNCT7DuyuPQCtbMKQOGGoySc-TDnqImv4vzWr8_sldzpJ5U-OMWFwAaR0mhRPEH25h82MdO_ouqxxOyS2FdDp4ImL5JEpfQAJ8bXf7Nl1D5WH4y00z?purpose=fullsize",
  "https://images.openai.com/static-rsc-4/ogpQlZ5oIdDxuhtirm-Ax9dvzc7aDzvvOqPa7c4lPFKmYf04sHgm6yZguZw-75gw3U7MYRDjTXZHVnM3Gwtsz5z_VoLgaHnUsjTaqDyZ3LdWMQZEsNvmdlVcv8MaVQSUC25Pzjwdr_JhOcieeA6QUJ_oWPUhb1mS9E8i6piwx3x4AZZ6HDkn9TJb7rcIrjYh?purpose=fullsize",
  "https://images.openai.com/static-rsc-4/rBCppFXuNmHjGGBhTNkCWVbl0GAhxRVthQDXm7Ph6I8vYO9Rye-1iQ-WqOnhRud9Mid6g0n8Zv8cDOUJU4bxrTF_jqdMrFLpV6LX1F1Ut8U1veTgO0K_3YmChCKL9jFjjplxz41u04qLd2w_cLzA1dLJIwo4xkNH3KvSBEGSAL8uBANDXZVbN_chztoa96r3?purpose=fullsize"
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [ctaIndex, setCtaIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products', { params: { limit: 8, sort: 'newest' } });
        setFeatured(data.data.products);
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCtaIndex((prev) => (prev + 1) % ctaImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background">
      {/* ── Hero Section ── */}
      <section className="relative text-white overflow-hidden">

        {/* 🔥 SLIDING IMAGES */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="hero"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
        </div>

        {/* 🔥 Overlay (same) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>

        {/* 🔥 ORIGINAL CONTENT (UNCHANGED) */}
        <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">

          {/* Left Text */}
          <div className="flex-1">
            <span className="inline-block bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-white/15 mb-5">
              🔥 New Season Deals
            </span>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5 text-white">
              Discover
              <span className="text-secondary"> Premium </span>
              Products
            </h1>

            <p className="text-white/75 text-lg mb-8 max-w-lg leading-relaxed">
              From the latest electronics to everyday essentials — shop thousands of products at unbeatable prices.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/store" className="btn-primary px-8 py-3.5 flex items-center gap-2 group">
                Shop Now
              </Link>

              <Link to="/store?category=Electronics" className="border border-white/25 px-8 py-3.5">
                Browse Electronics
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 border-t border-white/20 pt-8">
              {[['100+', 'Products'], ['10', 'Categories'], ['24/7', 'Support']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-secondary">{num}</div>
                  <div className="text-xs text-white/55 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side same */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 bg-secondary/20 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4 p-6">
                {['📱', '💻', '🎮', '🎧'].map((emoji, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm p-6 text-4xl flex items-center justify-center border border-white/20">
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Perks Bar ── */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 border border-border flex items-center justify-center shrink-0">
                <Icon size={20} className="text-secondary" />
              </div>
              <div>
                <p className="font-bold text-textDark text-sm">{title}</p>
                <p className="text-xs text-textMuted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="relative">

        {/* 🔥 FULL WIDTH BACKGROUND */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
        linear-gradient(rgba(5,10,25,0.75), rgba(5,10,25,0.9)),
        url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop')
      `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4   // 👈 IMPORTANT (warna dikhega hi nahi)
          }}
        />

        {/* 🔥 CONTENT */}
        <section className="relative z-10 max-w-[1400px] mx-auto px-4 py-14">

          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-1">
                Explore
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-textDark">
                Shop by Category
              </h2>
            </div>

            <Link
              to="/store"
              className="text-sm text-secondary hover:text-secondaryHover font-semibold flex items-center gap-1"
            >
              All Categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() =>
                  navigate(`/store?category=${encodeURIComponent(cat.name)}`)
                }
                className="group bg-surface border border-border p-5 text-left hover:border-secondary hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">{cat.emoji}</div>

                <p className="font-bold text-textDark text-sm group-hover:text-secondary transition-colors">
                  {cat.name}
                </p>

                <p className="text-xs text-textMuted mt-1">
                  {cat.desc}
                </p>
              </button>
            ))}
          </div>

        </section>
      </div>

      {/* ── Featured Products ── */}
      <section className="max-w-[1400px] mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-1">Just In</p>
            <h2 className="text-2xl md:text-3xl font-black text-textDark">Featured Products</h2>
          </div>
          <Link to="/store" className="text-sm text-secondary hover:text-secondaryHover font-semibold flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Banner CTA ── */}
      <section className="relative text-white overflow-hidden">

        {/* 🔥 SLIDING BG */}
        <div className="absolute inset-0 z-0">
          {ctaImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="cta-bg"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === ctaIndex ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
        </div>

        {/* 🔥 OVERLAY (IMPORTANT for readability) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-secondary/80 to-secondaryHover/80 backdrop-blur-sm"></div>

        {/* 🔥 ORIGINAL CONTENT */}
        <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to find your next favourite?
          </h2>

          <p className="text-white/80 mb-8 text-lg">
            Browse all categories and discover what's new in our store.
          </p>

          <Link
            to="/store"
            className="bg-white text-secondary font-black px-10 py-4 inline-flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm uppercase tracking-wider shadow-xl"
          >
            Explore Full Store <ArrowRight size={16} />
          </Link>
        </div>

      </section>
    </div>
  );
};

export default Home;
