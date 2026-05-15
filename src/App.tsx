/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Utensils, 
  Trash2,
  CheckCircle2,
  ArrowRight,
  Instagram,
  Facebook
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

enum DeliveryType {
  RESTAURANT = 'Restaurant',
  HOME_DELIVERY = 'Home Delivery'
}

// --- Constants ---

const OWNER_WHATSAPP = "9284094805";

const CATEGORIES = [
  "All Items",
  "Veg Dishes",
  "Mutton Specials",
  "Chicken Specials",
  "Fish",
  "Rice",
  "Roti & Breads",
  "Veg Starters",
  "Non-Veg Starters",
  "Drinks & Sweets"
];

const MENU_DATA: MenuItem[] = [
  {
    id: '1',
    name: 'Veg Thali / वेज थाळी',
    description: 'होटल की सबसे बेहतरीन शाकाहारी थाळी। Contains dal, rice, 2 veg preparations, roti, and sweet.',
    price: 250,
    category: 'Veg Dishes',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
    isVeg: true
  },
  {
    id: '2',
    name: 'Paneer Bomb / पनीर बम',
    description: 'स्पेशल पनीर बम डिश। Crispy fried paneer balls stuffed with spicy filling.',
    price: 160,
    category: 'Veg Starters',
    image: 'https://images.unsplash.com/photo-1567188040759-fbcd188398d8?q=80&w=800&auto=format&fit=crop',
    isVeg: true
  },
  {
    id: '3',
    name: 'Paneer Maratha / पनीर मराठा',
    description: 'मसालेदार पनीर मराठा। Spicy and rich paneer curry with Maharashtrian spices.',
    price: 200,
    category: 'Veg Dishes',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop',
    isVeg: true
  },
  {
    id: '4',
    name: 'Paneer Tikka Masala / पनीर टिक्का मसाला',
    description: 'तंदूरी ग्रिल पनीर टिक्का। Grilled paneer chunks in a creamy tomato gravy.',
    price: 220,
    category: 'Veg Dishes',
    image: 'https://images.unsplash.com/photo-1596797038530-2c39fa81b487?q=80&w=800&auto=format&fit=crop',
    isVeg: true
  },
  {
    id: '5',
    name: 'Chicken Thali / चिकन थाळी',
    description: 'Traditional Maharashtrian chicken thali with rassa, bhakri, and rice.',
    price: 350,
    category: 'Non-Veg Starters', // Actually a thali but categories can be fluid
    image: 'https://images.unsplash.com/photo-1626777553732-48f84446b771?q=80&w=800&auto=format&fit=crop',
    isVeg: false
  },
  {
    id: '6',
    name: 'Lasun Methi / लसूण मेथी',
    description: 'Creamy garlic infused fenugreek leaves preparation.',
    price: 150,
    category: 'Veg Dishes',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    isVeg: true
  },
  {
    id: '7',
    name: 'Mutton Handi / मटण हांडी',
    description: 'Slow cooked mutton in a traditional clay pot style.',
    price: 450,
    category: 'Mutton Specials',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop',
    isVeg: false
  },
  {
    id: '8',
    name: 'Fish Fry / फिश फ्राय',
    description: 'Crispy fried fish with malvani masala coating.',
    price: 300,
    category: 'Fish',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
    isVeg: false
  }
];

// --- Components ---

