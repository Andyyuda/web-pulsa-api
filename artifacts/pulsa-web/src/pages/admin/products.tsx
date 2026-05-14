import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey, useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, Edit2, Trash2, Power, PowerOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

const productSchema = z.object({
  code: z.string().min(1, "Code is required"),
  voucherId: z.string().min(1, "Voucher ID is required"),
  nama: z.string().min(1, "Name is required"),
  harga: z.coerce.number().min(0, "Price must be positive"),
  operator: z.string().min(1, "Operator is required"),
  isActive: z.boolean().default(true),
});

function EditProductForm({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id } });
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { code: "", voucherId: "", nama: "", harga: 0, operator: "", isActive: true }
  });

  React.useEffect(() => {
    if (product) {
      form.reset({
        code: product.code,
        voucherId: product.voucherId,
        nama: product.nama,
        harga: product.harga,
        operator: product.operator,
        isActive: product.isActive,
      });
    }
  }, [product, form]);

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    updateProduct.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
          onClose();
          toast({ title: "Product updated" });
        }
      }
    );
  };

  if (isLoading) return <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="code" render={({ field }) => (
            <FormItem>
              <FormLabel>Product Code</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. tsel10" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="voucherId" render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Voucher ID</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. V-TSEL10" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl><Input {...field} placeholder="Telkomsel 10K" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="harga" render={({ field }) => (
            <FormItem>
              <FormLabel>Price (IDR)</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="operator" render={({ field }) => (
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <FormControl><Input {...field} placeholder="Telkomsel" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="isActive" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-2">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active Status</FormLabel>
              <div className="text-sm text-muted-foreground">Product will be visible to customers.</div>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={updateProduct.isPending}>
            {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Product
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function CreateProductForm({ onClose }: { onClose: () => void }) {
  const createProduct = useCreateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { code: "", voucherId: "", nama: "", harga: 0, operator: "", isActive: true }
  });

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    createProduct.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          onClose();
          toast({ title: "Product created" });
        }
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="code" render={({ field }) => (
            <FormItem>
              <FormLabel>Product Code</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. tsel10" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="voucherId" render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Voucher ID</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. V-TSEL10" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl><Input {...field} placeholder="Telkomsel 10K" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="harga" render={({ field }) => (
            <FormItem>
              <FormLabel>Price (IDR)</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="operator" render={({ field }) => (
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <FormControl><Input {...field} placeholder="Telkomsel" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="isActive" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-2">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active Status</FormLabel>
              <div className="text-sm text-muted-foreground">Product will be visible to customers.</div>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Product
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading } = useListProducts({ search: search ? search : undefined });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleEdit = (id: number) => {
    setEditingId(id);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            toast({ title: "Product deleted" });
          }
        }
      );
    }
  };

  const toggleActive = (id: number, currentActive: boolean) => {
    updateProduct.mutate(
      { id, data: { isActive: !currentActive } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your pulsa catalog.</p>
          </div>
          
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
          <Input 
            placeholder="Search code or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Price (IDR)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-medium">{p.code}</TableCell>
                    <TableCell>{p.nama}</TableCell>
                    <TableCell><Badge variant="outline">{p.operator}</Badge></TableCell>
                    <TableCell className="font-medium">{formatIDR(p.harga)}</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"} className={p.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(p.id, p.isActive)} title={p.isActive ? "Deactivate" : "Activate"}>
                        {p.isActive ? <PowerOff className="h-4 w-4 text-muted-foreground" /> : <Power className="h-4 w-4 text-green-500" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p.id)} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} title="Delete" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            {editingId ? (
              <EditProductForm id={editingId} onClose={() => setIsDialogOpen(false)} />
            ) : (
              <CreateProductForm onClose={() => setIsDialogOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}