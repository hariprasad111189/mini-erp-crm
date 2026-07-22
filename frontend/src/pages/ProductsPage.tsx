import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackagePlus, Pencil, Search, TriangleAlert, X } from "lucide-react";
import { productsApi, type ProductInput } from "@/api/endpoints";
import type { Product } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { money } from "@/lib/utils";

const emptyProductForm: ProductInput = {
  name: "",
  sku: "",
  category: "",
  unitPrice: 0,
  currentStock: 0,
  minStockAlertQty: 0,
  location: ""
};

export const ProductsPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const canManageInventory = session?.user.role === "ADMIN" || session?.user.role === "WAREHOUSE";
  const [search, setSearch] = useState("");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductInput>(emptyProductForm);
  const [stockProductId, setStockProductId] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockReason, setStockReason] = useState("");
  const [message, setMessage] = useState("");
  const products = useQuery({
    queryKey: ["products", search],
    queryFn: () => productsApi.list({ search: search || undefined })
  });
  const lowStock = useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: productsApi.lowStock
  });

  const refreshProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const productMutation = useMutation({
    mutationFn: () =>
      editingProduct
        ? productsApi.update(editingProduct.id, productForm)
        : productsApi.create(productForm),
    onSuccess: async () => {
      setMessage(editingProduct ? "Product updated live." : "Product created live.");
      resetProductForm();
      await refreshProducts();
    },
    onError: () => setMessage("Product save failed. Check all mandatory fields.")
  });

  const stockMutation = useMutation({
    mutationFn: () => productsApi.addStock(stockProductId, { quantity: stockQuantity, reason: stockReason }),
    onSuccess: async () => {
      setMessage("Stock added live.");
      setStockProductId("");
      setStockQuantity(1);
      setStockReason("");
      await refreshProducts();
    },
    onError: () => setMessage("Stock update failed. Product, quantity, and reason are mandatory.")
  });

  const resetProductForm = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
    setProductForm(emptyProductForm);
  };

  const startCreateProduct = () => {
    setMessage("");
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductFormOpen(true);
  };

  const startEditProduct = (product: Product) => {
    setMessage("");
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: Number(product.unitPrice),
      currentStock: product.currentStock,
      minStockAlertQty: product.minStockAlertQty,
      location: product.location
    });
    setProductFormOpen(true);
  };

  const isProductFormValid =
    productForm.name.trim().length >= 2 &&
    productForm.sku.trim().length >= 2 &&
    productForm.category.trim().length >= 2 &&
    productForm.unitPrice > 0 &&
    productForm.currentStock >= 0 &&
    productForm.minStockAlertQty >= 0 &&
    productForm.location.trim().length >= 2;

  const isStockFormValid = Boolean(stockProductId) && stockQuantity > 0 && stockReason.trim().length >= 2;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">Maintain product stock, pricing, and alert thresholds.</p>
        </div>
        {canManageInventory ? (
          <Button onClick={startCreateProduct}>
            <PackagePlus className="h-4 w-4" />
            Add Product
          </Button>
        ) : null}
      </div>

      {canManageInventory && productFormOpen ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{editingProduct ? "Edit Product" : "Create Product"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetProductForm} aria-label="Close product form">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (isProductFormValid) productMutation.mutate();
              }}
            >
              <Field label="Product Name" required>
                <Input required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
              </Field>
              <Field label="SKU" required>
                <Input required value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
              </Field>
              <Field label="Category" required>
                <Input
                  required
                  value={productForm.category}
                  onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                />
              </Field>
              <Field label="Unit Price" required>
                <Input
                  required
                  type="number"
                  min={1}
                  step="0.01"
                  value={productForm.unitPrice}
                  onChange={(event) => setProductForm({ ...productForm, unitPrice: Number(event.target.value) })}
                />
              </Field>
              <Field label="Current Stock" required>
                <Input
                  required
                  type="number"
                  min={0}
                  value={productForm.currentStock}
                  onChange={(event) => setProductForm({ ...productForm, currentStock: Number(event.target.value) })}
                />
              </Field>
              <Field label="Minimum Stock Alert" required>
                <Input
                  required
                  type="number"
                  min={0}
                  value={productForm.minStockAlertQty}
                  onChange={(event) => setProductForm({ ...productForm, minStockAlertQty: Number(event.target.value) })}
                />
              </Field>
              <Field label="Location" required>
                <Input
                  required
                  value={productForm.location}
                  onChange={(event) => setProductForm({ ...productForm, location: event.target.value })}
                />
              </Field>
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
                <Button type="submit" disabled={!isProductFormValid || productMutation.isPending}>
                  {productMutation.isPending ? "Saving" : editingProduct ? "Update Product" : "Create Product"}
                </Button>
                <Button type="button" variant="outline" onClick={resetProductForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canManageInventory ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-[1fr_160px_1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                if (isStockFormValid) stockMutation.mutate();
              }}
            >
              <Field label="Product" required>
                <Select required value={stockProductId} onChange={(event) => setStockProductId(event.target.value)}>
                  <option value="">Select product</option>
                  {products.data?.data.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Quantity" required>
                <Input
                  required
                  type="number"
                  min={1}
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(Number(event.target.value))}
                />
              </Field>
              <Field label="Reason" required>
                <Input required value={stockReason} onChange={(event) => setStockReason(event.target.value)} />
              </Field>
              <div className="flex items-end">
                <Button type="submit" disabled={!isStockFormValid || stockMutation.isPending}>
                  {stockMutation.isPending ? "Adding" : "Add Stock"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {message ? <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800">{message}</p> : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <div className="relative mt-3 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search product, SKU, category" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="min-h-96">
            {products.isLoading ? (
              <Rows />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="h-10 border-b text-xs uppercase text-muted-foreground">
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Location</th>
                      {canManageInventory ? <th>Edit</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {products.data?.data.map((product) => (
                      <tr key={product.id} className="h-14 border-b last:border-0">
                        <td className="font-medium">{product.name}</td>
                        <td>{product.sku}</td>
                        <td>{product.category}</td>
                        <td>{money(product.unitPrice)}</td>
                        <td>
                          <Badge tone={product.currentStock <= product.minStockAlertQty ? "amber" : "green"}>
                            {product.currentStock}
                          </Badge>
                        </td>
                        <td>{product.location}</td>
                        {canManageInventory ? (
                          <td>
                            <Button variant="ghost" size="icon" onClick={() => startEditProduct(product)} aria-label="Edit product">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-amber-600" />
              <CardTitle>Low-Stock Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="min-h-96">
            {lowStock.isLoading ? (
              <Rows />
            ) : (
              <div className="space-y-3">
                {lowStock.data?.map((product) => (
                  <div key={product.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.location}</p>
                      </div>
                      <Badge tone="amber">{product.sku}</Badge>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{
                          width: `${Math.max(8, Math.min(100, (product.currentStock / product.minStockAlertQty) * 100))}%`
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {product.currentStock} available, alert at {product.minStockAlertQty}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

const Rows = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} className="h-14 w-full" />
    ))}
  </div>
);

const Field = ({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: JSX.Element;
}) => (
  <label className="block space-y-1 text-sm font-medium">
    <span>
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
    </span>
    {children}
  </label>
);
