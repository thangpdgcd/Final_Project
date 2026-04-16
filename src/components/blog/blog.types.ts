export type BlogPost = {
  id: string | number;
  image: string;
  title: string;
  author: string;
  date: string | number | Date;
  excerpt: string;
};

export type BlogCardProps = {
  post: BlogPost;
};

