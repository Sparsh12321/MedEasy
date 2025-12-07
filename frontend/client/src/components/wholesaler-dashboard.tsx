import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, DollarSign, Repeat } from "lucide-react";
import Header from "@/components/header"; // adjust path if needed

interface WholesalerStats {
  activeRetailers: number;
  pendingOrders: number;
  monthlyRevenue: number;
  stockTurnover: number;
  recentRequests: any[];
}

export default function WholesalerDashboard() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const { data: stats, isLoading } = useQuery<WholesalerStats>({
    // Use the global QueryClient default fetcher so this matches the
    // existing `/api/dashboard/wholesaler/:userId` route in `server/routes.ts`.
    queryKey: ["/api/dashboard/wholesaler", userId],
    enabled: !!userId, // only run when we have a userId
  });

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
          {/* Retailer Orders */}
          <div data-testid="section-retailer-orders">
            <h3 className="text-xl font-semibold mb-4">Retailer Order Requests</h3>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recent Orders</h4>
                  <Button
                    variant="link"
                    className="text-primary hover:underline text-sm p-0"
                    data-testid="button-view-all-orders"
                    onClick={() =>
                      window.alert(
                        "This would take you to a full orders list. You can wire it to a dedicated /orders page.",
                      )
                    }
                  >
                    View All
                  </Button>
                </div>
              </div>

              <div className="space-y-0" data-testid="orders-list">
                <div className="p-4 border-b" data-testid="order-wo2024045">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium" data-testid="text-retailer-name">
                        MedPlus Pharmacy
                      </p>
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid="text-order-id"
                      >
                        Order #WO2024045
                      </p>
                    </div>
                    <Badge
                      className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium"
                      data-testid="badge-pending"
                    >
                      Pending
                    </Badge>
                  </div>
                  <div
                    className="text-sm text-muted-foreground mb-3"
                    data-testid="text-order-summary"
                  >
                    25 items • ₹18,750
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90"
                      data-testid="button-approve"
                      onClick={() => window.alert("Order approved (demo only).")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-border px-3 py-1 rounded text-xs hover:bg-muted"
                      data-testid="button-review"
                      onClick={() =>
                        window.alert("Here you could open order details for review (demo only).")
                      }
                    >
                      Review
                    </Button>
                  </div>
                </div>

                <div className="p-4 border-b" data-testid="order-wo2024046">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium" data-testid="text-retailer-name">
                        Apollo Pharmacy
                      </p>
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid="text-order-id"
                      >
                        Order #WO2024046
                      </p>
                    </div>
                    <Badge
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                      data-testid="badge-approved"
                    >
                      Approved
                    </Badge>
                  </div>
                  <div
                    className="text-sm text-muted-foreground mb-3"
                    data-testid="text-order-summary"
                  >
                    12 items • ₹8,450
                  </div>
                  <Button
                    variant="link"
                    className="text-primary hover:underline text-xs font-medium p-0"
                    data-testid="button-track-shipment"
                    onClick={() =>
                      window.alert("This would show shipment tracking information (demo only).")
                    }
                  >
                    Track Shipment
                  </Button>
                </div>

                <div className="p-4" data-testid="order-wo2024047">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium" data-testid="text-retailer-name">
                        HealthPlus Store
                      </p>
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid="text-order-id"
                      >
                        Order #WO2024047
                      </p>
                    </div>
                    <Badge
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                      data-testid="badge-in-transit"
                    >
                      In Transit
                    </Badge>
                  </div>
                  <div
                    className="text-sm text-muted-foreground mb-3"
                    data-testid="text-order-summary"
                  >
                    30 items • ₹22,100
                  </div>
                  <Button
                    variant="link"
                    className="text-primary hover:underline text-xs font-medium p-0"
                    data-testid="button-view-details"
                    onClick={() =>
                      window.alert("This would open a detailed view of the order (demo only).")
                    }
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Inventory */}
          <div data-testid="section-bulk-inventory">
            <h3 className="text-xl font-semibold mb-4">Bulk Inventory Overview</h3>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="space-y-4" data-testid="inventory-categories">
                <div
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  data-testid="category-cold-cough"
                >
                  <div>
                    <p className="font-medium" data-testid="text-category-name">
                      Cold & Cough Medicines
                    </p>
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="text-category-skus"
                    >
                      45 SKUs available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary" data-testid="text-stock-value">
                      ₹1,25,000
                    </p>
                    <p className="text-sm text-muted-foreground">Stock Value</p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  data-testid="category-vitamins"
                >
                  <div>
                    <p className="font-medium" data-testid="text-category-name">
                      Vitamins & Supplements
                    </p>
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="text-category-skus"
                    >
                      32 SKUs available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary" data-testid="text-stock-value">
                      ₹89,500
                    </p>
                    <p className="text-sm text-muted-foreground">Stock Value</p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  data-testid="category-diabetic"
                >
                  <div>
                    <p className="font-medium" data-testid="text-category-name">
                      Diabetic Care
                    </p>
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="text-category-skus"
                    >
                      28 SKUs available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary" data-testid="text-stock-value">
                      ₹76,200
                    </p>
                    <p className="text-sm text-muted-foreground">Stock Value</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  data-testid="button-manage-inventory"
                  onClick={() =>
                    window.alert(
                      "This would navigate to a bulk inventory management screen (demo only).",
                    )
                  }
                >
                  Manage All Inventory
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
