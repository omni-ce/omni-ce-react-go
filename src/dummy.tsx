import type { MenuItem, OrderCard } from "@/stores/posStore";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const DAYS_30 = Array.from({ length: 30 }, (_, i) => String(i + 1));

export const dummyOrders: OrderCard[] = [
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

export const categories = [
  {
    key: "all",
    label: { id: "Semua Menu", en: "All Menu" },
    emoji: "🍽️",
    count: 154,
  },
  {
    key: "special",
    label: { id: "Spesial", en: "Special" },
    emoji: "⭐",
    count: 19,
  },
  {
    key: "soups",
    label: { id: "Sup", en: "Soups" },
    emoji: "🍜",
    count: 3,
  },
  {
    key: "desserts",
    label: { id: "Dessert", en: "Desserts" },
    emoji: "🍰",
    count: 19,
  },
  {
    key: "chickens",
    label: { id: "Ayam", en: "Chickens" },
    emoji: "🍗",
    count: 10,
  },
  {
    key: "rice",
    label: { id: "Nasi", en: "Rice" },
    emoji: "🍚",
    count: 12,
  },
  {
    key: "pasta",
    label: { id: "Pasta", en: "Pasta" },
    emoji: "🍝",
    count: 8,
  },
];

export const dummyMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Grilled Salmon Steak",
    category: "special",
    price: 150000.0,
    emoji: "🐟",
  },
  {
    id: 2,
    name: "Tofu Poke Bowl",
    category: "special",
    price: 75000.0,
    emoji: "🥗",
  },
  {
    id: 3,
    name: "Pasta with Roast Beef",
    category: "pasta",
    price: 105000.0,
    emoji: "🍝",
  },
  {
    id: 4,
    name: "Beef Steak",
    category: "special",
    price: 250000.0,
    emoji: "🥩",
  },
  {
    id: 5,
    name: "Shrimp Rice Bowl",
    category: "rice",
    price: 65000.0,
    emoji: "🍤",
  },
  {
    id: 6,
    name: "Apple Stuffed Pancake",
    category: "desserts",
    price: 45000.0,
    emoji: "🥞",
  },
  {
    id: 7,
    name: "Chicken Quinoa & Herbs",
    category: "chickens",
    price: 85000.0,
    emoji: "🍗",
  },
  {
    id: 8,
    name: "Vegetable Shrimp",
    category: "special",
    price: 95000.0,
    emoji: "🦐",
  },
  {
    id: 9,
    name: "Tom Yum Soup",
    category: "soups",
    price: 60000.0,
    emoji: "🍜",
  },
  {
    id: 10,
    name: "Miso Ramen",
    category: "soups",
    price: 75000.0,
    emoji: "🍜",
  },
  {
    id: 11,
    name: "Chocolate Lava Cake",
    category: "desserts",
    price: 55000.0,
    emoji: "🍫",
  },
  {
    id: 12,
    name: "Fried Chicken Wings",
    category: "chickens",
    price: 45000.0,
    emoji: "🍗",
  },
];
