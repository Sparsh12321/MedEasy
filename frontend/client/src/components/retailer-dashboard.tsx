import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingUp, RefreshCw, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "./header";

interface RetailerStats {
  totalItems: number;
  lowStock: number;
  todaySales: number;
  pendingReorders: number;
  inventory: any[];
  lowStockItems: any[];
  reorderRequests?: any[];
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

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats, isLoading, refetch } = useQuery<RetailerStats>({
    queryKey: ["retailer-dashboard", effectiveStoreId],
    queryFn: async () => {
      const id = effectiveStoreId || "all";
      const res = await fetch(`http://localhost:3000/dashboard/retailer/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load retailer stats from Mongo backend");
      }
      return res.json();
    },
    enabled: !!effectiveStoreId, // don't run query until we have an id
    refetchInterval: 5000, // Auto-refresh every 5 seconds to show approved stock updates
  });

  const inventory = (stats?.inventory ?? []) as any[];

  // Aggregate by medicine so the same medicine from multiple sources
  // doesn't appear as many separate, repetitive rows in the table.
  // Use the FIRST value found instead of summing to prevent inflated numbers
  const aggregatedMap: Record<string, any> = {};
  for (const item of inventory) {
    const key = item.medicineId || item.medicine?.id;
    if (!key) continue;

    if (!aggregatedMap[key]) {
      aggregatedMap[key] = { ...item };
    } else {
      // Don't sum quantities - use the first value found
      // This ensures the displayed value matches what was set, not a sum
      // aggregatedMap[key].quantity = (aggregatedMap[key].quantity ?? 0) + (item.quantity ?? 0);

      const statusOrder: Record<string, number> = {
        out_of_stock: 2,
        low_stock: 1,
        in_stock: 0,
      };
      const currentStatus = aggregatedMap[key].status || "in_stock";
      const newStatus = item.status || "in_stock";
      if ((statusOrder[newStatus] ?? 0) > (statusOrder[currentStatus] ?? 0)) {
        aggregatedMap[key].status = newStatus;
      }
    }
  }

  const aggregatedInventory = Object.values(aggregatedMap);

  const filteredInventory = aggregatedInventory.filter((item: any) => {
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
      // Call Mongo-backed backend to update quantity - set EXACT value entered
      const res = await fetch("http://localhost:3000/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: row.medicineId,
          quantity: nextQty, // EXACT value user entered
          userRole: "retailer",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update stock");
      }

      const data = await res.json();
      
      // Immediately refetch to show updated value
      await queryClient.invalidateQueries({ queryKey: ["retailer-dashboard", effectiveStoreId] });
      await refetch();
      
      window.alert(`Stock updated to ${nextQty} units successfully!`);
    } catch (err) {
      console.error(err);
      window.alert("Failed to update stock. Please try again.");
    }
  }

  function handleReorder(row: any) {
    const currentQty = row.quantity ?? 0;
    const input = window.prompt(
      `Reorder quantity for ${row.medicine?.name || "this medicine"}:`,
      String(Math.max(1, Math.min(currentQty || 10, 100))),
    );
    if (!input) return;
    const qty = Number(input);
    if (Number.isNaN(qty) || qty <= 0) {
      window.alert("Please enter a valid positive number.");
      return;
    }

    const retailerUserId =
      typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";
    if (!retailerUserId) {
      window.alert("Retailer user id not found. Please log in again.");
      return;
    }

    fetch("http://localhost:3000/reorder-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retailerUserId,
        medicineId: row.medicineId,
        quantity: qty, // EXACT quantity user entered
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to create reorder request");
        const data = await res.json();
        
        // Immediately refetch to show the new reorder request in the list
        await queryClient.invalidateQueries({
          queryKey: ["retailer-dashboard", effectiveStoreId],
        });
        await refetch();
        
        window.alert(`Reorder request for ${qty} units created successfully!`);
      })
      .catch((err) => {
        console.error(err);
        window.alert("Failed to create reorder request. Please try again.");
      });
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Inventory Management</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
          <div className="mb-4">
            <Button
              onClick={() => navigate("/create-order")}
              className="bg-primary text-primary-foreground"
              size="default"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </div>
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

        {/* Reorder Requests (Mongo-backed) */}
        <div data-testid="section-reorder-requests">
          <h3 className="text-xl font-semibold mb-4">Reorder Requests</h3>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Recent Requests</h4>
              </div>
            </div>

            <div className="space-y-0" data-testid="orders-list">
              {(!stats?.reorderRequests || stats.reorderRequests.length === 0) && (
                <div className="p-4 text-sm text-muted-foreground">
                  No reorder requests yet. Use the "Reorder" button in the inventory table or "Create Order" to create one.
                </div>
              )}

              {stats?.reorderRequests?.map((req: any) => (
                <div className="p-4 border-b" key={req.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium" data-testid="text-request-id">
                        {req.type === "order" ? "Order" : "Request"} #{req.requestNumber || req.id.slice(-8)}
                      </p>
                      {req.type === "reorder_request" && req.medicine && (
                        <p className="text-sm text-muted-foreground" data-testid="text-medicine">
                          {req.medicine.name} • {req.medicine.manufacturer} • Qty: {req.quantity}
                        </p>
                      )}
                      {req.type === "order" && req.items && (
                        <p className="text-sm text-muted-foreground" data-testid="text-order-info">
                          {req.items.length} medicine(s) • ₹{req.totalAmount?.toLocaleString() || 0}
                        </p>
                      )}
                      <p
                        className="text-xs text-muted-foreground"
                        data-testid="text-request-date"
                      >
                        {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      data-testid={`badge-${req.status}`}
                    >
                      {req.status}
                    </Badge>
                  </div>
                  {req.type === "reorder_request" && (
                    <div
                      className="text-sm text-muted-foreground mb-3"
                      data-testid="text-order-summary"
                    >
                      {req.quantity} units requested
                    </div>
                  )}
                  {req.type === "order" && req.items && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Medicines:</p>
                      <ul className="space-y-1">
                        {req.items.map((item: any, idx: number) => (
                          <li key={idx} className="text-xs text-muted-foreground">
                            • {item.medicineName} ({item.medicineManufacturer}) - Qty: {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
