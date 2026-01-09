import * as fs from 'fs';
import * as path from 'path';

export interface ComponentScanResult {
  id: string;
  name: string;
  category: string;
  status: "adopted" | "migrate" | "deprecated";
  usedIn: number;
  files: string[];
  darkModeReady: boolean;
  accessible: boolean;
}

export interface DesignTokenResult {
  name: string;
  lightValue: string;
  darkValue: string;
  category: string;
}

export interface ScanResults {
  components: ComponentScanResult[];
  tokens: DesignTokenResult[];
  healthScore: number;
  adoptedCount: number;
  totalCount: number;
  migrateCount: number;
  deprecatedCount: number;
  scannedAt: string;
  filesScanned: number;
  totalUsages: number;
}

const SHADCN_COMPONENTS = [
  'Button', 'Card', 'Badge', 'Dialog', 'Input', 'Select', 'Table', 'Tabs',
  'Toast', 'Tooltip', 'Popover', 'Dropdown', 'Avatar', 'Checkbox', 'Switch',
  'Separator', 'Label', 'Progress', 'Skeleton', 'ScrollArea', 'Accordion',
  'Alert', 'AlertDialog', 'Collapsible', 'Command', 'ContextMenu', 'HoverCard',
  'Menubar', 'NavigationMenu', 'RadioGroup', 'Slider', 'Textarea', 'Toggle',
  'Sheet', 'Sidebar', 'Form', 'Calendar', 'DatePicker'
];

const CUSTOM_PATTERNS = [
  { pattern: /DataTableFooter/g, name: 'DataTableFooter', category: 'Patterns' },
  { pattern: /ThemeToggle/g, name: 'ThemeToggle', category: 'Patterns' },
  { pattern: /GlobalHeader/g, name: 'GlobalHeader', category: 'Layouts' },
  { pattern: /WorkspaceTabs/g, name: 'WorkspaceTabs', category: 'Layouts' },
];

const DEPRECATED_PATTERNS = [
  { pattern: /className="[^"]*bg-\w+-\d{3}/g, name: 'Hardcoded Colors', category: 'Legacy' },
  { pattern: /className="[^"]*text-\w+-\d{3}/g, name: 'Hardcoded Text Colors', category: 'Legacy' },
];

// Components that should be migrated to shadcn equivalents
const MIGRATE_COMPONENTS: Record<string, string> = {
  'CustomTable': 'Table',
  'OldModal': 'Dialog',
  'LegacyButton': 'Button',
  'LegacyInput': 'Input',
};

export async function scanCodebase(): Promise<ScanResults> {
  const clientSrcPath = path.join(process.cwd(), 'client', 'src');
  const componentsPath = path.join(clientSrcPath, 'components');
  const pagesPath = path.join(clientSrcPath, 'pages');
  
  const componentUsage: Map<string, { count: number; files: Set<string> }> = new Map();
  let filesScanned = 0;
  
  // Initialize shadcn components
  for (const comp of SHADCN_COMPONENTS) {
    componentUsage.set(comp, { count: 0, files: new Set() });
  }
  
  // Initialize custom components
  for (const custom of CUSTOM_PATTERNS) {
    componentUsage.set(custom.name, { count: 0, files: new Set() });
  }

  // Scan all tsx files
  const allFiles = await getAllTsxFiles(clientSrcPath);
  
  for (const file of allFiles) {
    filesScanned++;
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(clientSrcPath, file);
    
    // Check shadcn component imports and usage
    for (const comp of SHADCN_COMPONENTS) {
      const importPattern = new RegExp(`import.*{[^}]*\\b${comp}\\b[^}]*}.*from`, 'g');
      const usagePattern = new RegExp(`<${comp}[\\s/>]`, 'g');
      
      const importMatches = content.match(importPattern);
      const usageMatches = content.match(usagePattern);
      
      if (usageMatches) {
        const usage = componentUsage.get(comp)!;
        usage.count += usageMatches.length;
        usage.files.add(relativePath);
      }
    }
    
    // Check custom patterns
    for (const custom of CUSTOM_PATTERNS) {
      const matches = content.match(custom.pattern);
      if (matches) {
        const usage = componentUsage.get(custom.name)!;
        usage.count += matches.length;
        usage.files.add(relativePath);
      }
    }
  }

  // Build component results
  const components: ComponentScanResult[] = [];
  let id = 1;
  
  const usageEntries = Array.from(componentUsage.entries());
  for (const [name, usage] of usageEntries) {
    if (usage.count > 0) {
      const category = CUSTOM_PATTERNS.find(p => p.name === name)?.category || 
                       (SHADCN_COMPONENTS.includes(name) ? 'Primitives' : 'Custom');
      
      // Determine component status
      let status: 'adopted' | 'migrate' | 'deprecated' = 'adopted';
      if (MIGRATE_COMPONENTS[name]) {
        status = 'migrate';
      }
      
      components.push({
        id: String(id++),
        name,
        category,
        status,
        usedIn: usage.files.size,
        files: Array.from(usage.files),
        darkModeReady: SHADCN_COMPONENTS.includes(name),
        accessible: SHADCN_COMPONENTS.includes(name),
      });
    }
  }
  
  // Check for deprecated patterns (hardcoded colors)
  let deprecatedUsageCount = 0;
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const deprecated of DEPRECATED_PATTERNS) {
      const matches = content.match(deprecated.pattern);
      if (matches) {
        deprecatedUsageCount += matches.length;
      }
    }
  }
  
  if (deprecatedUsageCount > 0) {
    components.push({
      id: String(id++),
      name: 'Hardcoded Colors',
      category: 'Legacy',
      status: 'deprecated',
      usedIn: deprecatedUsageCount,
      files: [],
      darkModeReady: false,
      accessible: true,
    });
  }

  // Sort by usage count descending
  components.sort((a, b) => b.usedIn - a.usedIn);

  // Scan design tokens from index.css
  const tokens = await scanDesignTokens();

  // Calculate metrics
  const adoptedCount = components.filter(c => c.status === 'adopted').length;
  const migrateCount = components.filter(c => c.status === 'migrate').length;
  const deprecatedCount = components.filter(c => c.status === 'deprecated').length;
  const totalCount = components.length;
  const healthScore = totalCount > 0 ? Math.round((adoptedCount / totalCount) * 100) : 0;
  const totalUsages = components.reduce((sum, c) => sum + c.usedIn, 0);

  return {
    components,
    tokens,
    healthScore,
    adoptedCount,
    totalCount,
    migrateCount,
    deprecatedCount,
    scannedAt: new Date().toISOString(),
    filesScanned,
    totalUsages,
  };
}

