import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import Header from "./header";

interface RetailerStats {
  totalItems: number;
  lowStock: number;
  todaySales: number;
  pendingReorders: number;
  inventory: any[];
  lowStockItems: any[];
}

// storeId is now OPTIONAL – if not passed, we read from localStorage
interface RetailerDashboardProps {
  storeId?: string;
}

export default function RetailerDashboard({ storeId }: RetailerDashboardProps) {
  // prefer prop (when used inside main MedEasy Dashboard),
  // otherwise fall back to logged-in user id from localStorage
  const effectiveStoreId =
    storeId || (typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "");

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats, isLoading } = useQuery<RetailerStats>({
    queryKey: ["/api/dashboard/retailer", effectiveStoreId],
    // if you have a global fetcher in queryClient, no queryFn needed;
    // otherwise uncomment and adjust the URL:
    // queryFn: async () => {
    //   const res = await fetch(
    //     `http://localhost:3000/api/dashboard/retailer?storeId=${effectiveStoreId}`
    //   );
    //   if (!res.ok) throw new Error("Failed to load retailer stats");
    //   return res.json();
    // },
    enabled: !!effectiveStoreId, // don't run query until we have an id
  });

  const inventory = (stats?.inventory ?? []) as any[];
  const filteredInventory = inventory.filter((item) => {
    const name = item.medicine?.name || "";
    const manufacturer = item.medicine?.manufacturer || "";
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || manufacturer.toLowerCase().includes(q);
  });

  async function handleUpdateStock(row: any) {
    const currentQty = row.quantity ?? 0;
    const input = window.prompt(
      `Update stock for ${row.medicine?.name || "this medicine"}:`,
      String(currentQty),
    );
    if (!input) return;
    const nextQty = Number(input);
    if (Number.isNaN(nextQty) || nextQty < 0) {
      window.alert("Please enter a valid non‑negative number.");
      return;
    }

    const reorderLevel = row.reorderLevel ?? 10;
    let status: string = "in_stock";
    if (nextQty === 0) status = "out_of_stock";
    else if (nextQty <= reorderLevel) status = "low_stock";

    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: row.storeId || effectiveStoreId,
          medicineId: row.medicineId,
          quantity: nextQty,
          reorderLevel,
          status,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/retailer", effectiveStoreId] });
    } catch (err) {
      console.error(err);
      window.alert("Failed to update stock. Please try again.");
    }
  }

  function handleReorder(row: any) {
    window.alert(
      `Reorder request for "${row.medicine?.name || "this medicine"}" would be created here.\n\n` +
        "You can later wire this to /api/reorder-requests.",
    );
  }

  if (!effectiveStoreId) {
    // user opened /retailer without login
    return (
      <div className="p-6">
        <Header />
        <p className="text-sm text-red-600">
          Retailer not logged in. Please log in as a retailer to view this dashboard.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse" data-testid="loading-retailer-dashboard">
        <Header />
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 p-6 rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="retailer-dashboard">
      <Header />

      {/* Top stat cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl" data-testid="card-total-items">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Stock Items</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-total-items">
                {stats?.totalItems || 0}
              </p>
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl" data-testid="card-low-stock">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600" data-testid="text-low-stock">
                {stats?.lowStock || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl" data-testid="card-today-sales">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Sales</p>
              <p className="text-2xl font-bold text-secondary" data-testid="text-today-sales">
                ₹{stats?.todaySales || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl" data-testid="card-pending-reorders">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Reorders</p>
              <p
                className="text-2xl font-bold text-purple-600"
                data-testid="text-pending-reorders"
              >
                {stats?.pendingReorders || 0}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inventory Management */}
        <div data-testid="section-inventory">
          <h3 className="text-xl font-semibold mb-4">Inventory Management</h3>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Input
                  type="text"
                  placeholder="Search inventory..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg mr-4"
                  data-testid="input-inventory-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                  data-testid="button-add-stock"
                >
                  Add Stock
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto" data-testid="inventory-table">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 font-medium">Medicine</th>
                    <th className="p-3 font-medium">Current Stock</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-sm text-muted-foreground">
                        No inventory items match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((row) => (
                      <tr className="border-b" key={row.id ?? row.medicineId}>
                        <td className="p-3">
                          <div>
                            <p className="font-medium" data-testid="text-medicine-name">
                              {row.medicine?.name ?? "Unnamed medicine"}
                            </p>
                            <p
                              className="text-sm text-muted-foreground"
                              data-testid="text-manufacturer"
                            >
                              {row.medicine?.manufacturer ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="p-3" data-testid="text-stock">
                          {row.quantity ?? 0} units
                        </td>
                        <td className="p-3">
                          <Badge
                            className="text-white text-xs px-2 py-1 rounded-full"
                            data-testid={
                              row.status === "out_of_stock"
                                ? "badge-out-of-stock"
                                : row.status === "low_stock"
                                ? "badge-low-stock"
                                : "badge-in-stock"
                            }
                          >
                            {row.status === "out_of_stock"
                              ? "Out of Stock"
                              : row.status === "low_stock"
                              ? "Low Stock"
                              : "In Stock"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button
                            variant="link"
                            className="text-primary hover:underline text-sm mr-3 p-0"
                            data-testid="button-update"
                            onClick={() => handleUpdateStock(row)}
                          >
                            Update
                          </Button>
                          <Button
                            variant="link"
                            className="text-accent hover:underline text-sm p-0"
                            data-testid="button-reorder"
                            onClick={() => handleReorder(row)}
                          >
                            Reorder
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reorder Requests */}
        <div data-testid="section-reorder-requests">
          <h3 className="text-xl font-semibold mb-4">Reorder Requests</h3>
          <div className="space-y-4">
            <div
              className="bg-white border border-border rounded-xl p-4"
              data-testid="request-rr2024001"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium" data-testid="text-request-id">
                    Request #RR2024001
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="text-request-date"
                  >
                    March 20, 2024
                  </p>
                </div>
                <Badge
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                  data-testid="badge-pending"
                >
                  Pending
                </Badge>
              </div>
              <div
                className="text-sm text-muted-foreground mb-2"
                data-testid="text-request-summary"
              >
                15 items • Estimated ₹12,450
              </div>
              <div className="flex space-x-2">
                <Button
                  className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
                  data-testid="button-confirm-order"
                >
                  Confirm Order
                </Button>
                <Button
                  variant="outline"
                  className="border border-border px-3 py-1 rounded text-sm hover:bg-muted"
                  data-testid="button-edit-request"
                >
                  Edit Request
                </Button>
              </div>
            </div>

            <div
              className="bg-white border border-border rounded-xl p-4"
              data-testid="request-rr2024002"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium" data-testid="text-request-id">
                    Request #RR2024002
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="text-request-date"
                  >
                    March 18, 2024
                  </p>
                </div>
                <Badge
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  data-testid="badge-approved"
                >
                  Approved
                </Badge>
              </div>
              <div
                className="text-sm text-muted-foreground mb-2"
                data-testid="text-request-summary"
              >
                8 items • ₹6,780
              </div>
              <Button
                variant="link"
                className="text-primary hover:underline text-sm font-medium p-0"
                data-testid="button-track-delivery"
              >
                Track Delivery
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
