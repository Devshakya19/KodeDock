const fs = require('fs');
const path = require('path');

const replacements = {
  // Slate/Gray/Zinc -> Primary (Dark) or Secondary (Light)
  'bg-slate-950': 'bg-primary',
  'bg-slate-900': 'bg-primary',
  'bg-slate-800': 'bg-primary/90',
  'bg-slate-700': 'bg-primary/80',
  'bg-slate-100': 'bg-secondary',
  'bg-slate-50': 'bg-secondary/50',
  'hover:bg-slate-950': 'hover:bg-primary',
  'hover:bg-slate-900': 'hover:bg-primary/90',
  'hover:bg-slate-100': 'hover:bg-secondary',
  'hover:bg-slate-50': 'hover:bg-secondary/50',

  // Slate Text
  'text-slate-950': 'text-foreground',
  'text-slate-900': 'text-foreground',
  'text-slate-800': 'text-foreground',
  'text-slate-700': 'text-foreground',
  'text-slate-600': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-slate-300': 'text-muted-foreground/80',
  'text-slate-200': 'text-muted-foreground/60',
  'hover:text-slate-950': 'hover:text-foreground',
  'hover:text-slate-900': 'hover:text-foreground',
  'hover:text-slate-700': 'hover:text-foreground',
  'hover:text-slate-600': 'hover:text-muted-foreground',

  // Slate Borders/Rings
  'border-slate-300': 'border-border',
  'border-slate-200': 'border-border',
  'border-slate-100': 'border-border',
  'border-slate-200/60': 'border-border/60',
  'border-slate-200/50': 'border-border/50',
  'border-slate-200/80': 'border-border/80',
  'hover:border-slate-300': 'hover:border-border',
  'ring-slate-300': 'ring-border',
  'ring-slate-200': 'ring-border',
  'ring-slate-200/60': 'ring-border/60',

  // Blues (Accent)
  'bg-blue-600': 'bg-accent',
  'bg-blue-500': 'bg-accent',
  'bg-blue-100': 'bg-accent/20',
  'bg-blue-50': 'bg-accent/10',
  'bg-blue-100/50': 'bg-accent/20',
  'text-blue-700': 'text-accent',
  'text-blue-600': 'text-accent',
  'text-blue-500': 'text-accent',
  'text-blue-400': 'text-accent',
  'border-blue-400': 'border-accent',
  'border-blue-200': 'border-accent/30',
  'border-blue-100': 'border-accent/20',
  'border-blue-100/80': 'border-accent/30',
  'ring-blue-500': 'ring-accent',
  'ring-blue-500/20': 'ring-accent/20',

  // Greens (Success)
  'bg-emerald-50': 'bg-success/10',
  'bg-emerald-100': 'bg-success/20',
  'bg-emerald-200': 'bg-success/30',
  'bg-emerald-200/50': 'bg-success/30',
  'bg-emerald-500': 'bg-success',
  'bg-emerald-400': 'bg-success/80',
  'text-emerald-900': 'text-success-foreground',
  'text-emerald-800': 'text-success-foreground',
  'text-emerald-700': 'text-success',
  'text-emerald-600': 'text-success',
  'border-emerald-200': 'border-success/30',
  'border-emerald-200/70': 'border-success/30',
  'border-emerald-100': 'border-success/20',
  'border-emerald-100/80': 'border-success/20',

  // Reds (Destructive)
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/20',
  'text-red-700': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-500': 'text-destructive',
  'border-red-200': 'border-destructive/30',

  // Ambers (Warning)
  'bg-amber-50': 'bg-warning/10',
  'bg-amber-100': 'bg-warning/20',
  'text-amber-700': 'text-warning',
  'text-amber-600': 'text-warning',
  'border-amber-200': 'border-warning/30',

  // White/Black
  'bg-white': 'bg-background',
  'hover:bg-white': 'hover:bg-background',
  'bg-white/95': 'bg-background/95',
  'bg-white/80': 'bg-background/80',
  'text-white': 'text-primary-foreground',
  'text-black': 'text-foreground',
  'border-white/10': 'border-border/10',
  'border-white/20': 'border-border/20',
  'ring-white': 'ring-background',
  
  // Custom Shadows
  'shadow-black/5': 'shadow-sm',
  'shadow-[0_8px_30px_rgb(0,0,0,0.04)]': 'shadow-lg',
  'shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)]': 'shadow-md',
  'shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]': 'shadow-lg'
};

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      // Exclude theme.ts to avoid breaking variables
      if (fullPath.includes('theme.ts') || fullPath.includes('globals.css')) return;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const [key, value] of Object.entries(replacements)) {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(?<=[\\s"'\\\`])` + escapedKey + `(?=[\\s"'\\\`])`, 'g');
        content = content.replace(regex, value);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

walkDir('./src');
