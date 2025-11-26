import { useState } from "react";
import Header from "@/components/header";
import ConsumerDashboard from "@/components/consumer-dashboard";
import RetailerDashboard from "@/components/retailer-dashboard";
import WholesalerDashboard from "@/components/wholesaler-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Store, 
  Building, 
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Package
} from "lucide-react";

type UserRole = "consumer" | "retailer" | "wholesaler";

export default function Dashboard() {
  const [activeRole, setActiveRole] = useState<UserRole>("consumer");
  
  // Mock user data - in a real app, this would come from authentication context
  const mockUserData = {
    consumer: { userId: "consumer1", name: "John Doe" },
    retailer: { storeId: "store1", name: "MedPlus Pharmacy" },
    wholesaler: { userId: "wholesaler1", name: "ABC Pharmaceuticals" }
  };

  const roleConfig = {
    consumer: {
      icon: User,
      title: "Consumer Dashboard",
      description: "Manage your orders and find nearby medicines",
      color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    retailer: {
      icon: Store,
      title: "Retailer Dashboard", 
      description: "Manage inventory and track sales",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    wholesaler: {
      icon: Building,
      title: "Wholesaler Dashboard",
      description: "Manage bulk orders and retailer requests", 
      color: "bg-purple-50 text-purple-600 border-purple-200"
    }
  };

  const renderDashboard = () => {
    switch (activeRole) {
      case "consumer":
        return <ConsumerDashboard userId={mockUserData.consumer.userId} />;
      case "retailer":
        return <RetailerDashboard storeId={mockUserData.retailer.storeId} />;
      case "wholesaler":
        return <WholesalerDashboard userId={mockUserData.wholesaler.userId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8" data-testid="dashboard-header">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
                MedEasy Dashboard
              </h1>
              <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
                Manage your medicines and orders efficiently
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-user-name">
                {mockUserData[activeRole].name}
              </span>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {React.createElement(roleConfig[activeRole].icon, { className: "w-6 h-6 text-primary" })}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="grid md:grid-cols-3 gap-4 mb-8" data-testid="role-selection">
            {(Object.keys(roleConfig) as UserRole[]).map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              const isActive = activeRole === role;
              
              return (
                <Card 
                  key={role}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isActive ? 'ring-2 ring-primary border-primary' : 'border-border'
                  }`}
                  onClick={() => setActiveRole(role)}
                  data-testid={`card-role-${role}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg" data-testid={`text-role-title-${role}`}>
                          {config.title.split(' ')[0]}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-role-description-${role}`}>
                          {config.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-3 h-3 bg-primary rounded-full" data-testid={`indicator-active-${role}`}></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Dashboard Content */}
        <Card className="shadow-lg overflow-hidden" data-testid="dashboard-content">
          {/* Dashboard Navigation Header */}
          <div className="gradient-bg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-active-dashboard-title">
                  {roleConfig[activeRole].title}
                </h2>
                <p className="opacity-90" data-testid="text-active-dashboard-description">
                  {roleConfig[activeRole].description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm opacity-75" data-testid="text-active-user-name">
                  {mockUserData[activeRole].name}
                </span>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {React.createElement(roleConfig[activeRole].icon, { className: "w-6 h-6" })}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content Area */}
          <div data-testid={`dashboard-${activeRole}`}>
            {renderDashboard()}
          </div>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-40" data-testid="mobile-nav">
        <div className="flex items-center justify-around py-2">
          <a href="/" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-home">
            <Package className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a href="/search" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-search">
            <MapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </a>
          <div className="flex flex-col items-center py-2 px-3 text-primary" data-testid="mobile-nav-dashboard">
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </div>
          <a href="#" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-cart">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </div>
            <span className="text-xs mt-1">Cart</span>
          </a>
          <a href="#" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-more">
            <Building className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </a>
        </div>
      </div>
    </div>
  );
}
