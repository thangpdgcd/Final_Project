export type Product = {
  id: string | number;
  name: string;
  name_en?: string;
  name_vi?: string;
  image: string;
  rating: number;
  priceUSD: number;
  discount?: number;
};

export type ViewMode = 'grid' | 'list';

