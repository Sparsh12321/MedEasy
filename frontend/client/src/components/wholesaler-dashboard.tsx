import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Users, Clock, DollarSign, Repeat, Eye } from "lucide-react";
import Header from "@/components/header"; // adjust path if needed

interface WholesalerStats {
  activeRetailers: number;
  pendingOrders: number;
  monthlyRevenue: number;
  stockTurnover: number;
  recentRequests: any[];
  orders?: any[];
  inventory?: any[];
}

export default function WholesalerDashboard() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery<WholesalerStats>({
    queryKey: ["wholesaler-dashboard", userId],
    enabled: !!userId, // only run when we have a userId
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/dashboard/wholesaler/${userId}`);
      if (!res.ok) {
        throw new Error("Failed to load wholesaler dashboard stats from Mongo backend");
      }
      return res.json();
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
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

    try {
      const res = await fetch("http://localhost:3000/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: row.medicineId,
          quantity: nextQty, // EXACT value user entered
          userRole: "wholesaler",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update stock");
      }

      const data = await res.json();
      
      // Immediately refetch to show updated value
      await queryClient.invalidateQueries({ queryKey: ["wholesaler-dashboard", userId] });
      await refetch();
      
      window.alert(`Stock updated to ${nextQty} units successfully!`);
    } catch (err) {
      console.error(err);
      window.alert("Failed to update stock. Please try again.");
    }
  }

  async function handleApproveReject(requestId: string, status: "approved" | "rejected") {
    try {
      const res = await fetch(`http://localhost:3000/reorder-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${status} request`);
      }

      // Immediately refetch to show updated pending count and remove approved request from list
      await queryClient.invalidateQueries({ queryKey: ["wholesaler-dashboard", userId] });
      await refetch();
      
      // Also invalidate retailer dashboards so they see updated stock
      // (We don't know which retailer, so we invalidate all retailer queries)
      queryClient.invalidateQueries({ queryKey: ["retailer-dashboard"] });
      
      window.alert(`Request ${status} successfully. Stock has been updated.`);
    } catch (err) {
      console.error(err);
      window.alert(`Failed to ${status} request. Please try again.`);
    }
  }

  async function handleViewOrderDetails(orderId: string) {
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch order details");
      }
      const order = await res.json();
      setSelectedOrder(order);
      setIsDetailsOpen(true);
    } catch (err) {
      console.error(err);
      window.alert("Failed to load order details. Please try again.");
    }
  }

  async function handleApproveRejectOrder(orderId: string, status: "approved" | "rejected") {
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${status} order`);
      }

      await queryClient.invalidateQueries({ queryKey: ["wholesaler-dashboard", userId] });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["retailer-dashboard"] });
      
      setIsDetailsOpen(false);
      setSelectedOrder(null);
      
      window.alert(`Order ${status} successfully. Stock has been updated.`);
    } catch (err) {
      console.error(err);
      window.alert(`Failed to ${status} order. Please try again.`);
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            You are not logged in. Please log in as a wholesaler to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-6 animate-pulse" data-testid="loading-wholesaler-dashboard">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 p-6 rounded-xl h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="p-6" data-testid="wholesaler-dashboard">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl" data-testid="card-active-retailers">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Retailers</p>
                <p
                  className="text-2xl font-bold text-primary"
                  data-testid="text-active-retailers"
                >
                  {stats?.activeRetailers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl" data-testid="card-pending-orders">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p
                  className="text-2xl font-bold text-accent"
                  data-testid="text-pending-orders"
                >
                  {stats?.pendingOrders || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-accent" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl" data-testid="card-monthly-revenue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p
                  className="text-2xl font-bold text-secondary"
                  data-testid="text-monthly-revenue"
                >
                  ₹{stats?.monthlyRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-secondary" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl" data-testid="card-stock-turnover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Turnover</p>
                <p
                  className="text-2xl font-bold text-purple-600"
                  data-testid="text-stock-turnover"
                >
                  {stats?.stockTurnover || 0}%
                </p>
              </div>
              <Repeat className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Retailer Reorder Requests (includes both single medicine requests and multi-medicine orders) */}
          <div data-testid="section-retailer-orders">
            <h3 className="text-xl font-semibold mb-4">Retailer Reorder Requests</h3>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recent Requests</h4>
                </div>
              </div>

              <div className="space-y-0" data-testid="orders-list">
                {(!stats?.recentRequests || stats.recentRequests.length === 0) && (
                  <div className="p-4 text-sm text-muted-foreground">
                    No pending reorder requests.
                  </div>
                )}

                {stats?.recentRequests?.map((request: any) => (
                  <div className="p-4 border-b" key={request.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium" data-testid="text-retailer-name">
                          {request.retailerEmail || "Unknown retailer"}
                        </p>
                        {request.type === "reorder_request" && request.medicine && (
                          <p className="text-sm text-muted-foreground" data-testid="text-medicine">
                            {request.medicine.name} • {request.medicine.manufacturer} • Qty: {request.quantity}
                          </p>
                        )}
                        {request.type === "order" && request.items && (
                          <p className="text-sm text-muted-foreground" data-testid="text-order-info">
                            {request.items.length} medicine(s) • ₹{request.totalAmount?.toLocaleString() || 0}
                          </p>
                        )}
                        <p
                          className="text-xs text-muted-foreground"
                          data-testid="text-order-id"
                        >
                          {request.type === "order" ? "Order" : "Request"} #{request.requestNumber || request.id.slice(-8)}
                        </p>
                      </div>
                      <Badge
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                        data-testid={`badge-status-${request.status}`}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    {request.type === "reorder_request" && (
                      <div
                        className="text-sm text-muted-foreground mb-3"
                        data-testid="text-order-summary"
                      >
                        {request.quantity} units requested
                      </div>
                    )}
                    {request.status === "pending" && (
                      <div className="flex space-x-2">
                        {request.type === "order" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleViewOrderDetails(request.id)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        )}
                        <Button
                          className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90"
                          data-testid="button-approve"
                          onClick={() => {
                            if (request.type === "order") {
                              handleApproveRejectOrder(request.id, "approved");
                            } else {
                              handleApproveReject(request.id, "approved");
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="border border-border px-3 py-1 rounded text-xs hover:bg-muted"
                          data-testid="button-reject"
                          onClick={() => {
                            if (request.type === "order") {
                              handleApproveRejectOrder(request.id, "rejected");
                            } else {
                              handleApproveReject(request.id, "rejected");
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Inventory Management */}
          <div data-testid="section-bulk-inventory">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Bulk Inventory Management</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs"
              >
                Refresh
              </Button>
            </div>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b">
                <Input
                  type="text"
                  placeholder="Search inventory..."
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                              className="text-primary hover:underline text-sm p-0"
                              data-testid="button-update"
                              onClick={() => handleUpdateStock(row)}
                            >
                              Update
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
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View all medicines and quantities in this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Retailer</p>
                  <p className="text-base">{selectedOrder.retailerEmail || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Status</p>
                  <Badge
                    className={
                      selectedOrder.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedOrder.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-base font-semibold">₹{selectedOrder.totalAmount?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                  <p className="text-base">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Medicines Ordered</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Medicine</th>
                        <th className="p-3 text-left text-sm font-medium">Manufacturer</th>
                        <th className="p-3 text-right text-sm font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{item.medicineName || "Unknown"}</td>
                          <td className="p-3 text-muted-foreground">
                            {item.medicineManufacturer || "—"}
                          </td>
                          <td className="p-3 text-right font-medium">{item.quantity} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder.status === "pending" && (
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => handleApproveRejectOrder(selectedOrder.id, "approved")}
                    className="flex-1"
                  >
                    Approve Order
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleApproveRejectOrder(selectedOrder.id, "rejected")}
                    className="flex-1"
                  >
                    Reject Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
