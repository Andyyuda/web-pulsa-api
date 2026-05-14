import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Receipt, Wallet, Menu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHealthCheck } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/transactions", label: "Transactions", icon: Receipt },
    { href: "/admin/balance", label: "Balance", icon: Wallet },
  ];

  const NavLinks = () => (
    <div className="flex flex-col gap-2 p-4 h-full">
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary font-medium" : ""}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto">
        <div className="flex items-center text-xs text-muted-foreground px-4 py-2 bg-muted/50 rounded-lg">
          <Activity className="h-3 w-3 mr-2" />
          API Status: {health?.status === "ok" ? <span className="text-green-500 ml-1 font-medium">Online</span> : <span className="text-red-500 ml-1 font-medium">Offline</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="h-14 border-b flex items-center px-6">
          <Link href="/" className="font-bold text-lg text-primary">PulsaAdmin</Link>
        </div>
        <NavLinks />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Mobile */}
        <div className="md:hidden h-14 border-b bg-background flex items-center px-4 justify-between">
          <Link href="/" className="font-bold text-lg text-primary">PulsaAdmin</Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 flex flex-col">
              <div className="h-14 border-b flex items-center px-6">
                <span className="font-bold text-lg text-primary">PulsaAdmin</span>
              </div>
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
