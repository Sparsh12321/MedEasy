import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MapPin, TrendingDown } from "lucide-react";

interface ConsumerStats {
  totalOrders: number;
  nearbyStores: number;
  savings: number;
  recentOrders: any[];
}

interface ConsumerDashboardProps {
  userId: string;
}

export default function ConsumerDashboard({ userId }: ConsumerDashboardProps) {
  const { data: stats, isLoading } = useQuery<ConsumerStats>({
    queryKey: ['/api/dashboard/consumer', userId],
  });

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse" data-testid="loading-consumer-dashboard">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-200 p-6 rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="consumer-dashboard">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl" data-testid="card-total-orders">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-total-orders">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-xl" data-testid="card-nearby-stores">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Nearby Stores</p>
              <p className="text-2xl font-bold text-secondary" data-testid="text-nearby-stores">
                {stats?.nearbyStores || 0}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-secondary" />
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-xl" data-testid="card-savings">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Savings This Month</p>
              <p className="text-2xl font-bold text-accent" data-testid="text-savings">
                ₹{stats?.savings || 0}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-accent" />
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Medicine Search */}
        <div data-testid="section-medicine-search">
          <h3 className="text-xl font-semibold mb-4">Find Medicine Near You</h3>
          <div className="bg-muted/50 p-6 rounded-xl">
            <div className="space-y-4">
              <Input 
                type="text" 
                placeholder="Search medicine name..." 
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="input-medicine-search"
              />
              <Button 
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                data-testid="button-search-nearby"
              >
                Search Nearby Stores
              </Button>
            </div>
            
            <div className="mt-6 space-y-3" data-testid="nearby-stores-list">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border" data-testid="store-medplus">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium" data-testid="text-store-name">MedPlus Pharmacy</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-store-distance">0.8 km away</p>
                  </div>
                </div>
                <Badge className="text-sm font-medium text-green-600 bg-green-100" data-testid="badge-available">
                  Available
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border" data-testid="store-apollo">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium" data-testid="text-store-name">Apollo Pharmacy</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-store-distance">1.2 km away</p>
                  </div>
                </div>
                <Badge className="text-sm font-medium text-yellow-600 bg-yellow-100" data-testid="badge-low-stock">
                  Low Stock
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div data-testid="section-recent-orders">
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {stats?.recentOrders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="empty-orders">
                No orders yet
              </div>
            ) : (
              <>
                <div className="bg-white border border-border rounded-xl p-4" data-testid="order-me2024001">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium" data-testid="text-order-id">Order #ME2024001</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-order-date">March 15, 2024</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-delivered">
                      Delivered
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2" data-testid="text-order-summary">3 items • ₹245</div>
                  <Button variant="link" className="text-primary hover:underline text-sm font-medium p-0" data-testid="button-view-details">
                    View Details
                  </Button>
                </div>
                
                <div className="bg-white border border-border rounded-xl p-4" data-testid="order-me2024002">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium" data-testid="text-order-id">Order #ME2024002</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-order-date">March 18, 2024</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-in-transit">
                      In Transit
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2" data-testid="text-order-summary">5 items • ₹450</div>
                  <Button variant="link" className="text-primary hover:underline text-sm font-medium p-0" data-testid="button-track-order">
                    Track Order
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
