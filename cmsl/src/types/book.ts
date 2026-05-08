export interface Book {
  isbn: number;
  count: number;
  title: string;
  authors: string[];
  publish_date: string;
  cover: string | null;
  description: string;
}
