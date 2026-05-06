export type BlogSection = {
  title: string;
  bullets: string[];
};

export type BlogContent = {
  intro?: string;
  sections?: BlogSection[];
  conclusion?: string;
};

export type BlogPost = {
  id: string;
  image: string;
  title: string;
  /** Optional Vietnamese localized fields (fallback to default fields when missing). */
  title_vi?: string;
  author: string;
  date: string;
  excerpt: string;
  /** Optional Vietnamese localized fields (fallback to default fields when missing). */
  excerpt_vi?: string;
  tags?: string[];
  content?: BlogContent;
  /** Optional Vietnamese localized fields (fallback to default fields when missing). */
  content_vi?: BlogContent;
};

export type BlogCardProps = {
  post: BlogPost;
};

