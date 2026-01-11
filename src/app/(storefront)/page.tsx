import { ArrowRight, Clock, ShoppingBag, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import { SITE_CONFIG, STORE_CONFIG } from "@/constants/site";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FeaturedProducts from "./_components/FeaturedProducts";
import CategoriesGrid from "./_components/CategoriesGrid";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.slogan}`,
  description: SITE_CONFIG.description,
};

const featuresWhyChooseUs = [
  {
    description:
      "Free shipping on all orders over $50. Fast and reliable delivery to your doorstep.",
    icon: <Truck className="h-6 w-6 text-primary" />,
    title: "Free Shipping",
  },
  {
    description:
      "Your payment information is always safe and secure with us. We use industry-leading encryption.",
    icon: <ShoppingBag className="h-6 w-6 text-primary" />,
    title: "Secure Checkout",
  },
  {
    description:
      "Our customer support team is always available to help with any questions or concerns.",
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "24/7 Support",
  },
  {
    description:
      "We stand behind the quality of every product we sell. 30-day money-back guarantee.",
    icon: <Star className="h-6 w-6 text-primary" />,
    title: "Quality Guarantee",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="bg-grid-black/[0.02] absolute inset-0 bg-[length:20px_20px]" />
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
                  <span className="mr-2">🎉</span>
                  <span>Welcome to {SITE_CONFIG.name}</span>
                </div>

                <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1]">
                  Your One-Stop Shop for{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Premium Products
                  </span>
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                  {SITE_CONFIG.description}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/products">
                  <Button
                    className="h-12 gap-1.5 px-8 transition-colors duration-200"
                    size="lg"
                  >
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="h-12 px-8 transition-colors duration-200"
                    size="lg"
                    variant="outline"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-5 w-5 text-primary/70" />
                  <span>Free shipping over $50</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-5 w-5 text-primary/70" />
                  <span>Min. order ${STORE_CONFIG.minOrderValue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-5 w-5 text-primary/70" />
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </div>
            <div className="relative mx-auto hidden aspect-square w-full max-w-md overflow-hidden rounded-xl border shadow-lg lg:block">
              <div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
              <Image
                alt="Shopping experience"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src="https://images.unsplash.com/photo-1624767735494-1929dc24ad43?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* Featured Categories */}
      <CategoriesGrid />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Features Section */}
      <section className="py-12 md:py-16" id="features">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              Why Choose Us
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 max-w-2xl text-center text-muted-foreground md:text-lg">
              We offer the best shopping experience with premium features
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {featuresWhyChooseUs.map((feature) => (
              <Card
                className="rounded-2xl border-none bg-background shadow transition-all duration-300 hover:shadow-lg"
                key={feature.title}
              >
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-xl bg-primary/10 p-8 shadow-lg md:p-12">
            <div className="bg-grid-white/[0.05] absolute inset-0 bg-[length:16px_16px]" />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
                Ready to Start Shopping?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                Join thousands of satisfied customers. Sign up today for
                exclusive deals and offers.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button
                    className="h-12 px-8 transition-colors duration-200"
                    size="lg"
                  >
                    Sign Up Now
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    className="h-12 px-8 transition-colors duration-200"
                    size="lg"
                    variant="outline"
                  >
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
