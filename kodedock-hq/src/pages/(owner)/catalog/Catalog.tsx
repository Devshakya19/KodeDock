import { useState } from "react";
import { Layers, Plus, Search, MoreVertical, LayoutGrid, CheckCircle2, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
  is_active: boolean;
};

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional().or(z.literal('')),
});

type CategoryValues = z.infer<typeof categorySchema>;

export default function Catalog() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { data: response, isLoading } = useQuery({
    queryKey: ['hq-categories'],
    queryFn: async () => await api.get("/api/hq/catalog/categories")
  });

  const categories: Category[] = response?.data || [];

  // Form setup
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", description: "" }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (values: CategoryValues) => {
      const res = await api.post("/api/hq/catalog/categories", values);
      return res;
    },
    onSuccess: () => {
      toast.success("Category created successfully!");
      setShowModal(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['hq-categories'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/hq/catalog/categories/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted!");
      queryClient.invalidateQueries({ queryKey: ['hq-categories'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: CategoryValues) => {
    createMutation.mutate(data);
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name, { shouldValidate: true });
    // Only auto-generate if user hasn't manually touched the slug yet
    if (!form.getFieldState("slug").isTouched) {
      form.setValue("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1 font-medium">Manage product categories and taxonomy.</p>
        </div>
        <button 
          onClick={() => { form.reset(); setShowModal(true); }} 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground p-4 text-sm col-span-full text-center">Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 bg-card border border-border rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">No Categories</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first product category to organize the marketplace.</p>
            <button onClick={() => setShowModal(true)} className="text-sm font-medium text-primary hover:underline">
              Create a Category
            </button>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group relative overflow-hidden shadow-sm flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-secondary rounded-lg">
                  <LayoutGrid className="w-5 h-5 text-foreground" />
                </div>
                <button 
                  onClick={() => handleDelete(cat.id)} 
                  disabled={deleteMutation.isPending}
                  className="text-red-500/70 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 disabled:opacity-50"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                {cat.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <span className="text-xs font-medium bg-secondary text-foreground px-2 py-1 rounded">
                  {cat.product_count} Products
                </span>
                {cat.is_active && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-500">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border bg-secondary/30">
              <h3 className="text-lg font-bold text-foreground">Create Category</h3>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Category Name</label>
                <input 
                  type="text" 
                  {...form.register("name")}
                  onChange={handleNameChange}
                  className={cn(
                    "w-full p-2.5 bg-background border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                    form.formState.errors.name ? "border-rose-500" : "border-input"
                  )}
                  placeholder="e.g., UI Kits"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Slug URL</label>
                <input 
                  type="text" 
                  {...form.register("slug")}
                  className={cn(
                    "w-full p-2.5 bg-background border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                    form.formState.errors.slug ? "border-rose-500" : "border-input"
                  )}
                  placeholder="e.g., ui-kits"
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-rose-500">{form.formState.errors.slug.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                <textarea 
                  {...form.register("description")}
                  className="w-full p-2.5 bg-background border border-input rounded-md text-sm h-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Briefly describe what goes in this category..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {createMutation.isPending ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
