import { useState, useEffect } from "react";
import { Layers, Plus, Search, MoreVertical, LayoutGrid, CheckCircle2, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
  is_active: boolean;
};

export default function Catalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/catalog/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("hq_token")}` }
      });
      const data = await res.json();
      if (data.status === "success") setCategories(data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/hq/catalog/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("hq_token")}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/catalog/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("hq_token")}` 
        },
        body: JSON.stringify(newCat)
      });
      const data = await res.json();
      if (data.status === "success") {
        setShowModal(false);
        setNewCat({ name: "", slug: "", description: "" });
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">Manage product categories and taxonomy.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground p-4 text-sm">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm col-span-full text-center py-12 bg-card border border-border rounded-lg">No categories found. Create your first category to get started.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-secondary rounded-lg">
                  <LayoutGrid className="w-5 h-5 text-foreground" />
                </div>
                <button onClick={() => handleDelete(cat.id)} className="text-red-500/70 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                {cat.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
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
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Create Category</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category Name</label>
                <input required type="text" className="w-full p-2 bg-background border border-border rounded-md text-sm" value={newCat.name} onChange={e => {
                  const val = e.target.value;
                  setNewCat({...newCat, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-')});
                }} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Slug</label>
                <input required type="text" className="w-full p-2 bg-background border border-border rounded-md text-sm text-muted-foreground" value={newCat.slug} onChange={e => setNewCat({...newCat, slug: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea className="w-full p-2 bg-background border border-border rounded-md text-sm h-24" value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
