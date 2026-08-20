const fs = require('fs');
const path = require('path');

const replacements = {
  // Slate backgrounds
  'bg-slate-950': 'bg-primary',
  'hover:bg-slate-900': 'hover:bg-primary/90',
  'hover:bg-slate-800': 'hover:bg-primary/90',
  'bg-slate-800': 'bg-primary/90',
  'bg-slate-100': 'bg-secondary',
  'hover:bg-slate-100': 'hover:bg-secondary/80',
  'bg-slate-50': 'bg-secondary/50',
  'hover:bg-slate-50': 'hover:bg-secondary',
  'bg-white': 'bg-background',
  'hover:bg-white': 'hover:bg-background',
  
  // Slate text
  'text-slate-950': 'text-foreground',
  'text-slate-900': 'text-foreground',
  'text-slate-800': 'text-foreground',
  'text-slate-700': 'text-foreground',
  'text-slate-600': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-white': 'text-primary-foreground',
  'hover:text-slate-950': 'hover:text-foreground',
  'hover:text-slate-900': 'hover:text-foreground',
  'hover:text-slate-800': 'hover:text-foreground',
  'hover:text-slate-700': 'hover:text-foreground',
  'hover:text-slate-600': 'hover:text-muted-foreground',
  'hover:text-slate-500': 'hover:text-muted-foreground',

  // Slate borders
  'border-slate-300': 'border-border',
  'border-slate-200': 'border-border',
  'border-slate-100': 'border-border',
  'hover:border-slate-300': 'hover:border-border',
  'ring-slate-200': 'ring-border',
  'ring-slate-300': 'ring-border',
  
  // Blues (Accent)
  'bg-blue-600': 'bg-accent',
  'bg-blue-500': 'bg-accent',
  'bg-blue-100': 'bg-accent/20',
  'bg-blue-50': 'bg-accent/10',
  'text-blue-700': 'text-accent',
  'text-blue-600': 'text-accent',
  'text-blue-500': 'text-accent',
  'text-blue-400': 'text-accent',
  'border-blue-400': 'border-accent',
  'border-blue-200': 'border-accent/30',
  'border-blue-100': 'border-accent/20',
  'ring-blue-500': 'ring-accent',

  // Reds (Destructive)
  'bg-red-50': 'bg-destructive/10',
  'text-red-700': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-500': 'text-destructive',
  'border-red-200': 'border-destructive/30',
  
  // Greens (Success)
  'bg-emerald-50': 'bg-success/10',
  'bg-emerald-200': 'bg-success/20',
  'bg-emerald-500': 'bg-success',
  'text-emerald-900': 'text-success-foreground',
  'text-emerald-700': 'text-success',
  'text-emerald-600': 'text-success',
  'border-emerald-200': 'border-success/30',
  'border-emerald-100': 'border-success/20',

  // Misc fixes
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

['./src/shared/ui/popup-wrapper.tsx', './src/components/brand/kodedock-logo.tsx', './src/components/cart', './src/components/notifications', './src/components/wallet', './src/components/layout'].forEach(walkDir);
