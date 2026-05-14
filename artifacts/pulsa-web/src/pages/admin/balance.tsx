import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Wallet, User, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminBalance() {
  const { data: balanceInfo, isLoading, isFetching } = useGetBalance();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl mx-auto mt-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provider Balance</h1>
          <p className="text-muted-foreground mt-1">Check your external provider account balance.</p>
        </div>

        {balanceInfo?.message && balanceInfo.balance === null && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error fetching balance</AlertTitle>
            <AlertDescription>{balanceInfo.message}</AlertDescription>
          </Alert>
        )}

        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" /> Current Balance
                </CardTitle>
                <CardDescription className="mt-1">IsiPulsa Account</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="-mt-6">
            <div className="bg-card rounded-xl p-8 shadow-sm border flex flex-col items-center justify-center min-h-[200px]">
              {isLoading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <>
                  <div className="text-5xl font-bold text-primary tracking-tight">
                    {balanceInfo?.balance !== null && balanceInfo?.balance !== undefined 
                      ? formatIDR(balanceInfo.balance) 
                      : "---"}
                  </div>
                  
                  {balanceInfo?.username && (
                    <div className="mt-6 flex items-center text-muted-foreground bg-muted px-4 py-2 rounded-full text-sm">
                      <User className="h-4 w-4 mr-2" />
                      Account: <span className="font-medium text-foreground ml-1">{balanceInfo.username}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}