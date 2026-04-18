export type BlogPost = {
  id: string;
  image: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags?: string[];
  content?: {
    intro?: string;
    sections?: { title: string; bullets: string[] }[];
    conclusion?: string;
  };
};

export type BlogCardProps = {
  post: BlogPost;
};

