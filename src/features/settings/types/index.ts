/**
 * Settings Types
 */

export interface Settings {
  id: number;
  qrisFeePercent: number;
  platformCommissionPercent: number;
  defaultPaymentMethod: string;
  paymentTimeoutMinutes: number;
  cafeteriaName: string;
  cafeteriaTagline: string;
  heroTitle: string;
  heroDescription: string | null;
  logoUrl: string | null;
  footerText: string;
  kasirWhatsapp: string;
  contactInfo: string | null;
  namaPengurus: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralSettings {
  kasirWhatsapp: string;
  namaPengurus: string;
}

export interface LandingPageSettings {
  cafeteriaName: string;
  cafeteriaTagline: string;
  heroTitle: string;
  heroDescription: string;
  logoUrl: string | null;
  footerText: string;
  contactInfo: string | null;
}

export interface UpdateSettingsPayload {
  kasirWhatsapp?: string;
  namaPengurus?: string;
  cafeteriaName?: string;
  cafeteriaTagline?: string;
  heroTitle?: string;
  heroDescription?: string;
  logoUrl?: string | null;
  footerText?: string;
  contactInfo?: string | null;
}
