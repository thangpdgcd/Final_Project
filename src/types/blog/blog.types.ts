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
  author: string;
  date: string;
  excerpt: string;
  tags?: string[];
  content?: BlogContent;
};

export type BlogCardProps = {
  post: BlogPost;
};

