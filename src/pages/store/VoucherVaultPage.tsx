import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Truck, Tag, Star, Clock, X, Send,
  MessageCircle, Bot, ChevronRight, CheckCircle,
  AlertTriangle, ShoppingCart, Sparkles, Copy, Check
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type VoucherStatus = 'active' | 'used' | 'expired';

interface CustomerVoucher {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  category: string;
  expiryDate: string;
  status: VoucherStatus;
  receivedAt: string;
  isNew?: boolean;
}

interface AiMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

// ─── Mock Vouchers — keyed to the logged-in user_ID ──────────────────────────
// In production: GET /api/vouchers/my  (Bearer token → server resolves user_ID)

const makeMockVouchers = (): CustomerVoucher[] => {
  const now = new Date();
  const ahead = (d: number) =>
    new Date(now.getTime() + d * 86_400_000).toISOString().slice(0, 10);
  const ago = (d: number) =>
    new Date(now.getTime() - d * 86_400_000).toISOString().slice(0, 10);

  return [
    {
      id: 'vc1', code: 'WELCOME50K', name: 'Welcome Gift – 50K Off',
      description: 'Exclusive for your first order at Antigravity.',
      discountType: 'fixed', discountValue: 50000, minOrderValue: 200000,
      category: 'all', expiryDate: ahead(14), status: 'active',
      receivedAt: ago(1), isNew: true,
    },
    {
      id: 'vc2', code: 'FREESHIP', name: 'Free Shipping',
      description: 'No minimum order value. Valid for all items.',
      discountType: 'fixed', discountValue: 30000, minOrderValue: 0,
      category: 'shipping', expiryDate: ahead(2), status: 'active',
      receivedAt: ago(5),
    },
    {
      id: 'vc3', code: 'LOYAL20PCT', name: 'Loyalty 20% Off',
      description: 'Max discount 100,000đ. Valid on any category.',
      discountType: 'percent', discountValue: 20, minOrderValue: 150000,
      maxDiscount: 100000, category: 'all', expiryDate: ahead(30),
      status: 'active', receivedAt: ago(3),
    },
    {
      id: 'vc4', code: 'BIRTHDAY30K', name: 'Birthday Special – 30K Off',
      description: 'A gift from your Antigravity consultant. Happy birthday! 🎂',
      discountType: 'fixed', discountValue: 30000, minOrderValue: 100000,
      category: 'all', expiryDate: ahead(60), status: 'active',
      receivedAt: ago(0), isNew: true,
    },
    {
      id: 'vc5', code: 'VIP15PCT', name: 'VIP 15% – Used',
      description: 'Already applied to your last order.',
      discountType: 'percent', discountValue: 15, minOrderValue: 300000,
      maxDiscount: 150000, category: 'all', expiryDate: ahead(10),
      status: 'used', receivedAt: ago(10),
    },
    {
      id: 'vc6', code: 'SUMMER10K', name: 'Summer – 10K Off (Expired)',
      description: 'Summer campaign voucher.',
      discountType: 'fixed', discountValue: 10000, minOrderValue: 50000,
      category: 'all', expiryDate: ago(3), status: 'expired',
      receivedAt: ago(30),
    },
  ];
};

// ─── Voucher Type Icon ────────────────────────────────────────────────────────

const VoucherIcon = ({ category, status }: { category: string; status: VoucherStatus }) => {
  const base = 'w-10 h-10 rounded-xl flex items-center justify-center';
  if (status === 'used')    return <div className={`${base} bg-slate-200`}><CheckCircle className="w-5 h-5 text-slate-400" /></div>;
  if (status === 'expired') return <div className={`${base} bg-slate-100`}><Clock className="w-5 h-5 text-slate-300" /></div>;
  if (category === 'shipping') return <div className={`${base} bg-blue-100`}><Truck className="w-5 h-5 text-blue-600" /></div>;
  if (category === 'coffee')   return <div className={`${base} bg-amber-100`}><Star className="w-5 h-5 text-amber-600" /></div>;
  return <div className={`${base} bg-rose-100`}><Gift className="w-5 h-5 text-rose-600" /></div>;
};

// ─── AI Customer Assistant ────────────────────────────────────────────────────

