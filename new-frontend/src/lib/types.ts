import type { Tables } from "./database.types";

/** Recenze zobrazená na webu (z tabulky external_reviews). */
export interface Review {
  id: string | number;
  name: string | null;
  text: string | null;
  rating: number | null;
  source: string;
}

export type Service = Tables<"services">;
export type ProcessStep = Tables<"how_it_works_steps">;
export type Article = Tables<"articles">;
export type FaqItem = Pick<Tables<"faqs">, "id" | "question" | "answer">;

/** Realizace včetně fotek (select „*, realization_photos(*)“). */
export type Realization = Tables<"realizations"> & {
  realization_photos?: Tables<"realization_photos">[];
};

/** Položka galerie na úvodní stránce: video, samostatná fotka nebo album. */
export interface GalleryEntry {
  id: string;
  type: "youtube" | "image" | "album";
  youtube_id?: string | null;
  url: string;
  title: string;
  caption: string | null;
  order_index: number;
  photos: { url: string; caption: string }[];
  count: number;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}
