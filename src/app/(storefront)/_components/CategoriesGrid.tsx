"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  productCount: number;
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("published", true)
        .limit(4);

      if (error || !data) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setLoading(false);
        return;
      }

      const categoriesWithCount = await Promise.all(
        data.map(async (cat) => {
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id)
            .eq("published", true);

          return {
            ...cat,
            productCount: count || 0,
          };
        })
      );

      setCategories(categoriesWithCount);
      setLoading(false);
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              Shop by Category
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 max-w-2xl text-center text-muted-foreground">
              Find the perfect products for your needs from our curated collections
            </p>
          </div>
          <CategoriesSkeleton />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            Shop by Category
          </h2>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-4 max-w-2xl text-center text-muted-foreground">
            Find the perfect products for your needs from our curated collections
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((category) => (
            <Link
              aria-label={`Browse ${category.name} products`}
              className="group relative flex flex-col space-y-4 overflow-hidden rounded-2xl border bg-card shadow transition-all duration-300 hover:shadow-lg"
              href={`/products?category=${category.slug}`}
              key={category.id}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />
                <Image
                  alt={category.name}
                  className="object-cover transition duration-300 group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  src={category.image_url}
                />
              </div>
              <div className="relative z-20 -mt-6 p-4">
                <div className="mb-1 text-lg font-medium">{category.name}</div>
                <p className="text-sm text-muted-foreground">
                  {category.productCount} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
