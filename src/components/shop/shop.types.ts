export type Product = {
  id: string | number;
  name: string;
  image: string;
  rating: number;
  priceUSD: number;
  discount?: number;
};

export type ViewMode = 'grid' | 'list';

