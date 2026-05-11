import { useMemo, useRef, useState, type RefObject } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import satellite from "@/lib/satellite";
import { IconComponent } from "@/components/ui/IconSelector";
import {
  usePosStore,
  type OrderStatus,
  type PaymentMethod,
  type MenuItem,
} from "@/stores/posStore";
import { cn } from "@/lib/utils";
import { categories, dummyMenuItems, dummyOrders } from "@/dummy";

// ─── Helper ──────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusConfig: Partial<
  Record<
    OrderStatus,
    { label: { id: string; en: string }; color: string; bg: string }
  >
> = {
  wait_list: {
    label: { id: "Menunggu", en: "Wait List" },
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10 border-neon-yellow/30",
  },
  process: {
    label: { id: "Proses", en: "Process" },
    color: "text-neon-cyan",
    bg: "bg-card-ice border-neon-cyan/30",
  },
  finish: {
    label: { id: "Selesai", en: "Finish" },
    color: "text-dark-400",
    bg: "bg-dark-800 border-dark-600/30",
  },
  cancel: {
    label: { id: "Dibatalkan", en: "Cancelled" },
    color: "text-red-400",
    bg: "bg-red-900/10 border-red-500/30",
  },
};

const orderTypeConfig: {
  key: OrderStatus;
  label: { id: string; en: string };
}[] = [
  { key: "all", label: { id: "Semua", en: "All" } },
  { key: "wait_list", label: { id: "Menunggu", en: "Wait List" } },
  { key: "process", label: { id: "Proses", en: "Process" } },
  { key: "finish", label: { id: "Selesai", en: "Finish" } },
  { key: "cancel", label: { id: "Batal", en: "Cancel" } },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  ruleKey?: string;
}
export default function PosPage({ ruleKey }: Props) {
  const { language } = useLanguageStore();

  const {
    cart,
    paymentMethod,
    isPanelOpen,
    activeOrderType,
    activeCategory,
    setPanelOpen,
    setPaymentMethod,
    setActiveOrderType,
    setActiveCategory,
    addToCart,
    removeFromCart,
  } = usePosStore();

  const [searchQuery, setSearchQuery] = useState("");

  const orderScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const counts = useMemo(
    () => ({
      all: dummyOrders.length,
      wait_list: dummyOrders.filter((o) => o.status === "wait_list").length,
      process: dummyOrders.filter((o) => o.status === "process").length,
      finish: dummyOrders.filter((o) => o.status === "finish").length,
      cancel: dummyOrders.filter((o) => o.status === "cancel").length,
    }),
    [],
  );

  const filteredOrders = useMemo(() => {
    if (activeOrderType === "all") return dummyOrders;
    return dummyOrders.filter((o) => o.status === activeOrderType);
  }, [activeOrderType]);

  const filteredMenu = useMemo(() => {
    return dummyMenuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const getCartQty = (menuItemId: number) => {
    const item = cart.find((c) => c.menuItem.id === menuItemId);
    return item ? item.qty : 0;
  };

  const subtotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.qty, 0);
  const tax = subtotal * 0.11; // 11% PPN
  const donation = 1000.0;
  const totalPayable = subtotal + tax + donation;

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)] overflow-hidden -m-6">
      {/* ─── Left: Main Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Order Line Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {language({ id: "Antrian Pesanan", en: "Order Line" })}
            </h1>
          </div>

          {/* Order Type Tabs */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {orderTypeConfig.map((type) => (
              <button
                key={type.key}
                onClick={() => setActiveOrderType(type.key)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${
                  activeOrderType === type.key
                    ? "bg-badge-light-blue border-accent-500/40 text-accent-500"
                    : "bg-dark-900 border-dark-600 text-dark-400 hover:border-dark-500 hover:text-foreground"
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
                  {counts[type.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards */}
        <div
          ref={orderScrollRef}
          className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar-h"
        >
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as OrderStatus];
            if (!status) return null;
            return (
              <div
                key={order.id}
                className={`min-w-55 p-4 rounded-2xl border ${status.bg} flex flex-col gap-3 shrink-0 transition-all hover:scale-[1.02] hover:rounded-none cursor-pointer`}
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
                  {language({ id: "Item", en: "Item" })}:{" "}
                  <span className="font-bold text-foreground">
                    {order.items}X
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-dark-400">
                    {order.time}
                  </span>
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
          <div className="min-w-12 flex items-center justify-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-dark-800 border border-dark-600/40 flex items-center justify-center text-dark-400 hover:text-dark-200 hover:border-dark-500 transition-all cursor-pointer">
              <IconComponent iconName="Hi/HiOutlineChevronRight" size={18} />
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {language({ id: "Katalog Produk", en: "Product Catalog" })}
              </h2>
              <button
                onClick={() =>
                  satellite.get("/api/product/catalog/infinite-scroll")
                }
                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-foreground transition-all"
                title="Refresh Catalog (Debug)"
              >
                <IconComponent iconName="Hi/HiOutlineRefresh" size={16} />
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  scroll(orderScrollRef as RefObject<HTMLDivElement>, "left")
                }
                className="w-8 h-8 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center text-dark-400 hover:text-foreground hover:border-dark-500 transition-all"
              >
                <IconComponent iconName="Hi/HiOutlineChevronLeft" size={14} />
              </button>
              <button
                onClick={() =>
                  scroll(orderScrollRef as RefObject<HTMLDivElement>, "right")
                }
                className="w-8 h-8 rounded-full bg-dark-800 border border-dark-600/40 flex items-center justify-center text-dark-400 hover:text-dark-200 hover:border-dark-500 transition-all"
              >
                <IconComponent iconName="Hi/HiOutlineChevronRight" size={14} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 group-focus-within:text-accent-500 transition-colors">
              <IconComponent iconName="Hi/HiOutlineSearch" size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language({
                id: "Cari produk...",
                en: "Search products...",
              })}
              className="w-full pl-12 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-2xl text-sm focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all placeholder:text-dark-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-foreground transition-colors"
              >
                <IconComponent iconName="Hi/HiOutlineXCircle" size={18} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide"
          >
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-semibold shrink-0 transition-all duration-200 ${
                  activeCategory === cat.key
                    ? "bg-badge-light-blue border-accent-500/40 text-accent-500 shadow-lg shadow-accent-500/10"
                    : "bg-dark-900 border-dark-600 text-dark-400 hover:border-dark-500 hover:text-foreground"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
          {filteredMenu.map((item) => {
            const qty = getCartQty(item.id);
            const isInCart = qty > 0;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-3 transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                  isInCart
                    ? "bg-badge-light-blue/50 border-accent-500/30 shadow-md shadow-accent-500/5"
                    : "bg-dark-900 border-dark-600 hover:border-dark-500"
                }`}
              >
                {/* Emoji as Product Image */}
                <div className="w-full aspect-square rounded-lg bg-dark-800 flex items-center justify-center mb-2 group-hover:scale-[1.02] transition-transform">
                  <span className="text-3xl">{item.emoji}</span>
                </div>

                {/* Category Tag */}
                <span className="text-[10px] font-medium text-dark-400 uppercase tracking-wider">
                  {item.category}
                </span>

                {/* Name */}
                <h3 className="text-[13px] font-bold text-foreground mt-0.5 leading-tight line-clamp-1">
                  {item.name}
                </h3>

                {/* Price + Controls */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-bold text-accent-500">
                    {formatRupiah(item.price)}
                  </span>
                  <div className="flex items-center justify-between bg-dark-800 rounded-xl p-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="w-11 h-11 rounded-lg bg-dark-700 text-dark-400 flex items-center justify-center hover:bg-dark-600 hover:text-foreground transition-all text-xl font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-foreground min-w-6 text-center">
                      {qty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="w-11 h-11 rounded-lg bg-accent-500 text-white flex items-center justify-center hover:bg-accent-600 transition-all text-xl font-bold shadow-md shadow-accent-500/30"
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

      {/* ─── Right: Order Panel (Slider) ───────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 bg-dark-900 border-l border-dark-600/40 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
          isPanelOpen ? "w-85 opacity-100" : "w-0 opacity-0 border-l-0",
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-dark-600/30 min-w-85">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-foreground transition-all"
              >
                <IconComponent iconName="Hi/HiOutlineX" size={16} />
              </button>
              <h2 className="text-base font-bold text-foreground">
                {language({ id: "Meja No", en: "Table No" })} #04
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-600 flex items-center justify-center text-dark-400 hover:text-foreground hover:border-dark-500 transition-all">
                <IconComponent iconName="Hi/HiOutlinePencil" size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-600 flex items-center justify-center text-dark-400 hover:text-neon-red hover:border-neon-red/30 transition-all">
                <IconComponent iconName="Hi/HiOutlineTrash" size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pl-9">
            <span className="text-xs text-dark-400">
              {language({ id: "Pesanan", en: "Order" })} #F0030
            </span>
            <span className="text-xs text-dark-300">
              2 {language({ id: "Orang", en: "People" })}
            </span>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="flex-1 overflow-y-auto p-5 min-w-85">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">
              {language({ id: "Item Dipesan", en: "Ordered Items" })}
            </h3>
            <span className="text-xs font-bold text-accent-500 bg-accent-500/10 px-2.5 py-1 rounded-full">
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
                  <span className="text-xs font-bold text-accent-500 w-5">
                    {cartItem.qty}x
                  </span>
                  <span className="text-sm text-dark-200 font-medium">
                    {cartItem.menuItem.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {formatRupiah(cartItem.menuItem.price * cartItem.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="mt-6 pt-4 border-t border-dark-600/20">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {language({ id: "Ringkasan Pembayaran", en: "Payment Summary" })}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-dark-300">Subtotal</span>
                <span className="text-dark-200">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-300">
                  {language({ id: "Pajak", en: "Tax" })}
                </span>
                <span className="text-dark-200">{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-300">
                  {language({ id: "Donasi", en: "Donation" })}
                </span>
                <span className="text-dark-200">{formatRupiah(donation)}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-dark-600/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">
                {language({ id: "Total Bayar", en: "Total Payable" })}
              </span>
              <span className="text-lg font-bold text-accent-500">
                {formatRupiah(totalPayable)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 pt-4 border-t border-dark-600/20">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {language({
                id: "Metode Pembayaran",
                en: "Payment Method",
              })}
            </h3>
            <div className="flex gap-2">
              {(
                [
                  {
                    key: "cash" as PaymentMethod,
                    label: { id: "Tunai", en: "Cash" },
                    icon: "Hi/HiOutlineCash",
                  },
                  {
                    key: "card" as PaymentMethod,
                    label: { id: "Kartu", en: "Card" },
                    icon: "Hi/HiOutlineCreditCard",
                  },
                  {
                    key: "scan" as PaymentMethod,
                    label: { id: "Scan", en: "Scan" },
                    icon: "Hi/HiOutlineQrcode",
                  },
                ] as const
              ).map((method) => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200",
                    paymentMethod === method.key
                      ? "bg-badge-light-blue border-accent-500/40 text-accent-500"
                      : "bg-dark-900 border-dark-600 text-dark-400 hover:border-dark-500",
                  )}
                >
                  <IconComponent iconName={method.icon} size={16} />
                  {language(method.label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-dark-600/30 flex gap-3 min-w-85">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-dark-600 bg-dark-900 text-dark-400 text-sm font-semibold hover:border-dark-500 hover:text-foreground transition-all">
            <IconComponent iconName="Hi/HiOutlinePrinter" size={16} />
            {language({ id: "Cetak", en: "Print" })}
          </button>
          <button className="flex-2 flex items-center justify-center gap-2 py-3 rounded-full bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 active:scale-[0.98]">
            <IconComponent iconName="Hi/HiOutlineClipboardCheck" size={16} />
            {language({ id: "Buat Pesanan", en: "Place Order" })}
          </button>
        </div>
      </div>
    </div>
  );
}