const AI_REPLIES: Record<string, string> = {
  default: "Hi! I'm your Voucher Assistant 🎁 Ask me about your vouchers, how to use them, or which one saves you the most.",
  use:     "To use a voucher, click **[Use Now]** on any active card. It'll auto-fill at checkout!",
  best:    "For the best savings, pick **Loyalty 20%** on orders above 150,000đ. Cap is 100,000đ.",
  ship:    "**Free Shipping** has no minimum — perfect for small orders where delivery fees add up.",
  expiry:  "Vouchers highlighted in red expire within 3 days. Don't miss them!",
  code:    "You can copy a voucher code by clicking the code badge. It'll be copied to your clipboard.",
  transfer:"Sorry, vouchers are tied to your account and cannot be transferred to another user.",
};
const getReply = (msg: string) => {
  const m = msg.toLowerCase();
  if (m.includes('use') || m.includes('apply') || m.includes('checkout')) return AI_REPLIES.use;
  if (m.includes('best') || m.includes('most') || m.includes('save'))     return AI_REPLIES.best;
  if (m.includes('ship') || m.includes('deliver'))                         return AI_REPLIES.ship;
  if (m.includes('expir') || m.includes('expire'))                         return AI_REPLIES.expiry;
  if (m.includes('code') || m.includes('copy'))                            return AI_REPLIES.code;
  if (m.includes('transfer') || m.includes('share') || m.includes('give')) return AI_REPLIES.transfer;
  return AI_REPLIES.default;
};

