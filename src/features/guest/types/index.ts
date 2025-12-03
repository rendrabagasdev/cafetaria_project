export interface Item {
  id: number;
  namaBarang: string;
  fotoUrl: string;
  jumlahStok: number;
  hargaSatuan: number;
  _count?: {
    transactionDetails: number;
  };
}

export interface Settings {
  cafeteriaName: string;
  cafeteriaTagline: string;
  heroTitle: string;
  heroDescription: string;
  logoUrl: string | null;
  footerText: string;
  contactInfo: string | null;
}
