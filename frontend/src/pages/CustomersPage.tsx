import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Search, UserPlus, X } from "lucide-react";
import { customersApi, type CustomerInput } from "@/api/endpoints";
import type { Customer } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

const emptyCustomerForm: CustomerInput = {
  name: "",
  businessName: "",
  mobile: "",
  email: "",
  gstNumber: "",
  address: "",
  customerType: "RETAIL",
  status: "LEAD",
  followUpDate: null,
  notes: ""
};

export const CustomersPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const canCreate = session?.user.role === "ADMIN" || session?.user.role === "SALES";
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerInput>(emptyCustomerForm);
  const [message, setMessage] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => customersApi.list({ search: search || undefined })
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        gstNumber: form.gstNumber || null,
        followUpDate: form.followUpDate || null,
        notes: form.notes || null
      };
      return editingCustomer
        ? customersApi.update(editingCustomer.id, payload)
        : customersApi.create(payload);
    },
    onSuccess: async () => {
      setMessage(editingCustomer ? "Customer updated live." : "Customer created live.");
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => setMessage("Customer save failed. Check all mandatory fields.")
  });

  const resetForm = () => {
    setCreateOpen(false);
    setEditingCustomer(null);
    setForm(emptyCustomerForm);
  };

  const startCreate = () => {
    setMessage("");
    setEditingCustomer(null);
    setForm(emptyCustomerForm);
    setCreateOpen(true);
  };

  const startEdit = (customer: Customer) => {
    setMessage("");
    setCreateOpen(true);
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      businessName: customer.businessName,
      mobile: customer.mobile,
      email: customer.email,
      gstNumber: customer.gstNumber ?? "",
      address: customer.address,
      customerType: customer.customerType,
      status: customer.status,
      followUpDate: customer.followUpDate ? customer.followUpDate.slice(0, 10) : null,
      notes: customer.notes ?? ""
    });
  };

  const isFormValid =
    form.name.trim().length >= 2 &&
    form.businessName.trim().length >= 2 &&
    form.mobile.trim().length >= 7 &&
    form.email.trim().length > 0 &&
    form.address.trim().length >= 5 &&
    form.customerType.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">Search CRM accounts and follow the sales pipeline.</p>
        </div>
        {canCreate ? (
          <Button onClick={startCreate}>
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        ) : null}
      </div>

      {canCreate && createOpen ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{editingCustomer ? "Edit Customer" : "Create Customer"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm} aria-label="Close customer form">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (isFormValid) saveMutation.mutate();
              }}
            >
              <Field label="Customer Name" required>
                <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </Field>
              <Field label="Business Name" required>
                <Input
                  required
                  value={form.businessName}
                  onChange={(event) => setForm({ ...form, businessName: event.target.value })}
                />
              </Field>
              <Field label="Mobile" required>
                <Input required value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
              </Field>
              <Field label="Email" required>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </Field>
              <Field label="GST Number" required>
                <Input value={form.gstNumber ?? ""} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} />
              </Field>
              <Field label="Address" required>
                <Input required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </Field>
              <Field label="Customer Type" required>
                <Select
                  required
                  value={form.customerType}
                  onChange={(event) => setForm({ ...form, customerType: event.target.value as CustomerInput["customerType"] })}
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as CustomerInput["status"] })}
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </Field>
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
                <Button type="submit" disabled={!isFormValid || saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving" : editingCustomer ? "Update Customer" : "Create Customer"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {message ? <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <div className="relative mt-3 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, mobile, email, business"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="min-h-96">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="h-10 border-b text-xs uppercase text-muted-foreground">
                    <th>Customer</th>
                    <th>Business</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>GST</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Status</th>
                    {canCreate ? <th>Edit</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((customer) => (
                    <tr key={customer.id} className="h-14 border-b last:border-0">
                      <td className="font-medium">{customer.name}</td>
                      <td>{customer.businessName}</td>
                      <td>{customer.mobile}</td>
                      <td>{customer.email}</td>
                      <td>{customer.gstNumber || "Not set"}</td>
                      <td>{customer.address}</td>
                      <td>{customer.customerType}</td>
                      <td>
                        <Badge tone={customer.status === "ACTIVE" ? "green" : customer.status === "LEAD" ? "blue" : "neutral"}>
                          {customer.status}
                        </Badge>
                      </td>
                      {canCreate ? (
                        <td>
                          <Button variant="ghost" size="icon" onClick={() => startEdit(customer)} aria-label="Edit customer">
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
    </div>
  );
};

const TableSkeleton = () => (
  <div className="w-full min-w-[760px]">
    <div className="flex h-10 w-full items-center border-b">
      <Skeleton className="h-3 w-28" />
    </div>
    <div className="space-y-0">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex h-14 w-full items-center border-b last:border-0">
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
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
