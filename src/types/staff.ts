export interface Staff {
  id: number;
  attributes: {
    name: string;
    nip: string;
    slug: string;
    expertise?: string;
    position?: string;
    category: "akademik" | "administrasi";
    email?: string;
    education?: string;
    photo: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    sinta_url?: string;
    scopus_url?: string;
    google_scholar_url?: string;
  };
}
