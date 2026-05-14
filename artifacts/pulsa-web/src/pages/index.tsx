import React, { useState } from "react";
import { useListProducts, useListOperators, usePlaceOrder } from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, CreditCard, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PublicOrderPage() {
  const [target, setTarget] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<string>("All");
  const [search, setSearch] = useState("");

  const { data: operators = [], isLoading: isLoadingOperators } = useListOperators();
  const { data: products = [], isLoading: isLoadingProducts } = useListProducts({
    operator: selectedOperator !== "All" ? selectedOperator : undefined,
    search: search ? search : undefined,
  });

  const { toast } = useToast();
  const placeOrder = usePlaceOrder();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleOrder = (productCode: string) => {
    if (!target) {
      toast({ title: "Phone number required", description: "Please enter your phone number first.", variant: "destructive" });
      return;
    }
    
    setSelectedProduct(productCode);
    placeOrder.mutate(
      { data: { productCode, target } },
      {
        onSuccess: () => {
          toast({ title: "Order Placed", description: "Your order has been submitted successfully." });
          setSelectedProduct(null);
          setTarget("");
        },
        onError: (err: any) => {
          toast({ title: "Order Failed", description: err.message || "An error occurred.", variant: "destructive" });
          setSelectedProduct(null);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Fast Mobile Credits</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Top up your mobile phone instantly. Enter your number, choose your product, and you're set.
          </p>

          <div className="max-w-md mx-auto relative mt-8">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="tel"
              placeholder="Enter phone number (e.g. 0812...)"
              className="pl-10 h-14 text-lg bg-background text-foreground rounded-full shadow-lg"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <Button
              variant={selectedOperator === "All" ? "default" : "secondary"}
              onClick={() => setSelectedOperator("All")}
              className="rounded-full shrink-0"
            >
              All Operators
            </Button>
            {operators.map((op) => (
              <Button
                key={op}
                variant={selectedOperator === op ? "default" : "secondary"}
                onClick={() => setSelectedOperator(op)}
                className="rounded-full shrink-0"
              >
                {op}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9 rounded-full bg-muted/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoadingProducts || isLoadingOperators ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.filter(p => p.isActive).length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.filter(p => p.isActive).map((product) => (
              <Card key={product.id} className="hover:border-primary/50 transition-colors flex flex-col group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3 z-10">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg leading-tight">{product.nama}</CardTitle>
                    <Badge variant="outline" className="shrink-0 bg-background">{product.operator}</Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">{product.code}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pb-4 z-10">
                  <div className="text-2xl font-bold text-primary">
                    {formatIDR(product.harga)}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 z-10">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => handleOrder(product.code)}
                    disabled={placeOrder.isPending || !target}
                  >
                    {placeOrder.isPending && selectedProduct === product.code ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Order Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}