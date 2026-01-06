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
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  setActiveSection: (section: string) => void;
  setActiveSubItem: (subItem: string | null) => void;
  togglePrimarySidebar: () => void;
  toggleSecondarySidebar: () => void;
  toggleBothSidebars: () => void;
  openTab: (tab: WorkspaceTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  closeTabsToRight: (tabId: string) => void;
}

export const useCustomerPortalStore = create<CustomerPortalState>()(
  persist(
    (set, get) => ({
      activeSection: "dashboard",
      activeSubItem: null,
      primarySidebarOpen: true,
      secondarySidebarOpen: true,
      tabs: [],
      activeTabId: null,

      setActiveSection: (section: string) => {
        set({ 
          activeSection: section,
          secondarySidebarOpen: true,
        });
      },

      setActiveSubItem: (subItem: string | null) => {
        set({ activeSubItem: subItem });
      },

      togglePrimarySidebar: () => {
        const { primarySidebarOpen, secondarySidebarOpen } = get();
        if (primarySidebarOpen) {
          set({ primarySidebarOpen: false, secondarySidebarOpen: false });
        } else {
          set({ primarySidebarOpen: true, secondarySidebarOpen: true });
        }
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

      openTab: (tab: WorkspaceTab) => {
        const { tabs } = get();
        const existingTab = tabs.find((t) => t.id === tab.id);
        if (existingTab) {
          set({ activeTabId: tab.id });
        } else {
          set({
            tabs: [...tabs, tab],
            activeTabId: tab.id,
          });
        }
      },

      closeTab: (tabId: string) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex((t) => t.id === tabId);
        if (tabIndex === -1) return;

        const newTabs = tabs.filter((t) => t.id !== tabId);
        let newActiveId = activeTabId;

        if (activeTabId === tabId) {
          if (newTabs.length > 0) {
            const newIndex = Math.min(tabIndex, newTabs.length - 1);
            newActiveId = newTabs[newIndex].id;
          } else {
            newActiveId = null;
          }
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (tabId: string) => {
        set({ activeTabId: tabId });
      },

      markTabDirty: (tabId: string, isDirty: boolean) => {
        const { tabs } = get();
        set({
          tabs: tabs.map((t) =>
            t.id === tabId ? { ...t, isDirty } : t
          ),
        });
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null });
      },

      closeOtherTabs: (tabId: string) => {
        const { tabs } = get();
        const tabToKeep = tabs.find((t) => t.id === tabId);
        set({
          tabs: tabToKeep ? [tabToKeep] : [],
          activeTabId: tabId,
        });
      },

      closeTabsToRight: (tabId: string) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex((t) => t.id === tabId);
        if (tabIndex === -1) return;

        const newTabs = tabs.slice(0, tabIndex + 1);
        let newActiveId = activeTabId;

        if (activeTabId && !newTabs.find((t) => t.id === activeTabId)) {
          newActiveId = tabId;
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
      },
    }),
    {
      name: "didtron-customer-portal",
      partialize: (state: CustomerPortalState) => ({
        activeSection: state.activeSection,
        primarySidebarOpen: state.primarySidebarOpen,
        secondarySidebarOpen: state.secondarySidebarOpen,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);
