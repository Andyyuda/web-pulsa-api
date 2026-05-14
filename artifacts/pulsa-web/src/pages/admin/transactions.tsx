import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListTransactions, useGetTransaction, getGetTransactionQueryKey } from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Phone, Hash, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function TransactionDetailDialog({ id, open, onOpenChange }: { id: number | null, open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: tx, isLoading } = useGetTransaction(id!, { query: { enabled: !!id } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            ID: #{id}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : tx ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge 
                  variant={tx.status === "success" ? "default" : tx.status === "gagal" ? "destructive" : "secondary"}
                  className={tx.status === "success" ? "bg-green-500" : "mt-1"}
                >
                  {tx.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-bold text-lg">{formatIDR(tx.harga)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Product</p>
                <p className="font-medium">{tx.productName} ({tx.productCode})</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target Number</p>
                <p className="font-medium">{tx.target}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Reference ID</p>
                <p className="font-mono">{tx.refId || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created At</p>
                <p>{format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm:ss")}</p>
              </div>
            </div>
            {tx.note && (
              <div>
                <p className="text-muted-foreground">Note / Serial Number</p>
                <p className="bg-muted p-2 rounded-md font-mono text-xs">{tx.note}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground p-6">Transaction not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTransactions() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: transactions = [], isLoading } = useListTransactions({ 
    status: statusFilter !== "all" ? statusFilter : undefined 
  });

  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">History of all orders and their statuses.</p>
        </div>

        <div className="flex gap-2">
          {["all", "success", "pending", "gagal"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Target Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                        {format(new Date(t.createdAt), "dd MMM yyyy, HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        {t.target}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{t.productName}</div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Hash className="mr-1 h-3 w-3" /> {t.productCode}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatIDR(t.harga)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={t.status === "success" ? "default" : t.status === "gagal" ? "destructive" : "secondary"}
                        className={t.status === "success" ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTxId(t.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <TransactionDetailDialog 
        id={selectedTxId} 
        open={selectedTxId !== null} 
        onOpenChange={(open) => !open && setSelectedTxId(null)} 
      />
    </AdminLayout>
  );
}