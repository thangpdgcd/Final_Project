import { useState, useEffect } from 'react';
import { App } from 'antd';
import type { Product } from '@/types';

export const useWishlist = () => {
  const { message } = App.useApp();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('coffephan_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to parse wishlist', err);
    }
  }, []);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.product_ID === product.product_ID)) {
        message.info('Sản phẩm đã có trong danh sách yêu thích!');
        return prev;
      }
      const updated = [...prev, product];
      localStorage.setItem('coffephan_wishlist', JSON.stringify(updated));
      message.success('Đã thêm vào danh sách yêu thích!');
      return updated;
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist((prev) => {
      const updated = prev.filter((p) => p.product_ID !== productId);
      localStorage.setItem('coffephan_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some((p) => p.product_ID === productId);
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
};
