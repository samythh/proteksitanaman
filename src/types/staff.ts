export interface Staff {
  id: number;
  attributes: {
    name: string;
    nip: string;
    expertise?: string; // Untuk Dosen
    position?: string; // Untuk Tendik
    category: "akademik" | "administrasi";
    photo: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    // Social Links
    sinta_url?: string;
    scopus_url?: string;
    google_scholar_url?: string;
  };
}
