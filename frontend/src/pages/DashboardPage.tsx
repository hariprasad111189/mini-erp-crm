import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, ClipboardList, Users } from "lucide-react";
import { challansApi, customersApi, productsApi } from "@/api/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/utils";

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [customers, products, lowStock, challans] = await Promise.all([
        customersApi.list(),
        productsApi.list(),
        productsApi.lowStock(),
        challansApi.list()
      ]);
      return { customers, products, lowStock, challans };
    }
  });

  const confirmedRevenue =
    data?.challans.data
      .filter((challan) => challan.status === "CONFIRMED")
      .reduce((sum, challan) => sum + Number(challan.totalAmount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground">CRM, inventory, and sales challan health at a glance.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Customers" value={data?.customers.meta.total} isLoading={isLoading} tone="blue" />
        <Metric icon={Boxes} label="Products" value={data?.products.meta.total} isLoading={isLoading} tone="green" />
        <Metric icon={AlertTriangle} label="Low Stock" value={data?.lowStock.length} isLoading={isLoading} tone="amber" />
        <Metric
          icon={ClipboardList}
          label="Confirmed Value"
          value={money(confirmedRevenue)}
          isLoading={isLoading}
          tone="red"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low-Stock Notifications</CardTitle>
          </CardHeader>
          <CardContent className="min-h-64">
            {isLoading ? (
              <Rows />
            ) : data?.lowStock.length ? (
              <div className="space-y-3">
                {data.lowStock.map((product) => (
                  <div key={product.id} className="flex h-14 items-center justify-between rounded-md border px-3">
                    <div>
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <Badge tone="amber">
                      {product.currentStock} / {product.minStockAlertQty}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No products are below alert threshold.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Challans</CardTitle>
          </CardHeader>
          <CardContent className="min-h-64">
            {isLoading ? (
              <Rows />
            ) : (
              <div className="space-y-3">
                {data?.challans.data.slice(0, 5).map((challan) => (
                  <div key={challan.id} className="flex h-14 items-center justify-between rounded-md border px-3">
                    <div>
                      <p className="text-sm font-semibold">{challan.challanNumber}</p>
                      <p className="text-xs text-muted-foreground">{challan.customer.businessName}</p>
                    </div>
                    <Badge tone={challan.status === "CONFIRMED" ? "green" : challan.status === "DRAFT" ? "blue" : "red"}>
                      {challan.status}
                    </Badge>
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

const Metric = ({
  icon: Icon,
  label,
  value,
  isLoading,
  tone
}: {
  icon: typeof Users;
  label: string;
  value?: number | string;
  isLoading: boolean;
  tone: "blue" | "green" | "amber" | "red";
}) => (
  <Card>
    <CardContent className="flex h-28 items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {isLoading ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="mt-2 text-2xl font-bold">{value}</p>}
      </div>
      <div
        className={{
          blue: "bg-sky-50 text-sky-700",
          green: "bg-emerald-50 text-emerald-700",
          amber: "bg-amber-50 text-amber-700",
          red: "bg-red-50 text-red-700"
        }[tone] + " flex h-11 w-11 items-center justify-center rounded-md"}
      >
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

const Rows = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-14 w-full" />
    ))}
  </div>
);

