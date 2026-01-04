import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkspaceTab {
  id: string;
  label: string;
  route: string;
  icon?: string;
  isDirty?: boolean;
}

interface SuperAdminTabsState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  activeSection: string | null;
  activeSubItem: string | null;
  primarySidebarOpen: boolean;
  secondarySidebarOpen: boolean;
  openTab: (tab: WorkspaceTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setActiveSection: (section: string | null) => void;
  setActiveSubItem: (subItem: string | null) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  closeTabsToRight: (tabId: string) => void;
  togglePrimarySidebar: () => void;
  toggleSecondarySidebar: () => void;
  toggleBothSidebars: () => void;
}

export const useSuperAdminTabs = create<SuperAdminTabsState>()(
  persist(
    (set, get) => ({
      tabs: [] as WorkspaceTab[],
      activeTabId: null,
      activeSection: 'voip',
      activeSubItem: null,
      primarySidebarOpen: true,
      secondarySidebarOpen: true,

      openTab: (tab: WorkspaceTab) => {
        const { tabs } = get();
        const existingTab = tabs.find((t: WorkspaceTab) => t.id === tab.id);
        
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
        const newTabs = tabs.filter((t: WorkspaceTab) => t.id !== tabId);
        
        let newActiveId = activeTabId;
        if (activeTabId === tabId) {
          const closedIndex = tabs.findIndex((t: WorkspaceTab) => t.id === tabId);
          if (newTabs.length > 0) {
            newActiveId = newTabs[Math.min(closedIndex, newTabs.length - 1)]?.id || null;
          } else {
            newActiveId = null;
          }
        }
        
        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (tabId: string) => {
        set({ activeTabId: tabId });
      },

      setActiveSection: (section: string | null) => {
        set({ activeSection: section });
      },

      setActiveSubItem: (subItem: string | null) => {
        set({ activeSubItem: subItem });
      },

      markTabDirty: (tabId: string, isDirty: boolean) => {
        const { tabs } = get();
        set({
          tabs: tabs.map((t: WorkspaceTab) => 
            t.id === tabId ? { ...t, isDirty } : t
          ),
        });
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null });
      },

      closeOtherTabs: (tabId: string) => {
        const { tabs } = get();
        const tabToKeep = tabs.find((t: WorkspaceTab) => t.id === tabId);
        set({
          tabs: tabToKeep ? [tabToKeep] : [],
          activeTabId: tabId,
        });
      },

      closeTabsToRight: (tabId: string) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex((t: WorkspaceTab) => t.id === tabId);
        
        if (tabIndex === -1) return;
        
        const newTabs = tabs.slice(0, tabIndex + 1);
        
        let newActiveId = activeTabId;
        if (activeTabId && !newTabs.find((t: WorkspaceTab) => t.id === activeTabId)) {
          newActiveId = tabId;
        }
        
        set({ tabs: newTabs, activeTabId: newActiveId });
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
        const bothOpen = primarySidebarOpen && secondarySidebarOpen;
        set({ 
          primarySidebarOpen: !bothOpen, 
          secondarySidebarOpen: !bothOpen 
        });
      },
    }),
    {
      name: 'didtron-admin-tabs',
      partialize: (state: SuperAdminTabsState) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        activeSection: state.activeSection,
      }),
    }
  )
);
