import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkspaceTab {
  id: string;
  label: string;
  route: string;
  isDirty?: boolean;
}

interface CustomerPortalState {
  activeSection: string;
  activeSubItem: string | null;
  primarySidebarOpen: boolean;
  secondarySidebarOpen: boolean;
  setActiveSection: (section: string) => void;
  setActiveSubItem: (subItem: string | null) => void;
  togglePrimarySidebar: () => void;
  toggleSecondarySidebar: () => void;
  toggleBothSidebars: () => void;
}

export const useCustomerPortalStore = create<CustomerPortalState>()(
  persist(
    (set, get) => ({
      activeSection: "dashboard",
      activeSubItem: null,
      primarySidebarOpen: true,
      secondarySidebarOpen: true,

      setActiveSection: (section: string) => {
        set({ activeSection: section });
      },

      setActiveSubItem: (subItem: string | null) => {
        set({ activeSubItem: subItem });
      },

      togglePrimarySidebar: () => {
        const { primarySidebarOpen } = get();
        set({ primarySidebarOpen: !primarySidebarOpen });
      },

      toggleSecondarySidebar: () => {
        const { secondarySidebarOpen } = get();
        set({ secondarySidebarOpen: !secondarySidebarOpen });
      },

      toggleBothSidebars: () => {
        const { primarySidebarOpen, secondarySidebarOpen } = get();
        if (primarySidebarOpen || secondarySidebarOpen) {
          set({ primarySidebarOpen: false, secondarySidebarOpen: false });
        } else {
          set({ primarySidebarOpen: true, secondarySidebarOpen: true });
        }
      },
    }),
    {
      name: "didtron-customer-portal",
      partialize: (state: CustomerPortalState) => ({
        activeSection: state.activeSection,
        primarySidebarOpen: state.primarySidebarOpen,
        secondarySidebarOpen: state.secondarySidebarOpen,
      }),
    }
  )
);
