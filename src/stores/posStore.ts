import { create } from "zustand";

export type OrderStatus = "all" | "wait_list" | "process" | "finish" | "cancel";
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
  sku?: string;
  color_name?: string;
  memory_name?: string;
}

export interface CatalogProductItem {
  id: number;
  sku: string;
  color_hex: string;
  color_name: string;
  memory_name: string;
  price: number;
  qty: number;
}

export interface CatalogRow {
  id: number;
  varian_name: string;
  brand_name: string;
  brand_logo: string;
  type_name: string;
  category_name: string;
  items: CatalogProductItem[];
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
  activeCategoryId: number;
  activeTypeId: number;
  activeBrandId: number;

  categories: any[];
  types: any[];
  brands: any[];
  catalogItems: CatalogRow[];

  setPanelOpen: (open: boolean) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setActiveOrderType: (type: OrderStatus) => void;
  setActiveCategoryId: (id: number) => void;
  setActiveTypeId: (id: number) => void;
  setActiveBrandId: (id: number) => void;
  setCatalogData: (data: {
    categories: any[];
    types: any[];
    brands: any[];
    rows: any[];
  }) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
}

export const usePosStore = create<PosState>((set) => ({
  cart: [],
  paymentMethod: "card",
  isPanelOpen: false,
  activeOrderType: "all",
  activeCategoryId: 0,
  activeTypeId: 0,
  activeBrandId: 0,

  categories: [],
  types: [],
  brands: [],
  catalogItems: [],

  setPanelOpen: (open) => set({ isPanelOpen: open }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setActiveOrderType: (type) => set({ activeOrderType: type }),
  setActiveCategoryId: (id) =>
    set({ activeCategoryId: id, activeTypeId: 0, activeBrandId: 0 }),
  setActiveTypeId: (id) => set({ activeTypeId: id, activeBrandId: 0 }),
  setActiveBrandId: (id) => set({ activeBrandId: id }),
  setCatalogData: (data) =>
    set({
      categories: data.categories || [],
      types: data.types || [],
      brands: data.brands || [],
      catalogItems: data.rows || [],
    }),

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
