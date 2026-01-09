import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BrandingSettings {
  headerLogo: string | null;
  desktopLogo: string | null;
  desktopLogoDark: string | null;
  mobileLogo: string | null;
  mobileLogoDark: string | null;
  appTitle: string;
  applicationName: string;
  slogan: string;
  baseColor: string;
}

interface BrandingStore extends BrandingSettings {
  setHeaderLogo: (logo: string | null) => void;
  setDesktopLogo: (logo: string | null) => void;
  setDesktopLogoDark: (logo: string | null) => void;
  setMobileLogo: (logo: string | null) => void;
  setMobileLogoDark: (logo: string | null) => void;
  setAppTitle: (title: string) => void;
  setApplicationName: (name: string) => void;
  setSlogan: (slogan: string) => void;
  setBaseColor: (color: string) => void;
  resetToDefaults: () => void;
}

const defaultSettings: BrandingSettings = {
  headerLogo: null,
  desktopLogo: null,
  desktopLogoDark: null,
  mobileLogo: null,
  mobileLogoDark: null,
  appTitle: "DIDTron",
  applicationName: "DIDTron Communications",
  slogan: "AI-Powered Wholesale VoIP Platform",
  baseColor: "#2563EB",
};

export const useBrandingStore = create<BrandingStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setHeaderLogo: (logo) => set({ headerLogo: logo }),
      setDesktopLogo: (logo) => set({ desktopLogo: logo }),
      setDesktopLogoDark: (logo) => set({ desktopLogoDark: logo }),
      setMobileLogo: (logo) => set({ mobileLogo: logo }),
      setMobileLogoDark: (logo) => set({ mobileLogoDark: logo }),
      setAppTitle: (title) => set({ appTitle: title }),
      setApplicationName: (name) => set({ applicationName: name }),
      setSlogan: (slogan) => set({ slogan: slogan }),
      setBaseColor: (color) => set({ baseColor: color }),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: "didtron-branding",
    }
  )
);
