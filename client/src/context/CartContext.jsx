import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProductImageUrl } from "../productImages";

const CartContext = createContext(null);
const CART_KEY = "homeai-cart";

function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(readCart);
    useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);

    const addItem = (product, quantity, options) => {
        const key = `${product.product_id}-${options.color}-${options.size}`;
        const image = getProductImageUrl(product.image);
        setItems((current) => {
            const existing = current.find((item) => item.key === key);
            if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item);
            return [...current, { key, productId: product.product_id, name: product.product_name, price: Number(product.price), image, quantity, ...options }];
        });
    };
    const updateQuantity = (key, quantity) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity } : item).filter((item) => item.quantity > 0));
    const removeItem = (key) => setItems((current) => current.filter((item) => item.key !== key));
    const value = useMemo(() => ({ items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), addItem, updateQuantity, removeItem }), [items]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
}
