import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, MoreHorizontal, CheckCircle, Archive, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

interface Product {
  id: string;
  title: string;
  seller_id: string;
  seller_name: string | null;
  status: string;
  price_paise: number;
  sales_count: number | null;
  created_at: string | null;
}

const formatCurrency = (paise: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
};

// Reusable Dropdown Cell Component for isolation
const ActionCell = ({ product }: { product: Product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await api.put(`/api/hq/products/${product.id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hq-products'] });
      setIsOpen(false);
    },
    onError: (err) => {
      console.error("Failed to update status", err);
    }
  });

  return (
    <div className="relative text-right" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-6 top-0 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden text-left">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Change Status</p>
          </div>
          <button 
            onClick={() => mutation.mutate('active')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
          >
            <CheckCircle className="h-4 w-4" /> Approve (Active)
          </button>
          <button 
            onClick={() => mutation.mutate('paused')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
          >
            <Clock className="h-4 w-4" /> Pause Product
          </button>
          <button 
            onClick={() => mutation.mutate('archived')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Archive className="h-4 w-4" /> Archive (Hide)
          </button>
        </div>
      )}
    </div>
  );
};

// Define DataTable Columns
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "title",
    header: "Product Name",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{row.original.id}</p>
      </div>
    ),
  },
  {
    accessorKey: "seller_name",
    header: "Seller",
    cell: ({ row }) => <span className="text-foreground">{row.original.seller_name || "Unknown Seller"}</span>,
  },
  {
    accessorKey: "price_paise",
    header: "Price",
    cell: ({ row }) => <span className="text-foreground">{formatCurrency(row.original.price_paise)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium border",
          status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
          status === 'draft' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          status === 'paused' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
          "bg-secondary text-muted-foreground border-border"
        )}>
          {status.toUpperCase()}
        </span>
      );
    }
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <ActionCell product={row.original} />,
  }
];

export default function Marketplace() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['hq-products'],
    queryFn: async () => {
      const data = await api.get('/api/hq/products?limit=100');
      return data;
    }
  });

  const products: Product[] = response?.data || [];
  
  const total = products.length;
  const pending = products.filter(p => p.status === 'draft').length;
  const active = products.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace Hub</h1>
          <p className="text-muted-foreground mt-1 font-medium">Review, moderate, and manage platform products.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-secondary text-foreground font-bold px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors shadow-sm">
            <Filter className="h-4 w-4" />
            Filter Catalog
          </button>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Total Catalog</p>
            <h3 className="text-2xl font-black text-foreground">{total}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Pending Review</p>
            <h3 className="text-2xl font-black text-foreground">{pending}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Active Products</p>
            <h3 className="text-2xl font-black text-foreground">{active}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="font-medium">Loading catalog...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-red-500 font-bold bg-red-500/5">Failed to load catalog.</div>
        ) : (
          <div className="p-2">
            <DataTable columns={columns} data={products} searchKey="title" />
          </div>
        )}
      </div>
    </div>
  );
}