async function getAllTsxFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await getAllTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function scanDesignTokens(): Promise<DesignTokenResult[]> {
  const cssPath = path.join(process.cwd(), 'client', 'src', 'index.css');
  const tokens: DesignTokenResult[] = [];
  
  if (!fs.existsSync(cssPath)) {
    return tokens;
  }
  
  const content = fs.readFileSync(cssPath, 'utf-8');
  
  // Parse :root section for light mode (using [\s\S] for multiline compatibility)
  const rootMatch = content.match(/:root\s*\{([\s\S]*?)\}/);
  const darkMatch = content.match(/\.dark\s*\{([\s\S]*?)\}/);
  
  const lightTokens: Map<string, string> = new Map();
  const darkTokens: Map<string, string> = new Map();
  
  if (rootMatch) {
    const lines = rootMatch[1].split('\n');
    for (const line of lines) {
      const tokenMatch = line.match(/--([^:]+):\s*([^;]+);/);
      if (tokenMatch) {
        lightTokens.set(`--${tokenMatch[1].trim()}`, tokenMatch[2].trim());
      }
    }
  }
  
  if (darkMatch) {
    const lines = darkMatch[1].split('\n');
    for (const line of lines) {
      const tokenMatch = line.match(/--([^:]+):\s*([^;]+);/);
      if (tokenMatch) {
        darkTokens.set(`--${tokenMatch[1].trim()}`, tokenMatch[2].trim());
      }
    }
  }
  
  // Combine into token results
  const colorTokens = ['--primary', '--background', '--foreground', '--muted', '--card', 
                       '--accent', '--destructive', '--border', '--input', '--ring',
                       '--sidebar', '--sidebar-foreground', '--sidebar-primary'];
  const spacingTokens = ['--radius', '--spacing'];
  const typographyTokens = ['--font-sans', '--font-serif', '--font-mono'];
  
  const lightEntries = Array.from(lightTokens.entries());
  for (const [name, lightValue] of lightEntries) {
    let category = 'Other';
    if (colorTokens.some(t => name.startsWith(t))) category = 'Color';
    else if (spacingTokens.some(t => name.startsWith(t))) category = 'Spacing';
    else if (typographyTokens.some(t => name.startsWith(t))) category = 'Typography';
    else if (name.includes('shadow')) category = 'Effects';
    else if (name.includes('chart')) category = 'Charts';
    
    const darkValue = darkTokens.get(name) || lightValue;
    
    tokens.push({
      name,
      lightValue,
      darkValue,
      category,
    });
  }
  
  return tokens;
}

// Store scan results in memory (could be moved to database)
let lastScanResults: ScanResults | null = null;

export function getLastScanResults(): ScanResults | null {
  return lastScanResults;
}

export function setLastScanResults(results: ScanResults): void {
  lastScanResults = results;
}
