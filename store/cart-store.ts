import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.id === item.id &&
              i.size === item.size &&
              i.color === item.color
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id &&
                i.size === item.size &&
                i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (id, size, color) =>
        set((state) => {
          return {
            items: state.items
              .map((item) => {
                // Verificar que coincidan id, size y color (considerando undefined)
                const matchesId = item.id === id;
                const matchesSize = item.size === size;
                const matchesColor = item.color === color;
                
                if (matchesId && matchesSize && matchesColor) {
                  return { ...item, quantity: item.quantity - 1 };
                }
                return item;
              })
              .filter((item) => item.quantity > 0),
          };
        }),
        
      clearCart: () =>
        set(() => {
          return { items: [] };
        }),
    }),
    { name: "cart" }
  )
);