import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Ajouter / incrémenter
      addItem: (product, variant = null, quantity = 1) => {
        const items = get().items;
        const key = variant ? `${product.id}-${variant.id}` : product.id;
        const existing = items.find((i) => i.key === key);

        const price = variant?.price_override ?? product.price;

        if (existing) {
          set({ items: items.map((i) => i.key === key ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({
            items: [...items, {
              key,
              product_id: product.id,
              variant_id: variant?.id || null,
              name: product.name,
              variant_label: variant?.label || null,
              image_url: product.image_url,
              price,
              quantity,
              weight_grams: product.weight_grams || 250,
            }],
          });
        }
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) return get().removeItem(key);
        set({ items: get().items.map((i) => i.key === key ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [] }),

      // Calculés
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'fastyle-cart' }
  )
);
