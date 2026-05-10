import { useState, useMemo } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { IconComponent } from "@/components/ui/IconSelector";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus = "in_kitchen" | "wait_list" | "ready" | "served";
type OrderType = "all" | "dine_in" | "wait_list" | "take_away" | "served";
type PaymentMethod = "cash" | "card" | "scan";

interface OrderCard {
  id: string;
  table: string;
  items: number;
  time: string;
  status: OrderStatus;
}

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
}

interface CartItem {
  menuItem: MenuItem;
  qty: number;
}

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const dummyOrders: OrderCard[] = [
  {
    id: "F0027",
    table: "03",
    items: 8,
    time: "2 mins ago",
    status: "in_kitchen",
  },
  {
    id: "F0028",
    table: "07",
    items: 3,
    time: "Just Now",
    status: "wait_list",
  },
  {
    id: "F0019",
    table: "09",
    items: 2,
    time: "25 mins ago",
    status: "ready",
  },
  {
    id: "F0031",
    table: "12",
    items: 5,
    time: "10 mins ago",
    status: "served",
  },
];

const categories = [
  { key: "all", label: { id: "Semua Menu", en: "All Menu" }, emoji: "🍽️", count: 154 },
  { key: "special", label: { id: "Spesial", en: "Special" }, emoji: "⭐", count: 19 },
  { key: "soups", label: { id: "Sup", en: "Soups" }, emoji: "🍜", count: 3 },
  { key: "desserts", label: { id: "Dessert", en: "Desserts" }, emoji: "🍰", count: 19 },
  { key: "chickens", label: { id: "Ayam", en: "Chickens" }, emoji: "🍗", count: 10 },
  { key: "rice", label: { id: "Nasi", en: "Rice" }, emoji: "🍚", count: 12 },
  { key: "pasta", label: { id: "Pasta", en: "Pasta" }, emoji: "🍝", count: 8 },
];