interface NavItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`snap-start px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
      active 
        ? 'bg-white border-orange-500 text-orange-600 shadow-md translate-y-[-2px]' 
        : 'bg-white border-transparent text-slate-400 hover:border-orange-100 hover:text-slate-600'
    }`}
    id={`cat-${label.toLowerCase().replace(/\s+/g, '-')}`}
  >
    {label}
  </button>
);

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.RESTAURANT);
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Filter Logic
  const filteredMenu = useMemo(() => {
    return MENU_DATA.filter(item => {
      const matchesCategory = activeCategory === "All Items" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = vegFilter === 'all' || 
                        (vegFilter === 'veg' && item.isVeg) || 
                        (vegFilter === 'non-veg' && !item.isVeg);
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [activeCategory, searchQuery, vegFilter]);

  // Cart Logic
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      setCart([]);
    }
  };

  // WhatsApp Order Logic
  const sendOrder = () => {
    if (cart.length === 0) return;
    if (deliveryType === DeliveryType.RESTAURANT && !tableNumber) {
      alert("Please enter a table number");
      return;
    }
    if (deliveryType === DeliveryType.HOME_DELIVERY && !deliveryAddress) {
      alert("Please enter a delivery address");
      return;
    }

    let message = `*New Order from Anand Bar & Restro*\n`;
    message += `--------------------------\n`;
    message += `*Type:* ${deliveryType}\n`;
    if (deliveryType === DeliveryType.RESTAURANT) {
      message += `*Table No:* ${tableNumber}\n`;
    }
    if (deliveryType === DeliveryType.HOME_DELIVERY) {
      message += `*Address:* ${deliveryAddress}\n`;
    }
    message += `--------------------------\n`;
    
    cart.forEach(item => {
      message += `• ${item.name} x ${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    message += `--------------------------\n`;
    message += `*Total Amount:* ₹${cartTotal}\n\n`;
    message += `Please confirm the order. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans selection:bg-orange-500/30">
      {/* --- Sticky Header --- */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-orange-500 shadow-sm leading-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-200">
              L
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                Anand <span className="text-orange-500">Bar & Restro</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Open Now</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-default">
              <Phone size={14} className="text-orange-500" />
              <span>9284094805</span>
            </div>
            <div className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-default">
              <MapPin size={14} className="text-orange-500" />
              <span>Jintur, Maharastra 431509.</span>
            </div>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="group relative flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2.5 rounded-full font-black text-sm transition-all hover:bg-orange-500 hover:text-white shadow-sm border-2 border-orange-100"
            id="open-cart-btn"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart ({cartCount})</span>
            {cartCount > 0 && (
              <span className="sm:hidden text-xs bg-orange-600 text-white w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* --- Hero Section & Brand --- */}
        <section className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 p-8 md:p-16 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2"></div>
          <div className="relative z-10 max-w-2xl">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-orange-100 text-sm font-black uppercase tracking-[0.2em] mb-4"
            >
              Maharashtrian Excellence
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9]"
            >
              FLAVORS THAT <br/> <span className="text-orange-200">KICK BACK</span>.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-orange-50 text-lg md:text-xl font-medium mb-10 opacity-90 leading-relaxed italic"
            >
              "Where every bite feels like home and every drink feels like a celebration."
            </motion.p>
            <div className="flex flex-wrap gap-4">
               <button 
                onClick={() => {
                  const el = document.getElementById('search-input');
                  el?.focus();
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
               className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-orange-50 transition-all active:scale-95">
                Explore Menu
              </button>
            </div>
          </div>
          {/* Subtle decorative circles */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </section>

        {/* --- Filters & Search --- */}
        <section className="mb-10 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Find your favorite dish..."
                className="w-full bg-white border-2 border-orange-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-input"
              />
            </div>

            {/* Veg/Non-Veg Toggle */}
            <div className="flex p-1.5 bg-white rounded-2xl border-2 border-orange-100 shadow-sm">
              {['all', 'veg', 'non-veg'].map((type) => (
                <button
                  key={type}
                  onClick={() => setVegFilter(type as any)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    vegFilter === type 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                  id={`filter-${type}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-none no-scrollbar snap-x">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`snap-start px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                  activeCategory === cat 
                    ? 'bg-white border-orange-500 text-orange-600 shadow-md translate-y-[-2px]' 
                    : 'bg-white border-transparent text-slate-400 hover:border-orange-100 hover:text-slate-600'
                }`}
                id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* --- Menu Grid --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMenu.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border-2 border-transparent hover:border-orange-500 shadow-sm hover:shadow-2xl transition-all duration-300 transform"
                id={`product-${item.id}`}
              >
                {/* Product Image */}
                <div className="relative aspect-[16/11] overflow-hidden m-2 rounded-[1.5rem]">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                      item.isVeg 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-2 flex flex-col flex-grow">
                  <h3 className="font-black text-lg text-slate-900 group-hover:text-orange-600 transition-colors leading-tight mb-2">
                    {item.name}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed flex-grow">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Price</span>
                      <span className="text-xl font-black text-orange-600">₹{item.price}</span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-slate-900 text-white group-hover:bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-slate-200 group-hover:shadow-orange-200"
                      id={`add-to-cart-${item.id}`}
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMenu.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300">
              <Utensils size={80} className="mb-6 opacity-20" />
              <p className="text-2xl font-black uppercase tracking-widest">Kitchen is Quiet</p>
              <p className="text-sm font-medium mt-2">Try a different search or filter</p>
            </div>
          )}
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-white py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="w-16 h-16 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-orange-500/20">
              L
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Anand Bar & Restro</h2>
              <p className="text-orange-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Direct from Jintur</p>
            </div>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 max-w-sm text-center">
            Open daily 11am - 2am. We prioritize fresh ingredients and traditional recipes.
            Fast table service guaranteed.
          </div>

          <div className="flex gap-4">
            <button className="w-10 h-10 bg-white/5 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all text-white" aria-label="Call Us"><Phone size={18} /></button>
            <button className="w-10 h-10 bg-white/5 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all text-white" aria-label="Visit Us"><MapPin size={18} /></button>
            <button className="w-10 h-10 bg-white/5 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all text-white" aria-label="Instagram"><Instagram size={18} /></button>
            <button className="w-10 h-10 bg-white/5 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all text-white" aria-label="Facebook"><Facebook size={18} /></button>
          </div>
        </div>
        <div className="mt-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-t border-white/5 pt-8">
          © 2024 LUXURY RESTO INTERFACE • ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* --- Floating Cart Notification --- */}
      <AnimatePresence>
        {cartCount > 0 && !isCartOpen && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-orange-500 text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-orange-500/40 active:scale-95"
            id="mobile-cart-float"
          >
            <ShoppingCart size={22} className="animate-bounce" />
            <span>{cartCount} Items • ₹{cartTotal}</span>
            <div className="bg-white/20 p-1 rounded-lg"><ChevronRight size={18} /></div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- Cart Modal Sidebar --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.2)] border-l-4 border-orange-500"
              id="cart-modal"
            >
              {/* Header */}
              <div className="bg-orange-500 p-8 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl"><ShoppingCart size={28} /></div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Your Order</h2>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">{cartCount} items ready</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-grow overflow-y-auto p-8 space-y-10">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Utensils size={40} className="opacity-20" />
                    </div>
                    <p className="text-xl font-black uppercase tracking-widest">Hungry?</p>
                    <p className="text-sm font-medium mt-2">Add something delicious</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Method Toggle */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block ml-1">Dining Preference</label>
                      <div className="grid grid-cols-2 gap-3 p-2 bg-slate-50 rounded-2xl border-2 border-slate-100">
                        {Object.values(DeliveryType).map((type) => (
                          <button
                            key={type}
                            onClick={() => setDeliveryType(type)}
                            className={`flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              deliveryType === type 
                                ? 'bg-orange-500 text-white shadow-lg' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {type === DeliveryType.RESTAURANT ? <Utensils size={14} /> : <MapPin size={14} />}
                            {type}
                          </button>
                        ))}
                      </div>

                      {deliveryType === DeliveryType.RESTAURANT && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-2"
                        >
                          <input 
                            type="text" 
                            placeholder="Enter Table No. (e.g. 12)"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-center font-black text-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-300 placeholder:uppercase placeholder:text-xs"
                          />
                        </motion.div>
                      )}

                      {deliveryType === DeliveryType.HOME_DELIVERY && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-2"
                        >
                          <textarea 
                            placeholder="Enter Delivery Address (e.g. House No, Area...)"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-300 placeholder:uppercase placeholder:text-xs resize-none"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Order Summary</h3>
                        <button onClick={clearCart} className="text-[10px] font-black uppercase text-red-500 hover:opacity-70 flex items-center gap-1">
                          <Trash2 size={12} /> Clear
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="group flex gap-5 bg-white p-4 rounded-3xl border-2 border-slate-100 hover:border-orange-200 transition-all shadow-sm">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-black text-slate-900 leading-tight">{item.name}</h4>
                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-black text-orange-600">₹{item.price * item.quantity}</span>
                                <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-500"><Minus size={14} /></button>
                                  <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-500"><Plus size={14} /></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Finalization */}
              <div className="p-8 bg-slate-50 border-t-2 border-slate-100">
                <div className="flex justify-between items-end mb-8 px-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Payable</p>
                    <p className="text-4xl font-black text-slate-900 leading-none">₹{cartTotal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1 justify-end">
                      <CheckCircle2 size={12} /> Confirmed
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Free digital service</p>
                  </div>
                </div>

                <button
                  disabled={cart.length === 0 || (deliveryType === DeliveryType.RESTAURANT && !tableNumber) || (deliveryType === DeliveryType.HOME_DELIVERY && !deliveryAddress)}
                  onClick={sendOrder}
                  className={`w-full group flex items-center justify-center gap-4 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all ${
                    cart.length > 0 && !(deliveryType === DeliveryType.RESTAURANT && !tableNumber) && !(deliveryType === DeliveryType.HOME_DELIVERY && !deliveryAddress)
                      ? 'bg-green-500 text-white shadow-2xl shadow-green-500/20 hover:bg-green-600 hover:-translate-y-1'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed uppercase'
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82s.134.079.353.188c1.511.753 3.197 1.15 4.931 1.152 5.587 0 10.133-4.546 10.135-10.131.002-5.412-4.486-9.814-9.892-9.814-5.411 0-9.815 4.403-9.817 9.815-.001 1.78.483 3.513 1.399 5.012.115.187.234.341.234.341l-.929 3.393 3.486-.96z"/></svg>
                  {deliveryType === DeliveryType.RESTAURANT && !tableNumber 
                    ? 'Awaiting Table No.' 
                    : (deliveryType === DeliveryType.HOME_DELIVERY && !deliveryAddress 
                      ? 'Awaiting Address' 
                      : 'Order via WhatsApp')}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-center mt-6 text-slate-400 font-black uppercase tracking-[0.3em]">
                   Owner Notify: 9284094805
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
