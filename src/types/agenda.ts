// src/types/agenda.ts
export interface Tag {
  id: number;
  attributes: {
    name: string;
    color?: string; // Opsional: jika ingin atur warna dari Strapi
  };
}

export interface Agenda {
  id: number;
  documentId?: string; // Strapi v5
  attributes: {
    title: string;
    slug: string;
    content?: string;
    startDate: string;
    endDate: string;
    location?: string;
    image?: {
      data?: {
        attributes?: {
          url: string;
        };
      } | null;
      url?: string; // Strapi v5 flat
    };
    tags: Tag[];
  };
}
