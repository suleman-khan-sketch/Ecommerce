import { Metadata } from "next";
import { Suspense } from "react";

import ProductsGrid from "./_components/ProductsGrid";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our collection of premium products",
};

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

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Browse our collection of premium products
            </p>
          </div>

          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