const dummyMenuItems: MenuItem[] = [
  { id: 1, name: "Grilled Salmon Steak", category: "special", price: 15.0, emoji: "🐟" },
  { id: 2, name: "Tofu Poke Bowl", category: "special", price: 7.0, emoji: "🥗" },
  { id: 3, name: "Pasta with Roast Beef", category: "pasta", price: 10.0, emoji: "🍝" },
  { id: 4, name: "Beef Steak", category: "special", price: 30.0, emoji: "🥩" },
  { id: 5, name: "Shrimp Rice Bowl", category: "rice", price: 6.0, emoji: "🍤" },
  { id: 6, name: "Apple Stuffed Pancake", category: "desserts", price: 35.0, emoji: "🥞" },
  { id: 7, name: "Chicken Quinoa & Herbs", category: "chickens", price: 12.0, emoji: "🍗" },
  { id: 8, name: "Vegetable Shrimp", category: "special", price: 10.0, emoji: "🦐" },
  { id: 9, name: "Tom Yum Soup", category: "soups", price: 8.0, emoji: "🍜" },
  { id: 10, name: "Miso Ramen", category: "soups", price: 9.5, emoji: "🍜" },
  { id: 11, name: "Chocolate Lava Cake", category: "desserts", price: 14.0, emoji: "🍫" },
  { id: 12, name: "Fried Chicken Wings", category: "chickens", price: 11.0, emoji: "🍗" },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  OrderStatus,
  { label: { id: string; en: string }; color: string; bg: string }
> = {
  in_kitchen: {
    label: { id: "Di Dapur", en: "In Kitchen" },
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/15 border-neon-cyan/30",
  },
  wait_list: {
    label: { id: "Menunggu", en: "Wait List" },
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/15 border-neon-yellow/30",
  },
  ready: {
    label: { id: "Siap", en: "Ready" },
    color: "text-neon-green",
    bg: "bg-neon-green/15 border-neon-green/30",
  },
  served: {
    label: { id: "Disajikan", en: "Served" },
    color: "text-dark-300",
    bg: "bg-dark-500/20 border-dark-500/30",
  },
};

const orderTypeConfig: {
  key: OrderType;
  label: { id: string; en: string };
  count: number;
}[] = [
  { key: "all", label: { id: "Semua", en: "All" }, count: 78 },
  { key: "dine_in", label: { id: "Dine In", en: "Dine In" }, count: 4 },
  { key: "wait_list", label: { id: "Menunggu", en: "Wait List" }, count: 3 },
  { key: "take_away", label: { id: "Bawa Pulang", en: "Take Away" }, count: 12 },
  { key: "served", label: { id: "Disajikan", en: "Served" }, count: 59 },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  ruleKey?: string;
}
export default function PosPage({ ruleKey }: Props) {
  const { language } = useLanguageStore();

  const [activeOrderType, setActiveOrderType] = useState<OrderType>("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([
    { menuItem: dummyMenuItems[2], qty: 2 },
    { menuItem: dummyMenuItems[4], qty: 2 },
    { menuItem: dummyMenuItems[5], qty: 1 },
    { menuItem: dummyMenuItems[7], qty: 1 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const filteredMenu = useMemo(() => {
    if (activeCategory === "all") return dummyMenuItems;
    return dummyMenuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const getCartQty = (menuItemId: number) => {
    const item = cart.find((c) => c.menuItem.id === menuItemId);
    return item ? item.qty : 0;
  };

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === menuItem.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prev, { menuItem, qty: 1 }];
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === menuItemId);
      if (!existing) return prev;
      if (existing.qty <= 1) {
        return prev.filter((c) => c.menuItem.id !== menuItemId);
      }
      return prev.map((c) =>
        c.menuItem.id === menuItemId ? { ...c, qty: c.qty - 1 } : c,
      );
    });
  };

  const subtotal = cart.reduce(
    (sum, c) => sum + c.menuItem.price * c.qty,
    0,
  );
  const tax = subtotal * 0.06;
  const donation = 1.0;
  const totalPayable = subtotal + tax + donation;

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)] overflow-hidden -m-6">
      {/* ─── Left: Main Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Order Line Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {language({ id: "Antrian Pesanan", en: "Order Line" })}
          </h1>

          {/* Order Type Tabs */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {orderTypeConfig.map((type) => (
              <button
                key={type.key}
                onClick={() => setActiveOrderType(type.key)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${
                  activeOrderType === type.key
                    ? "bg-accent-500/15 border-accent-500/40 text-accent-400"
                    : "bg-dark-800/60 border-dark-600/40 text-dark-300 hover:border-dark-500 hover:text-dark-200"
                }`}
              >
                {language(type.label)}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeOrderType === type.key
                      ? "bg-accent-500 text-white"
                      : "bg-dark-600 text-dark-300"
                  }`}
                >
                  {type.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dummyOrders.map((order) => {
            const status = statusConfig[order.status];
            return (
              <div
                key={order.id}
                className={`min-w-[220px] p-4 rounded-2xl border ${status.bg} flex flex-col gap-3 shrink-0 transition-all hover:scale-[1.02] cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {language({ id: "Pesanan", en: "Order" })} #{order.id}
                  </span>
                  <span className="text-xs text-dark-300">
                    {language({ id: "Meja", en: "Table" })} {order.table}
                  </span>
                </div>
                <div className="text-xs text-dark-300">
                  {language({ id: "Item", en: "Item" })}: <span className="font-bold text-foreground">{order.items}X</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-dark-400">{order.time}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${status.color} ${status.bg}`}
                  >
                    {language(status.label)}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Scroll indicator */}
          <div className="min-w-[48px] flex items-center justify-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-dark-800/60 border border-dark-600/40 flex items-center justify-center text-dark-400 hover:text-dark-200 hover:border-dark-500 transition-all cursor-pointer">
              <IconComponent iconName="Hi/HiOutlineChevronRight" size={18} />
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {language({ id: "Menu Makanan", en: "Foodies Menu" })}
            </h2>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-full bg-dark-800/60 border border-dark-600/40 flex items-center justify-center text-dark-400 hover:text-dark-200 hover:border-dark-500 transition-all">
                <IconComponent iconName="Hi/HiOutlineChevronLeft" size={14} />
              </button>
              <button className="w-8 h-8 rounded-full bg-dark-800/60 border border-dark-600/40 flex items-center justify-center text-dark-400 hover:text-dark-200 hover:border-dark-500 transition-all">
                <IconComponent iconName="Hi/HiOutlineChevronRight" size={14} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-semibold shrink-0 transition-all duration-200 ${
                  activeCategory === cat.key
                    ? "bg-accent-500/15 border-accent-500/40 text-accent-400 shadow-lg shadow-accent-500/10"
                    : "bg-dark-800/40 border-dark-600/30 text-dark-300 hover:border-dark-500 hover:text-dark-200"
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex flex-col items-start">
                  <span>{language(cat.label)}</span>
                  <span className="text-[10px] font-normal text-dark-400">
                    {cat.count} {language({ id: "item", en: "items" })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenu.map((item) => {
            const qty = getCartQty(item.id);
            const isInCart = qty > 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                  isInCart
                    ? "bg-accent-500/5 border-accent-500/30 shadow-md shadow-accent-500/5"
                    : "bg-dark-800/40 border-dark-600/30 hover:border-dark-500"
                }`}
              >
                {/* Emoji as Product Image */}
                <div className="w-full aspect-square rounded-xl bg-dark-700/50 flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform">
                  <span className="text-5xl">{item.emoji}</span>
                </div>

                {/* Category Tag */}
                <span className="text-[10px] font-medium text-dark-400 uppercase tracking-wider">
                  {item.category}
                </span>

                {/* Name */}
                <h3 className="text-sm font-bold text-foreground mt-0.5 leading-tight line-clamp-2">
                  {item.name}
                </h3>

                {/* Price + Controls */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold text-accent-400">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="w-6 h-6 rounded-full bg-dark-600/60 text-dark-300 flex items-center justify-center hover:bg-dark-500 hover:text-foreground transition-all text-xs font-bold"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold text-foreground w-4 text-center">
                      {qty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center hover:bg-accent-600 transition-all text-xs font-bold shadow-md shadow-accent-500/30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Right: Order Panel ─────────────────────────────────────── */}
      <div className="w-[340px] shrink-0 bg-dark-800/60 border-l border-dark-600/40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-dark-600/40">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              {language({ id: "Meja No", en: "Table No" })} #04
            </h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-dark-700/60 border border-dark-600/40 flex items-center justify-center text-dark-400 hover:text-foreground hover:border-dark-500 transition-all">
                <IconComponent iconName="Hi/HiOutlinePencil" size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-dark-700/60 border border-dark-600/40 flex items-center justify-center text-dark-400 hover:text-neon-red hover:border-neon-red/30 transition-all">
                <IconComponent iconName="Hi/HiOutlineTrash" size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-dark-400">
              {language({ id: "Pesanan", en: "Order" })} #F0030
            </span>
            <span className="text-xs text-dark-300">
              2 {language({ id: "Orang", en: "People" })}
            </span>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">
              {language({ id: "Item Dipesan", en: "Ordered Items" })}
            </h3>
            <span className="text-xs font-bold text-accent-400 bg-accent-500/10 px-2.5 py-1 rounded-full">
              {String(cart.reduce((s, c) => s + c.qty, 0)).padStart(2, "0")}
            </span>
          </div>

          <div className="space-y-3">
            {cart.map((cartItem) => (
              <div
                key={cartItem.menuItem.id}
                className="flex items-center justify-between py-2 border-b border-dark-600/20 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-accent-400 w-5">
                    {cartItem.qty}x
                  </span>
                  <span className="text-sm text-dark-200 font-medium">
                    {cartItem.menuItem.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  ${(cartItem.menuItem.price * cartItem.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="mt-6 pt-4 border-t border-dark-600/30">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {language({ id: "Ringkasan Pembayaran", en: "Payment Summary" })}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-dark-300">Subtotal</span>
                <span className="text-dark-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-300">
                  {language({ id: "Pajak", en: "Tax" })}
                </span>
                <span className="text-dark-200">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-300">
                  {language({ id: "Donasi", en: "Donation" })}
                </span>
                <span className="text-dark-200">${donation.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-dark-500/40">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">
                {language({ id: "Total Bayar", en: "Total Payable" })}
              </span>
              <span className="text-lg font-bold text-accent-400">
                ${totalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 pt-4 border-t border-dark-600/30">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {language({
                id: "Metode Pembayaran",
                en: "Payment Method",
              })}
            </h3>
            <div className="flex gap-2">
              {(
                [
                  { key: "cash" as PaymentMethod, label: { id: "Tunai", en: "Cash" }, icon: "Hi/HiOutlineCash" },
                  { key: "card" as PaymentMethod, label: { id: "Kartu", en: "Card" }, icon: "Hi/HiOutlineCreditCard" },
                  { key: "scan" as PaymentMethod, label: { id: "Scan", en: "Scan" }, icon: "Hi/HiOutlineQrcode" },
                ] as const
              ).map((method) => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                    paymentMethod === method.key
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-400"
                      : "bg-dark-800/40 border-dark-600/30 text-dark-300 hover:border-dark-500"
                  }`}
                >
                  <IconComponent iconName={method.icon} size={16} />
                  {language(method.label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-dark-600/40 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dark-600/40 bg-dark-800/60 text-dark-300 text-sm font-semibold hover:border-dark-500 hover:text-foreground transition-all">
            <IconComponent iconName="Hi/HiOutlinePrinter" size={16} />
            {language({ id: "Cetak", en: "Print" })}
          </button>
          <button className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 active:scale-[0.98]">
            <IconComponent iconName="Hi/HiOutlineClipboardCheck" size={16} />
            {language({ id: "Buat Pesanan", en: "Place Order" })}
          </button>
        </div>
      </div>
    </div>
  );
}
