import { create } from "zustand";

export type OrderStatus = "all" | "wait_list" | "payment" | "finish" | "cancel";
export type PaymentMethod = "cash" | "card" | "scan";

export interface OrderCard {
  id: string;
  table: string;
  items: number;
  time: string;
  status: OrderStatus;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
}

export interface CartItem {
  menuItem: MenuItem;
  qty: number;
}

interface PosState {
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  isPanelOpen: boolean;
  activeOrderType: OrderStatus;
  activeCategory: string;

  setPanelOpen: (open: boolean) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setActiveOrderType: (type: OrderStatus) => void;
  setActiveCategory: (category: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
}

export const usePosStore = create<PosState>((set) => ({
  cart: [],
  paymentMethod: "card",
  isPanelOpen: false,
  activeOrderType: "all",
  activeCategory: "all",

  setPanelOpen: (open) => set({ isPanelOpen: open }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setActiveOrderType: (type) => set({ activeOrderType: type }),
  setActiveCategory: (category) => set({ activeCategory: category }),

  addToCart: (menuItem) =>
    set((state) => {
      const existing = state.cart.find((c) => c.menuItem.id === menuItem.id);
      let newCart;
      if (existing) {
        newCart = state.cart.map((c) =>
          c.menuItem.id === menuItem.id ? { ...c, qty: c.qty + 1 } : c,
        );
      } else {
        newCart = [...state.cart, { menuItem, qty: 1 }];
      }
      return { cart: newCart, isPanelOpen: true };
    }),

  removeFromCart: (itemId) =>
    set((state) => {
      const existing = state.cart.find((c) => c.menuItem.id === itemId);
      if (!existing) return state;

      let newCart;
      if (existing.qty <= 1) {
        newCart = state.cart.filter((c) => c.menuItem.id !== itemId);
      } else {
        newCart = state.cart.map((c) =>
          c.menuItem.id === itemId ? { ...c, qty: c.qty - 1 } : c,
        );
      }

      // Automatically close panel if cart becomes empty
      const isPanelOpen = newCart.length > 0 ? state.isPanelOpen : false;
      return { cart: newCart, isPanelOpen };
    }),

  clearCart: () => set({ cart: [], isPanelOpen: false }),
}));
