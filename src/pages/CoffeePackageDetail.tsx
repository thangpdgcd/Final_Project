import React, { useState } from 'react';
import { 
  Button, 
  Radio, 
  Select, 
  Rate, 
  Tag, 
  Badge, 
  Avatar, 
  Divider, 
  Carousel, 
  InputNumber,
  message
} from 'antd';
import { 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  Calendar, 
  Heart, 
  ArrowLeft,
  ChevronRight,
  User,
  Package,
  Leaf,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---
interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface CoffeeExperience {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  description: string;
  origin: string;
  farmer: string;
  notes: string[];
  stock: number;
  images: string[];
}

// --- DUMMY DATA ---
const COFFEE_DATA: CoffeeExperience = {
  id: 'pack-01',
  name: 'Signature Highlands Blend',
  tagline: 'A bold adventure in every sip, direct from the misty peaks of Da Lat.',
  basePrice: 450000, // Monthly base price
  description: 'Our Signature Highlands Blend is crafted for those who appreciate complexity. A dark roast that brings out nutty undertones with a subtle cocoa finish.',
  origin: 'Da Lat, Vietnam',
  farmer: 'Mr. Phan & The Highland Cooperative',
  notes: ['Dark Cocoa', 'Roasted Hazelnut', 'Wild Berries'],
  stock: 20,
  images: [
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800'
  ]
};

const REVIEWS: Review[] = [
  { id: '1', user: 'Linh Nguyen', rating: 5, comment: 'The best subscription I have ever had. The freshness is unbeatable!', date: '2 days ago', verified: true },
  { id: '2', user: 'David Pham', rating: 4, comment: 'Great roast level. I prefer the Ground version for my moka pot.', date: '1 week ago', verified: true },
];

const RELATED: Partial<CoffeeExperience>[] = [
  { id: 'p2', name: 'Ethical Ethiopian Yirgacheffe', basePrice: 520000, tagline: 'Floral & Citrus' },
  { id: 'p3', name: 'Brazilian Santos Gold', basePrice: 480000, tagline: 'Smooth Caramel' },
];

// --- COMPONENT ---
const CoffeePackageDetail: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseType, setPurchaseType] = useState<'once' | 'subscribe'>('subscribe');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [grind, setGrind] = useState('Beans');
  const [roast, setRoast] = useState('Medium');
  const [frequency, setFrequency] = useState('Every 2 weeks');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // --- CALCULATIONS ---
  const discountRate = purchaseType === 'subscribe' ? (billingCycle === 'yearly' ? 0.25 : 0.15) : 0;
  const unitPrice = COFFEE_DATA.basePrice;
  const finalPrice = unitPrice * (1 - discountRate) * quantity;
  const savings = unitPrice * discountRate * quantity;

  const handleCTA = () => {
    message.success(purchaseType === 'subscribe' ? 'Subscribed successfully!' : 'Added to cart!');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#4e3524] font-sans pb-32">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FFF9F3]/80 backdrop-blur-md border-b border-[#6f4e37]/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-bold uppercase tracking-widest text-[#6f4e37]">Coffee Experience</div>
          <button className="p-2 hover:bg-white rounded-full transition-colors" onClick={() => setIsLiked(!isLiked)}>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- LEFT COLUMN: GALLERY & STORY --- */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Hero Gallery */}
          <section className="relative rounded-[32px] overflow-hidden shadow-2xl bg-white border-4 border-white">
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              <Badge.Ribbon text="BEST SELLER" color="#6f4e37">
                <div className="hidden"></div>
              </Badge.Ribbon>
              <Tag color="orange" className="font-bold border-none px-4 py-1 rounded-full shadow-sm">LIMITED EDITION</Tag>
            </div>
            
            <Carousel autoplay effect="fade" dotPosition="bottom">
              {COFFEE_DATA.images.map((img, idx) => (
                <div key={idx} className="h-[400px] md:h-[600px]">
                  <img src={img} alt="Coffee" className="w-full h-full object-cover" />
                </div>
              ))}
            </Carousel>
          </section>

          {/* Mobile Info View */}
          <div className="lg:hidden">
             <h1 className="text-4xl font-black leading-tight mb-2 tracking-tight">{COFFEE_DATA.name}</h1>
             <p className="text-xl italic text-gray-500 mb-4 tracking-wide">"{COFFEE_DATA.tagline}"</p>
             <div className="flex items-center gap-4 mb-6">
                <Rate disabled defaultValue={4.8} className="text-[#6f4e37] text-sm" />
                <span className="text-sm font-bold text-gray-400">4.8 (128 reviews)</span>
             </div>
          </div>

          {/* Pricing Toggle (Mobile/Hero) */}
          <div className="p-1 bg-[#F1E4D8] rounded-2xl inline-flex mb-8">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#6f4e37] text-white shadow-lg' : 'text-[#6f4e37]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-[#6f4e37] text-white shadow-lg' : 'text-[#6f4e37]'}`}
            >
              Yearly <span className="text-[10px] ml-1 opacity-80">(SAVE 25%)</span>
            </button>
          </div>

          {/* --- ORIGIN STORY --- */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-[#6f4e37]/5 relative overflow-hidden"
          >
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#6f4e37] mb-8">From Farm to Cup</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black mb-6 leading-tight">The Misty Peaks of {COFFEE_DATA.origin}</h3>
                <p className="text-gray-600 leading-relaxed mb-8 italic">
                  "Every bean tells the story of the morning dew and the volcanic soil of the Central Highlands."
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <Avatar size={64} icon={<User />} />
                  <div>
                    <div className="font-bold text-lg">{COFFEE_DATA.farmer}</div>
                    <div className="text-xs text-gray-400 uppercase font-black">Head Farmer</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FFF9F3] p-6 rounded-3xl text-center">
                  <Globe className="w-8 h-8 mx-auto mb-3 text-[#6f4e37]" />
                  <div className="text-[10px] uppercase font-black opacity-50">Origin</div>
                  <div className="font-bold">Vietnam</div>
                </div>
                <div className="bg-[#FFF9F3] p-6 rounded-3xl text-center">
                  <Leaf className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <div className="text-[10px] uppercase font-black opacity-50">Process</div>
                  <div className="font-bold">Washed</div>
                </div>
              </div>
            </div>
            
            <Divider className="border-[#6f4e37]/10" />
            
            <div className="flex flex-wrap gap-3">
              {COFFEE_DATA.notes.map(note => (
                <span key={note} className="px-4 py-2 bg-amber-50 rounded-full text-amber-900 text-xs font-black border border-amber-200">
                  {note}
                </span>
              ))}
            </div>
          </motion.section>

          {/* What's Included */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black">Plan Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Package, title: 'Fresh Roasted', desc: 'Ships within 24h' },
                { icon: Calendar, title: 'Flexible', desc: 'Edit or Pause' },
                { icon: ShieldCheck, title: 'Certified', desc: '100% Arabica' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-[#6f4e37]/5 shadow-sm">
                  <item.icon className="w-8 h-8 mb-4 text-[#6f4e37]" />
                  <div className="font-bold">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="space-y-8 bg-white/50 p-8 rounded-[40px]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#6f4e37]">Social Proof</h2>
              <Button type="link" className="font-bold text-[#6f4e37]">See All 128 Reviews <ChevronRight className="w-4 h-4 inline" /></Button>
            </div>
            <div className="space-y-6">
              {REVIEWS.map(rev => (
                <div key={rev.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-[#6f4e37]" />
                      <div>
                        <div className="font-bold text-sm">{rev.user}</div>
                        {rev.verified && <Tag color="success" className="text-[8px] font-black border-none rounded-full px-2">VERIFIED BUYER</Tag>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{rev.date}</span>
                  </div>
                  <Rate disabled value={rev.rating} className="text-[#6f4e37] text-xs mb-2" />
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* --- RIGHT COLUMN: CONVERSION WIDGET (Sticky) --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-28 space-y-6">
            
            {/* Main Purchase Card */}
            <div className="bg-white rounded-[40px] p-8 shadow-2xl border-4 border-white">
              <div className="hidden lg:block mb-6">
                <h1 className="text-4xl font-black mb-2">{COFFEE_DATA.name}</h1>
                <div className="flex items-center gap-4">
                  <Rate disabled defaultValue={4.8} className="text-[#6f4e37] text-xs" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Premium Selection</span>
                </div>
              </div>

              {/* SUBSCRIBE & SAVE TOGGLE */}
              <div className="space-y-4 mb-10">
                <div 
                  onClick={() => setPurchaseType('subscribe')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${purchaseType === 'subscribe' ? 'border-[#6f4e37] bg-amber-50/30' : 'border-gray-100 hover:border-amber-200'}`}
                >
                  {purchaseType === 'subscribe' && <div className="absolute top-0 right-6 translate-y-[-50%] bg-[#6f4e37] text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest">RECOMMENDED</div>}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-lg">Subscribe & Save</div>
                      <div className="text-xs text-green-600 font-bold">Save {billingCycle === 'yearly' ? '25%' : '15%'} instantly</div>
                    </div>
                    <Radio checked={purchaseType === 'subscribe'} />
                  </div>
                  {purchaseType === 'subscribe' && (
                    <div className="mt-4 pt-4 border-t border-[#6f4e37]/10 text-xs space-y-2">
                       <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Free Shipping included</div>
                       <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Priority access to new micro-lots</div>
                    </div>
                  )}
                </div>

                <div 
                  onClick={() => setPurchaseType('once')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${purchaseType === 'once' ? 'border-[#6f4e37] bg-amber-50/30' : 'border-gray-100 hover:border-amber-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold">One-time purchase</div>
                    <Radio checked={purchaseType === 'once'} />
                  </div>
                </div>
              </div>

              {/* CUSTOMIZATION */}
              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-50">Grind Type</label>
                    <Select value={grind} onChange={setGrind} className="w-full custom-select" size="large">
                      <Select.Option value="Beans">Whole Beans</Select.Option>
                      <Select.Option value="Ground">Ground</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-50">Roast Level</label>
                    <Select value={roast} onChange={setRoast} className="w-full custom-select" size="large">
                      <Select.Option value="Light">Light</Select.Option>
                      <Select.Option value="Medium">Medium</Select.Option>
                      <Select.Option value="Dark">Dark</Select.Option>
                    </Select>
                  </div>
                </div>

                {purchaseType === 'subscribe' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-50">Delivery Frequency</label>
                    <Select value={frequency} onChange={setFrequency} className="w-full custom-select" size="large">
                      <Select.Option value="Every week">Every 1 week</Select.Option>
                      <Select.Option value="Every 2 weeks">Every 2 weeks</Select.Option>
                      <Select.Option value="Monthly">Every month</Select.Option>
                    </Select>
                  </div>
                )}

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-50">Quantity</label>
                   <InputNumber min={1} value={quantity} onChange={(v) => setQuantity(v || 1)} size="large" className="w-full" />
                </div>
              </div>

              {/* PRICE & CTA */}
              <div className="pt-8 border-t border-gray-100">
                {purchaseType === 'subscribe' && (
                  <div className="text-right text-xs text-green-600 font-bold mb-1">
                    You save {savings.toLocaleString()}đ per cycle!
                  </div>
                )}
                <div className="flex items-end justify-between mb-8">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Price</div>
                  <div className="text-4xl font-black text-[#6f4e37]">{finalPrice.toLocaleString()}đ</div>
                </div>

                <Button 
                  block 
                  size="large" 
                  type="primary"
                  className="h-20 rounded-2xl bg-[#6f4e37] border-none text-xl font-black tracking-tighter hover:bg-[#4e3524] transition-all shadow-xl shadow-brown-200"
                  icon={purchaseType === 'subscribe' ? <Calendar className="w-6 h-6 mr-2" /> : <ShoppingCart className="w-6 h-6 mr-2" />}
                  onClick={handleCTA}
                >
                  {purchaseType === 'subscribe' ? 'START SUBSCRIPTION' : 'ADD TO CART'}
                </Button>
                
                <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                   <div className="flex items-center gap-1"><Truck size={14} /> Free Express</div>
                   <div className="flex items-center gap-1"><ShieldCheck size={14} /> Safe Payment</div>
                </div>
              </div>
            </div>

            {/* Urgency Widget */}
            <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Package className="text-red-500 w-6 h-6" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <div className="text-red-600 font-black text-xs uppercase tracking-widest">Urgency Alarm</div>
                <div className="text-red-800 font-bold">Only {COFFEE_DATA.stock} packages left in this batch.</div>
              </div>
            </div>
            
            {/* Social Proof (Trust) Widget */}
            <div className="bg-green-50 p-6 rounded-[32px] border border-green-100 flex items-center gap-4">
              <Avatar.Group maxCount={3} size="small">
                <Avatar src="https://i.pravatar.cc/150?u=1" />
                <Avatar src="https://i.pravatar.cc/150?u=2" />
                <Avatar src="https://i.pravatar.cc/150?u=3" />
              </Avatar.Group>
              <div className="text-green-800 font-bold text-sm">Join 1000+ happy subscribers today.</div>
            </div>

          </div>
        </div>
      </main>

      {/* Related Packages */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-black mb-12">Complete Your Experience</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {RELATED.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-[#6f4e37]/5 group cursor-pointer">
              <div className="h-48 bg-[#FFF9F3] rounded-[32px] mb-6 overflow-hidden">
                <img src={COFFEE_DATA.images[0]} alt="Coffee" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" />
              </div>
              <h4 className="font-black text-lg mb-2 line-clamp-1">{item.name}</h4>
              <p className="text-xs text-gray-400 mb-6">{item.tagline}</p>
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#6f4e37]">{item.basePrice?.toLocaleString()}đ</div>
                <Button shape="circle" icon={<ChevronRight size={16} />} className="bg-[#6f4e37] text-white border-none" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[100] flex items-center justify-between shadow-2xl">
         <div>
            <div className="text-[10px] font-black uppercase text-gray-400">Total Price</div>
            <div className="text-2xl font-black text-[#6f4e37]">{finalPrice.toLocaleString()}đ</div>
         </div>
         <Button 
          type="primary" 
          size="large" 
          className="bg-[#6f4e37] border-none h-14 px-8 rounded-2xl font-black"
          onClick={handleCTA}
        >
          {purchaseType === 'subscribe' ? 'SUBSCRIBE' : 'BUY NOW'}
        </Button>
      </div>

    </div>
  );
};

// Simplified CheckCircle to match Lucide style
const CheckCircle = ({ size, className }: { size: number, className: string }) => (
  <ShieldCheck size={size} className={className} />
);

export default CoffeePackageDetail;
