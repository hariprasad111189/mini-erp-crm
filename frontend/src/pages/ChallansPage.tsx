import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Download, Plus, ReceiptText, Trash2 } from "lucide-react";
import { challansApi, customersApi, productsApi } from "@/api/endpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/utils";

type DraftLine = {
  productId: string;
  quantity: number;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: {
      productId?: string;
      requestedQty?: number;
    };
  };
};

export const ChallansPage = () => {
  const queryClient = useQueryClient();
  const customers = useQuery({ queryKey: ["customers", "select"], queryFn: () => customersApi.list() });
  const products = useQuery({ queryKey: ["products", "select"], queryFn: () => productsApi.list() });
  const challans = useQuery({ queryKey: ["challans"], queryFn: () => challansApi.list() });
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "CONFIRMED">("DRAFT");
  const [items, setItems] = useState<DraftLine[]>([{ productId: "", quantity: 1 }]);
  const [message, setMessage] = useState("");
  const [lineErrors, setLineErrors] = useState<Record<number, string>>({});

  const productNameById = useMemo(
    () => new Map(products.data?.data.map((product) => [product.id, product.name]) ?? []),
    [products.data?.data]
  );

  const totals = useMemo(() => {
    const productMap = new Map(products.data?.data.map((product) => [product.id, product]));
    return items.reduce(
      (acc, item) => {
        const product = productMap.get(item.productId);
        return {
          qty: acc.qty + Number(item.quantity || 0),
          amount: acc.amount + (product ? Number(product.unitPrice) * Number(item.quantity || 0) : 0)
        };
      },
      { qty: 0, amount: 0 }
    );
  }, [items, products.data?.data]);

  const validItems = items.filter((item) => item.productId && item.quantity > 0);
  const isChallanValid = Boolean(customerId) && Boolean(status) && items.length > 0 && validItems.length === items.length;

  const createMutation = useMutation({
    mutationFn: challansApi.create,
    onSuccess: async () => {
      setMessage("Challan saved.");
      setLineErrors({});
      setItems([{ productId: "", quantity: 1 }]);
      setCustomerId("");
      await queryClient.invalidateQueries({ queryKey: ["challans"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const body = error.response.data as ApiErrorBody;
        if (body.error?.code === "INSUFFICIENT_STOCK") {
          const productId = body.error.details?.productId;
          const requestedQty = body.error.details?.requestedQty;
          const productLabel = productId
            ? productNameById.get(productId) ?? productId
            : "unknown product";

          const nextErrors: Record<number, string> = {};
          items.forEach((item, index) => {
            if (productId && item.productId === productId) {
              nextErrors[index] =
                `Insufficient stock for ${productLabel} (${productId}) - requested ${requestedQty ?? item.quantity}`;
            }
          });
          setLineErrors(nextErrors);
          setMessage(
            body.error.message ??
              `Insufficient stock for line item: ${productLabel} (${productId})`
          );
          return;
        }
      }
      setLineErrors({});
      setMessage("Could not save challan. Check stock and required fields.");
    }
  });

  const save = () => {
    setMessage("");
    setLineErrors({});
    if (!isChallanValid) {
      setMessage("Customer, status, product, and quantity are mandatory.");
      return;
    }
    createMutation.mutate({
      customerId,
      status,
      items: validItems
    });
  };

  const updateLine = (index: number, patch: Partial<DraftLine>) => {
    setItems((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
    );
    setLineErrors((current) => {
      if (!(index in current)) return current;
      const next = { ...current };
      delete next[index];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Challans</h1>
        <p className="text-sm text-muted-foreground">Create draft or confirmed challans with stock-safe validation.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Challan Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-1 text-sm font-medium">
              <span>Customer</span>
              <Select required value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="">Select customer</option>
                {customers.data?.data.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.businessName}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-1 text-sm font-medium">
              <span>Status</span>
              <Select required value={status} onChange={(event) => setStatus(event.target.value as "DRAFT" | "CONFIRMED")}>
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmed</option>
              </Select>
            </label>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="grid grid-cols-[1fr_82px_40px] gap-2">
                    <Select
                      value={item.productId}
                      onChange={(event) => updateLine(index, { productId: event.target.value })}
                      required
                      aria-invalid={Boolean(lineErrors[index])}
                      className={lineErrors[index] ? "border-red-500" : undefined}
                    >
                      <option value="">Product</option>
                      {products.data?.data.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.currentStock})
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      required
                      value={item.quantity}
                      onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                      aria-invalid={Boolean(lineErrors[index])}
                      className={lineErrors[index] ? "border-red-500" : undefined}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      aria-label="Remove line"
                      onClick={() => {
                        setItems((current) => current.filter((_, lineIndex) => lineIndex !== index));
                        setLineErrors((current) => {
                          const next: Record<number, string> = {};
                          Object.entries(current).forEach(([key, value]) => {
                            const lineIndex = Number(key);
                            if (lineIndex < index) next[lineIndex] = value;
                            if (lineIndex > index) next[lineIndex - 1] = value;
                          });
                          return next;
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {lineErrors[index] ? (
                    <p className="px-1 text-xs text-red-600" role="alert">
                      {lineErrors[index]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              type="button"
              onClick={() => setItems((current) => [...current, { productId: "", quantity: 1 }])}
            >
              <Plus className="h-4 w-4" />
              Add Line
            </Button>

            <div className="rounded-md border bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span>Total quantity</span>
                <strong>{totals.qty}</strong>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Total amount</span>
                <strong>{money(totals.amount)}</strong>
              </div>
            </div>

            {message ? (
              <p
                className={
                  Object.keys(lineErrors).length
                    ? "rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
                    : "rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800"
                }
              >
                {message}
              </p>
            ) : null}
            <Button className="w-full" disabled={!isChallanValid || createMutation.isPending} onClick={save}>
              <ReceiptText className="h-4 w-4" />
              {createMutation.isPending ? "Saving" : "Save Challan"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Challan Register</CardTitle>
          </CardHeader>
          <CardContent className="min-h-96">
            {challans.isLoading ? (
              <Rows />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="h-10 border-b text-xs uppercase text-muted-foreground">
                      <th>Number</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Created</th>
                      <th>PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challans.data?.data.map((challan) => (
                      <tr key={challan.id} className="h-14 border-b last:border-0">
                        <td className="font-medium">{challan.challanNumber}</td>
                        <td>{challan.customer.businessName}</td>
                        <td>
                          <Badge tone={challan.status === "CONFIRMED" ? "green" : challan.status === "DRAFT" ? "blue" : "red"}>
                            {challan.status}
                          </Badge>
                        </td>
                        <td>{challan.totalQty}</td>
                        <td>{money(challan.totalAmount)}</td>
                        <td>{challan.createdAt.slice(0, 10)}</td>
                        <td>
                          <Button variant="ghost" size="icon" aria-label="Download PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

const Rows = () => (
  <div className="w-full min-w-[820px]">
    <div className="flex h-10 w-full items-center border-b">
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex h-14 w-full items-center border-b last:border-0">
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);
