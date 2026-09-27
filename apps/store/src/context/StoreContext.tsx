"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, WishlistItem, StoreProduct, ProductDetail } from "../types/store";

interface StoreContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  cartSubtotalPaise: number;
  formattedSubtotal: string;
  isHydrated: boolean;
  addToCart: (
    product: StoreProduct | ProductDetail,
    licenseType?: "STANDARD" | "EXTENDED"
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartLicense: (cartItemId: string, licenseType: "STANDARD" | "EXTENDED") => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  addToWishlist: (product: StoreProduct | ProductDetail) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: StoreProduct | ProductDetail) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (item: WishlistItem, licenseType?: "STANDARD" | "EXTENDED") => void;
  moveAllToCart: () => void;
  clearWishlist: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const CART_STORAGE_KEY = "kodedock_store_cart_v1";
const WISHLIST_STORAGE_KEY = "kodedock_store_wishlist_v1";

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (e) {
      console.error("Failed to load store state from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart to localStorage:", e);
    }
  }, [cart, isHydrated]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to persist wishlist to localStorage:", e);
    }
  }, [wishlist, isHydrated]);

  const addToCart = (
    product: StoreProduct | ProductDetail,
    licenseType: "STANDARD" | "EXTENDED" = "STANDARD"
  ) => {
    setCart((prev) => {
      // Check if product already in cart with same license
      const existing = prev.find(
        (item) => item.productId === product.id && item.license_type === licenseType
      );
      if (existing) return prev; // already in cart

      const isExtended = licenseType === "EXTENDED";
      const extendedPaise = product.extended_price ?? null;
      const unitPrice = isExtended && extendedPaise ? extendedPaise : product.standard_price;
      const formattedPrice = `₹${(unitPrice / 100).toLocaleString("en-IN")}`;

      const newItem: CartItem = {
        id: `cart_${product.id}_${licenseType.toLowerCase()}_${Date.now()}`,
        productId: product.id,
        slug: product.slug,
        title: product.title,
        tagline: product.tagline,
        category: product.category,
        thumbnail_url: product.thumbnail_url || "/kd.svg",
        license_type: licenseType,
        unit_price: unitPrice,
        formatted_price: formattedPrice,
        standard_price: product.standard_price,
        extended_price: product.extended_price ?? null,
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartLicense = (
    cartItemId: string,
    newLicense: "STANDARD" | "EXTENDED"
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item;

        const isExtended = newLicense === "EXTENDED";
        const unitPrice =
          isExtended && item.extended_price ? item.extended_price : item.standard_price;
        const formattedPrice = `₹${(unitPrice / 100).toLocaleString("en-IN")}`;

        return {
          ...item,
          license_type: newLicense,
          unit_price: unitPrice,
          formatted_price: formattedPrice,
        };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.productId === productId);
  };

  const addToWishlist = (product: StoreProduct | ProductDetail) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.productId === product.id)) return prev;

      const newItem: WishlistItem = {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        tagline: product.tagline,
        category: product.category,
        thumbnail_url: product.thumbnail_url || "/kd.svg",
        standard_price: product.standard_price,
        formatted_price:
          product.formatted_price ||
          `₹${(product.standard_price / 100).toLocaleString("en-IN")}`,
        tech_stack: Array.isArray(product.tech_stack) ? product.tech_stack : [],
        added_at: new Date().toISOString(),
      };

      return [newItem, ...prev];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
  };

  const toggleWishlist = (product: StoreProduct | ProductDetail) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const moveToCart = (
    item: WishlistItem,
    licenseType: "STANDARD" | "EXTENDED" = "STANDARD"
  ) => {
    const fakeProduct: StoreProduct = {
      id: item.productId,
      seller_id: "",
      seller_name: "",
      title: item.title,
      slug: item.slug,
      tagline: item.tagline,
      category: item.category,
      tech_stack: item.tech_stack,
      thumbnail_url: item.thumbnail_url,
      status: "PUBLISHED",
      standard_price: item.standard_price,
      formatted_price: item.formatted_price,
      total_sales: 0,
      avg_rating: "5.0",
      created_at: item.added_at,
    };

    addToCart(fakeProduct, licenseType);
    removeFromWishlist(item.productId);
  };

  const moveAllToCart = () => {
    wishlist.forEach((item) => {
      moveToCart(item, "STANDARD");
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const cartSubtotalPaise = cart.reduce((acc, item) => acc + item.unit_price, 0);
  const formattedSubtotal = `₹${(cartSubtotalPaise / 100).toLocaleString("en-IN")}`;

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount: cart.length,
        wishlistCount: wishlist.length,
        cartSubtotalPaise,
        formattedSubtotal,
        isHydrated,
        addToCart,
        removeFromCart,
        updateCartLicense,
        clearCart,
        isInCart,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        moveAllToCart,
        clearWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
