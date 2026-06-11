import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "http://localhost:8081";

// ─── helpers ────────────────────────────────────────────────────
const api = async (path, opts = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
};

const fmt = (n) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
};

// ─── tiny components ─────────────────────────────────────────────
const Pill = ({ children, color = "stone" }) => {
  const map = {
    stone: "bg-stone-100 text-stone-600",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-600",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full tracking-wide uppercase ${map[color]}`}>
      {children}
    </span>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <motion.div
      className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  </div>
);

const ErrorBox = ({ msg, onRetry }) => (
  <motion.div
    variants={fade}
    initial="hidden"
    animate="show"
    className="bg-red-50 border border-red-100 rounded-xl p-5 text-center"
  >
    <p className="text-red-600 text-sm mb-3">{msg}</p>
    {onRetry && (
      <button onClick={onRetry} className="text-xs underline text-red-500 hover:text-red-700">
        Try again
      </button>
    )}
  </motion.div>
);

const StepBar = ({ steps, current }) => (
  <div className="flex items-center gap-0 mb-10">
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: active ? 1.1 : 1 }}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border
                ${done ? "bg-stone-800 border-stone-800 text-white" : active ? "border-stone-800 text-stone-800" : "border-stone-300 text-stone-400"}`}
            >
              {done ? "✓" : i + 1}
            </motion.div>
            <span className={`text-[10px] mt-1 font-medium tracking-wide ${active ? "text-stone-800" : "text-stone-400"}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-4 ${done ? "bg-stone-800" : "bg-stone-200"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── CART PAGE ────────────────────────────────────────────────────
function CartPage({ userId, cartId, onCheckout }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api(`/api/cart?userId=${userId}`);
      setCart(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const removeItem = async (cartItemId) => {
    setRemoving(cartItemId);
    try {
      await api(`/api/cart/remove/${cartItemId}?userId=${userId}`, { method: "DELETE" });
      setCart((prev) => ({
        ...prev,
        lines: prev.lines.filter((l) => l.cartItemId !== cartItemId),
        grandTotal: prev.lines.filter((l) => l.cartItemId !== cartItemId).reduce((s, l) => s + l.lineTotal, 0),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setRemoving(null);
    }
  };

  const clearCart = async () => {
    try {
      await api(`/api/cart/clear?userId=${userId}`, { method: "DELETE" });
      setCart((prev) => ({ ...prev, lines: [], grandTotal: 0 }));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBox msg={error} onRetry={fetchCart} />;

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Your cart</h1>
          <p className="text-stone-500 text-sm mt-0.5">{isEmpty ? "Nothing here yet" : `${lines.length} item${lines.length > 1 ? "s" : ""}`}</p>
        </div>
        {!isEmpty && (
          <button onClick={clearCart} className="text-xs text-stone-400 hover:text-red-500 transition-colors underline">
            Clear cart
          </button>
        )}
      </div>

      {isEmpty ? (
        <motion.div variants={fade} className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-4">🛋️</div>
          <p className="font-medium">Your cart is empty</p>
          <p className="text-sm mt-1">Browse the catalog and add some pieces</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {lines.map((line) => (
                <motion.div
                  key={line.cartItemId}
                  variants={fade}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  layout
                  className="bg-white border border-stone-100 rounded-2xl p-4 flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-stone-50 flex items-center justify-center text-2xl shrink-0">
                    {line.itemType === "BUNDLE" ? "📦" : "🪑"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm truncate">{line.itemName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Pill color={line.itemType === "BUNDLE" ? "amber" : "stone"}>{line.itemType}</Pill>
                      <span className="text-stone-400 text-xs">qty {line.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-stone-900 text-sm">{fmt(line.lineTotal)}</p>
                    <p className="text-stone-400 text-xs">{fmt(line.unitPrice)} each</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeItem(line.cartItemId)}
                    disabled={removing === line.cartItemId}
                    className="ml-2 w-7 h-7 rounded-full flex items-center justify-center text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {removing === line.cartItemId ? (
                      <motion.div className="w-3 h-3 border border-stone-400 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6 }} />
                    ) : "×"}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="lg:col-span-1">
            <motion.div variants={fade} className="bg-stone-900 text-white rounded-2xl p-6 sticky top-4">
              <p className="text-stone-400 text-xs uppercase tracking-widest mb-4">Order summary</p>
              <div className="space-y-2 mb-5">
                {lines.map((l) => (
                  <div key={l.cartItemId} className="flex justify-between text-sm">
                    <span className="text-stone-400 truncate max-w-[140px]">{l.itemName}</span>
                    <span className="text-stone-300">{fmt(l.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-700 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-300 text-sm">Total</span>
                  <span className="text-xl font-semibold">{fmt(cart.grandTotal)}</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onCheckout(cart)}
                className="w-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Proceed to checkout →
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────
function CheckoutPage({ userId, cart, onOrderCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = await api("/api/order/create", {
        method: "POST",
        body: JSON.stringify({ userId, cartId: cart.cartId }),
      });
      onOrderCreated(order);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const lines = cart?.lines ?? [];

  return (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit">
      <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Order summary</h1>
      <p className="text-stone-500 text-sm mb-6">Review before confirming</p>

      {error && <ErrorBox msg={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-3 space-y-2">
          {lines.map((line) => (
            <motion.div key={line.cartItemId} variants={fade} className="bg-white border border-stone-100 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-50 flex items-center justify-center text-lg shrink-0">
                {line.itemType === "BUNDLE" ? "📦" : "🪑"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{line.itemName}</p>
                <p className="text-xs text-stone-400">qty {line.quantity} · {fmt(line.unitPrice)} each</p>
              </div>
              <span className="text-sm font-semibold text-stone-800 shrink-0">{fmt(line.lineTotal)}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fade} className="lg:col-span-2">
          <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Delivery info</p>
            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <span className="text-stone-300">📍</span> Karachi, Pakistan
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-300">🚚</span> Standard delivery · 5–7 days
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-300">📦</span> White-glove assembly included
              </div>
            </div>
          </div>

          <div className="bg-stone-900 text-white rounded-2xl p-5">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-stone-400 text-sm">Subtotal</span>
              <span className="text-stone-300 text-sm">{fmt(cart.grandTotal)}</span>
            </div>
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-stone-400 text-sm">Delivery</span>
              <span className="text-emerald-400 text-sm">Free</span>
            </div>
            <div className="border-t border-stone-700 pt-4 flex justify-between items-baseline mb-5">
              <span className="text-stone-300 text-sm">Total</span>
              <span className="text-xl font-semibold">{fmt(cart.grandTotal)}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={placeOrder}
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <motion.div className="w-4 h-4 border-2 border-stone-800 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7 }} />
              ) : (
                "Confirm order →"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── PAYMENT PAGE ─────────────────────────────────────────────────
function PaymentPage({ order, onPaymentDone }) {
  const [gateway, setGateway] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const gateways = [
    {
      id: "STRIPE",
      name: "Stripe",
      desc: "Visa · Mastercard · Amex",
      icon: "💳",
      badge: "International",
      badgeColor: "sky",
    },
    {
      id: "JAZZCASH",
      name: "JazzCash",
      desc: "Mobile wallet · Easypaisa-compatible",
      icon: "📱",
      badge: "Local",
      badgeColor: "emerald",
    },
  ];

  const pay = async () => {
    if (!gateway) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api("/api/payment/process", {
        method: "POST",
        body: JSON.stringify({ orderId: order.orderId, gatewayType: gateway, amountInPKR: order.grandTotal }),
      });
      onPaymentDone(result);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit" className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Payment</h1>
      <p className="text-stone-500 text-sm mb-6">Order #{order.orderId} · {fmt(order.grandTotal)}</p>

      {error && <div className="mb-4"><ErrorBox msg={error} /></div>}

      <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Choose gateway</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {gateways.map((g) => (
          <motion.button
            key={g.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setGateway(g.id)}
            className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
              gateway === g.id
                ? "border-stone-800 bg-stone-50"
                : "border-stone-100 bg-white hover:border-stone-300"
            }`}
          >
            <div className="text-2xl mb-2">{g.icon}</div>
            <p className="font-semibold text-stone-900 text-sm">{g.name}</p>
            <p className="text-stone-400 text-xs mt-0.5">{g.desc}</p>
            <div className="mt-2">
              <Pill color={g.badgeColor}>{g.badge}</Pill>
            </div>
            {gateway === g.id && (
              <motion.div
                layoutId="gateway-check"
                className="absolute top-3 right-3 w-5 h-5 bg-stone-800 rounded-full flex items-center justify-center text-white text-xs"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 mb-5 text-sm space-y-1">
        <div className="flex justify-between text-stone-600">
          <span>Order</span><span>#{order.orderId}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Items</span><span>{order.items?.length ?? "—"}</span>
        </div>
        <div className="flex justify-between font-semibold text-stone-900 pt-1 border-t border-stone-200">
          <span>Total</span><span>{fmt(order.grandTotal)}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: gateway ? 1.02 : 1 }}
        whileTap={{ scale: 0.97 }}
        onClick={pay}
        disabled={!gateway || loading}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7 }} />
        ) : (
          `Pay ${gateway ? fmt(order.grandTotal) : "—"} via ${gateway ?? "…"}`
        )}
      </motion.button>
      <p className="text-center text-xs text-stone-400 mt-3">🔒 Secured via {gateway === "STRIPE" ? "Stripe PCI DSS" : gateway === "JAZZCASH" ? "JazzCash encryption" : "end-to-end encryption"}</p>
    </motion.div>
  );
}

// ─── SUCCESS PAGE ─────────────────────────────────────────────────
function SuccessPage({ payment, onDone }) {
  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="show"
      className="text-center py-12 max-w-sm mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5"
      >
        ✓
      </motion.div>
      <h2 className="text-2xl font-semibold text-stone-900 mb-2">Payment confirmed</h2>
      <p className="text-stone-500 text-sm mb-6">Your order is being prepared</p>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
        <div className="flex justify-between text-stone-600">
          <span>Transaction ID</span>
          <span className="font-mono text-xs text-stone-800">{payment.transactionId}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Gateway</span><span>{payment.gateway}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Amount (PKR)</span><span className="font-semibold">{fmt(payment.amountInPKR)}</span>
        </div>
        {payment.amountInUSD && (
          <div className="flex justify-between text-stone-600">
            <span>Amount (USD)</span><span>${payment.amountInUSD?.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-stone-600">
          <span>Status</span>
          <Pill color="emerald">{payment.status}</Pill>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDone}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        Back to shop
      </motion.button>
    </motion.div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────
export default function App() {
  // Mock: in production, pull from auth context / localStorage
  const userId = 1;

  const [step, setStep] = useState(0); // 0=cart 1=checkout 2=payment 3=success
  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);

  const steps = ["Cart", "Checkout", "Payment"];

  const handleCheckout = (cartData) => {
    setCart(cartData);
    setStep(1);
  };

  const handleOrderCreated = (orderData) => {
    setOrder(orderData);
    setStep(2);
  };

  const handlePaymentDone = (paymentData) => {
    setPayment(paymentData);
    setStep(3);
  };

  const reset = () => {
    setStep(0);
    setCart(null);
    setOrder(null);
    setPayment(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] font-sans">
      {/* top bar */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-stone-900 tracking-tight text-lg">
            palette<span className="text-amber-500">.</span>
          </span>
          {step < 3 && (
            <div className="flex items-center gap-1 text-xs text-stone-500">
              {steps.map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  {i > 0 && <span className="text-stone-300">›</span>}
                  <span className={step === i ? "text-stone-900 font-medium" : ""}>{s}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step < 3 && step > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setStep((s) => s - 1)}
            className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-6 flex items-center gap-1"
          >
            ← Back
          </motion.button>
        )}

        {step > 0 && step < 3 && <StepBar steps={steps} current={step} />}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="cart" variants={fade} initial="hidden" animate="show" exit="exit">
              <CartPage userId={userId} onCheckout={handleCheckout} />
            </motion.div>
          )}
          {step === 1 && cart && (
            <motion.div key="checkout" variants={fade} initial="hidden" animate="show" exit="exit">
              <CheckoutPage userId={userId} cart={cart} onOrderCreated={handleOrderCreated} />
            </motion.div>
          )}
          {step === 2 && order && (
            <motion.div key="payment" variants={fade} initial="hidden" animate="show" exit="exit">
              <PaymentPage order={order} onPaymentDone={handlePaymentDone} />
            </motion.div>
          )}
          {step === 3 && payment && (
            <motion.div key="success" variants={fade} initial="hidden" animate="show" exit="exit">
              <SuccessPage payment={payment} onDone={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}