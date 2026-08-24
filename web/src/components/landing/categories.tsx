"use client";

import Link from "next/link";
import { ArrowRight, MonitorSmartphone, Server, Layers, Code2, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { useEffect, useState } from "react";

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/proxy/public/categories')
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setCategories(data.data.slice(0, 8)); // Show max 8
        }
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  return (
    <section id="categories" className="bg-secondary/30 py-24 border-y border-border/50">
      <div className="container mx-auto flex flex-col gap-12">
        <div className="flex items-center justify-between">
          <h2 className="font-marketing text-3xl md:text-4xl font-bold tracking-tight">
            Explore Categories
          </h2>
          <Link
            href="/browse"
            className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No categories found. Wait for owner to create some.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.id}>
                <Card className="group hover:border-primary/50 transition-colors cursor-pointer bg-background h-full">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <LayoutGrid size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.product_count} items</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