const CustomerAIChat = ({ onClose }: { onClose: () => void }) => {
  const [msgs, setMsgs]       = useState<AiMessage[]>([{ id: '0', sender: 'bot', text: AI_REPLIES.default }]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const endRef                = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs(p => [...p, { id: Date.now().toString(), sender: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), sender: 'bot', text: getReply(text) }]);
      setTyping(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-4 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{ height: 400, background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)', border: '1px solid #fed7aa' }}
    >
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)' }}>
        <Bot className="w-5 h-5 text-white" />
        <span className="font-bold text-white text-sm flex-1">Voucher Assistant</span>
        <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-amber-500 text-white rounded-br-none'
                : 'bg-white border border-orange-100 text-slate-700 shadow-sm rounded-bl-none'
            }`}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-1 px-3 py-2 bg-white border border-orange-100 rounded-2xl rounded-bl-none w-16">
            {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-orange-100 flex gap-2 bg-white/60">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about your vouchers…"
          className="flex-1 px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400" />
        <button onClick={send} className="w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-xl flex items-center justify-center transition-colors">
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Voucher Card ─────────────────────────────────────────────────────────────

const VoucherCard = ({ v, onUseNow, onViewTerms }: {
  v: CustomerVoucher;
  onUseNow: (v: CustomerVoucher) => void;
  onViewTerms: (v: CustomerVoucher) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const daysLeft = Math.ceil((new Date(v.expiryDate).getTime() - Date.now()) / 86_400_000);
  const expiringSoon = v.status === 'active' && daysLeft <= 3;

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(v.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      whileHover={v.status === 'active' ? { y: -3, boxShadow: '0 12px 40px rgba(245,158,11,0.18)' } : {}}
      className={`relative rounded-2xl border overflow-hidden transition-all cursor-pointer ${
        v.status === 'active'
          ? 'bg-white border-orange-100 shadow-md'
          : 'bg-slate-50 border-slate-200 opacity-70'
      }`}
      onClick={() => v.status === 'active' && onViewTerms(v)}
    >
      {/* Top strip */}
      <div className={`h-1.5 w-full ${
        v.status === 'expired' ? 'bg-slate-300' :
        v.status === 'used'    ? 'bg-slate-400' :
        expiringSoon           ? 'bg-red-400'   :
        'bg-gradient-to-r from-amber-400 to-orange-500'
      }`} />

      {/* New badge */}
      {v.isNew && v.status === 'active' && (
        <div className="absolute top-4 right-4">
          <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" /> NEW
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <VoucherIcon category={v.category} status={v.status} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-tight">{v.name}</p>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 mt-1 group"
            >
              <span className="text-xs font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full group-hover:bg-amber-100 transition-colors">
                {v.code}
              </span>
              {copied
                ? <Check className="w-3 h-3 text-green-500" />
                : <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{v.description}</p>

        {/* Discount value */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-extrabold text-amber-600">
            {v.discountType === 'fixed'
              ? `${v.discountValue.toLocaleString('vi-VN')}đ`
              : `${v.discountValue}%`} off
          </span>
          {v.minOrderValue > 0 && (
            <span className="text-xs text-slate-400">
              orders ≥ {v.minOrderValue.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        {/* Expiry */}
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
          v.status === 'expired' || v.status === 'used' ? 'text-slate-400' :
          expiringSoon ? 'text-red-500' : 'text-slate-400'
        }`}>
          {expiringSoon && <AlertTriangle className="w-3 h-3" />}
          <Clock className="w-3 h-3" />
          {v.status === 'expired' ? `Expired ${v.expiryDate}` :
           v.status === 'used'    ? `Used · Expired ${v.expiryDate}` :
           expiringSoon           ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!` :
                                    `Valid until ${v.expiryDate}`}
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-3">
          {v.status === 'active' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                id={`use-voucher-${v.id}`}
                onClick={e => { e.stopPropagation(); onUseNow(v); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all"
                style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)' }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Use Now
              </motion.button>
              <button
                onClick={e => { e.stopPropagation(); onViewTerms(v); }}
                className="px-3 py-2 rounded-xl text-xs text-slate-500 border border-slate-200 hover:border-amber-300 hover:text-amber-600 transition-all"
              >
                View Terms
              </button>
            </>
          ) : (
            <button disabled className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-400 cursor-not-allowed">
              {v.status === 'used' ? '✓ Used' : 'Expired'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Terms Modal ──────────────────────────────────────────────────────────────

const TermsModal = ({ v, onClose, onUseNow }: {
  v: CustomerVoucher;
  onClose: () => void;
  onUseNow: (v: CustomerVoucher) => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
    onClick={onClose}
  >
    <motion.div
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      onClick={e => e.stopPropagation()}
      className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
    >
      <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)' }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <VoucherIcon category={v.category} status={v.status} />
            <div>
              <h3 className="font-bold text-slate-800">{v.name}</h3>
              <span className="text-xs font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{v.code}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3 text-sm">
          {[
            ['Discount',      v.discountType === 'fixed' ? `${v.discountValue.toLocaleString('vi-VN')}đ off` : `${v.discountValue}% off`],
            ['Minimum Order', v.minOrderValue > 0 ? `${v.minOrderValue.toLocaleString('vi-VN')}đ` : 'No minimum'],
            ['Max Discount',  v.maxDiscount ? `${v.maxDiscount.toLocaleString('vi-VN')}đ` : 'No cap'],
            ['Category',      v.category === 'all' ? 'All products' : v.category],
            ['Expiry Date',   v.expiryDate],
            ['Status',        v.status.charAt(0).toUpperCase() + v.status.slice(1)],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-400 font-medium">{label}</span>
              <span className="font-semibold text-slate-700">{val}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          Voucher is tied to your account (ID: linked) and cannot be transferred. One-time use only. Cannot be combined with other vouchers.
        </p>

        {v.status === 'active' && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { onClose(); onUseNow(v); }}
            className="mt-4 w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
            style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)' }}
          >
            <ShoppingCart className="w-4 h-4" />
            Use Your Voucher Now
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { key: VoucherStatus; label: string }[] = [
  { key: 'active',  label: 'Active'  },
  { key: 'used',    label: 'Used'    },
  { key: 'expired', label: 'Expired' },
];

const VoucherVaultPage: React.FC = () => {
  const { user } = useAuth();
  const [vouchers]    = useState<CustomerVoucher[]>(makeMockVouchers);
  const [tab, setTab] = useState<VoucherStatus>('active');
  const [termsOf, setTermsOf]   = useState<CustomerVoucher | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const hasNew    = vouchers.some(v => v.isNew && v.status === 'active');
  const filtered  = vouchers.filter(v => v.status === tab);
  const counts    = { active: vouchers.filter(v => v.status === 'active').length,
                      used:   vouchers.filter(v => v.status === 'used').length,
                      expired:vouchers.filter(v => v.status === 'expired').length };

  const handleUseNow = (v: CustomerVoucher) => {
    // In production: navigate to /order?voucher=CODE and auto-apply
    window.location.href = `/order?voucher=${v.code}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#fff7ed 0%,#fef3c7 50%,#fff 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* New Voucher Banner */}
        <AnimatePresence>
          {hasNew && !bannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl shadow-md"
              style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)', color: '#fff' }}
            >
              <Gift className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold flex-1">
                🎁 You just received a voucher from Antigravity!
              </span>
              <button onClick={() => setBannerDismissed(true)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            Your Voucher Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hi {user?.name ?? 'there'} 👋 — you have{' '}
            <strong className="text-amber-600">{counts.active} active</strong> voucher{counts.active !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-white/70 backdrop-blur rounded-2xl border border-orange-100 shadow-sm mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                tab === t.key
                  ? 'text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              style={tab === t.key ? { background: 'linear-gradient(90deg,#f59e0b,#f97316)' } : {}}
            >
              {t.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Voucher Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {filtered.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-slate-400">
                <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No {tab} vouchers</p>
              </div>
            ) : (
              filtered.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <VoucherCard v={v} onUseNow={handleUseNow} onViewTerms={setTermsOf} />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Terms Modal */}
      <AnimatePresence>
        {termsOf && (
          <TermsModal v={termsOf} onClose={() => setTermsOf(null)} onUseNow={handleUseNow} />
        )}
      </AnimatePresence>

      {/* AI Chat */}
      <AnimatePresence>
        {chatOpen && <CustomerAIChat onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setChatOpen(c => !c)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', boxShadow: '0 8px 30px rgba(245,158,11,0.4)' }}
        aria-label="Open voucher assistant"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};

export default VoucherVaultPage;
