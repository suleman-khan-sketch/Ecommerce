"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import ProductCard, { Product } from "@/components/storefront/ProductCard";
import ProductFilters from "./ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function ProductsGrid() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const sort = searchParams.get("sort") || undefined;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("published", true)
        .order("name");

      setCategories(categoriesData || []);

      let query = supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          selling_price,
          cost_price,
          image_url,
          stock,
          category_id,
          categories (
            name,
            slug
          )
        `
        )
        .eq("published", true);

      if (category) {
        const cat = categoriesData?.find((c) => c.slug === category);
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      switch (sort) {
        case "price-asc":
          query = query.order("selling_price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("selling_price", { ascending: false });
          break;
        case "name-asc":
          query = query.order("name", { ascending: true });
          break;
        case "name-desc":
          query = query.order("name", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data: productsData, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } else {
        const mappedProducts: Product[] = (productsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.selling_price,
          image: p.image_url,
          category: p.categories?.name || "Uncategorized",
          categorySlug: p.categories?.slug,
          inStock: p.stock > 0,
          rating: 4.5,
        }));
        setProducts(mappedProducts);
      }

      setLoading(false);
    }

    fetchData();
  }, [category, search, sort]);

  if (loading) {
    return <ProductsGridSkeleton />;
  }

  return (
    <>
      <ProductFilters categories={categories} />

      {products.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            No products found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
