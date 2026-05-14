import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetStats } from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Receipt, Wallet, TrendingUp, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: "Total Revenue", value: formatIDR(stats.totalRevenue), icon: Wallet, desc: "All-time success" },
    { title: "Total Transactions", value: stats.totalTransactions.toString(), icon: Receipt, desc: "Lifetime orders" },
    { title: "Active Products", value: stats.totalProducts.toString(), icon: Package, desc: "In catalog" },
    { title: "Success Rate", value: `${Math.round((stats.successCount / Math.max(1, stats.totalTransactions)) * 100)}%`, icon: TrendingUp, desc: "Completed orders" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening with your pulsa store.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <Card key={i} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="col-span-1 border-green-100 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-700 dark:text-green-400">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.successCount}</div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 border-red-100 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-red-700 dark:text-red-400">
                <XCircle className="mr-2 h-4 w-4" /> Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.failCount}</div>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-amber-100 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-amber-700 dark:text-amber-400">
                <Clock className="mr-2 h-4 w-4" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{tx.productName}</p>
                      <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                        <span>{tx.target}</span>
                        <span>•</span>
                        <span>{format(new Date(tx.createdAt), "MMM d, HH:mm")}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatIDR(tx.harga)}</p>
                      <Badge 
                        variant={tx.status === "success" ? "default" : tx.status === "gagal" ? "destructive" : "secondary"}
                        className={tx.status === "success" ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent transactions found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}