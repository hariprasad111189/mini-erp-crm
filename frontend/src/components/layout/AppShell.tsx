import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Bell, Boxes, ClipboardList, LogOut, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { productsApi } from "@/api/endpoints";
import type { Product, Role } from "@/api/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof BarChart3;
  roles: Role[];
}> = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "SALES", "ACCOUNTS"] },
  { href: "/products", label: "Inventory", icon: Boxes, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
  { href: "/challans", label: "Challans", icon: ClipboardList, roles: ["ADMIN", "SALES", "ACCOUNTS"] }
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { session, logout } = useAuth();
  const role = session?.user.role;
  const visibleNav = navItems.filter((item) => (role ? item.roles.includes(role) : false));
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const items = await productsApi.lowStock();
        if (!cancelled) setLowStock(items);
      } catch {
        // Global axios interceptor surfaces the error toast.
      }
    };

    void poll();
    const intervalId = window.setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-16 items-center border-b px-5">
          <div>
            <p className="text-sm font-semibold text-sky-700">Fundsweb</p>
            <h1 className="text-base font-bold">Mini ERP + CRM</h1>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600",
                  isActive ? "bg-sky-50 text-sky-800" : "hover:bg-muted"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{session?.user.role}</p>
            <p className="text-sm font-semibold">{session?.user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                aria-label="Low stock alerts"
                onClick={() => setBellOpen((open) => !open)}
              >
                <Bell className="h-4 w-4" />
                {lowStock.length > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {lowStock.length}
                  </span>
                ) : null}
              </Button>
              {bellOpen ? (
                <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white p-3 shadow-lg">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Low stock ({lowStock.length})
                  </p>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {lowStock.length ? (
                      lowStock.map((product) => (
                        <div key={product.id} className="flex h-12 items-center justify-between rounded-md border px-2 text-sm">
                          <span className="truncate font-medium">{product.name}</span>
                          <span className="text-amber-700">
                            {product.currentStock}/{product.minStockAlertQty}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No low-stock products.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};
