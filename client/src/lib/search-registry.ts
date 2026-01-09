import { sectionConfigs, type NavSubItem, type SectionConfig } from "@/components/layout/super-admin/secondary-sidebar";

export interface SearchItem {
  id: string;
  label: string;
  section: string;
  sectionLabel: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  type: "page" | "data";
}

export interface DataSearchResult {
  id: string;
  label: string;
  type: string;
  path: string;
  description?: string;
}

function generateKeywords(label: string, sectionLabel: string): string[] {
  const words = label.toLowerCase().split(/\s+/);
  const sectionWords = sectionLabel.toLowerCase().split(/\s+/);
  return Array.from(new Set([...words, ...sectionWords]));
}

export function getPageSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];
  
  for (const [sectionId, config] of Object.entries(sectionConfigs)) {
    for (const item of config.items) {
      items.push({
        id: `${sectionId}-${item.id}`,
        label: item.label,
        section: sectionId,
        sectionLabel: config.title,
        path: item.route,
        icon: item.icon,
        keywords: generateKeywords(item.label, config.title),
        type: "page",
      });
    }
  }
  
  return items;
}

export function filterSearchItems(items: SearchItem[], searchTerm: string): SearchItem[] {
  if (!searchTerm.trim()) return [];
  
  const term = searchTerm.toLowerCase().trim();
  
  return items.filter((item) => {
    const searchableText = [
      item.label.toLowerCase(),
      item.sectionLabel.toLowerCase(),
      ...item.keywords.map(k => k.toLowerCase()),
    ].join(" ");
    return searchableText.includes(term);
  });
}

export const allPageSearchItems = getPageSearchItems();
