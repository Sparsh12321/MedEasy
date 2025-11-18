import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  ShoppingCart, 
  User, 
  Grid,
  ChevronDown,
  Pill,
  TestTube,
  Video,
  Clipboard
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-6">
            <span className="flex items-center" data-testid="phone-number">
              <Phone className="w-4 h-4 mr-1" />
              1800-123-4567
            </span>
            <span className="flex items-center" data-testid="email-address">
              <Mail className="w-4 h-4 mr-1" />
              support@medeasy.com
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-primary" data-testid="link-track-order">Track Order</a>
            <a href="#" className="hover:text-primary" data-testid="link-find-store">Find Store</a>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary" data-testid="logo">
              Med<span className="text-secondary">Easy</span>
            </Link>
          </div>
          
          {/* Location */}
          <div className="hidden md:flex items-center bg-muted px-3 py-2 rounded-lg cursor-pointer hover:bg-muted/80" data-testid="location-selector">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <div className="text-sm">
              <div className="font-medium">Deliver to</div>
              <div className="text-muted-foreground">Delhi, 110001</div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search for medicines, health products..." 
                className="w-full px-4 py-3 pl-12 pr-24 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                data-testid="input-search"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                onClick={handleSearch}
                data-testid="button-search"
              >
                Search
              </Button>
            </div>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="relative p-2 hover:bg-muted rounded-lg" data-testid="button-cart">
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="badge-cart-count">
                3
              </Badge>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2" data-testid="button-sign-in">
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        {/* <nav className="flex items-center space-x-8 py-3 border-t border-border">
          <div className="relative group">
            <Button variant="ghost" className="flex items-center space-x-1 py-2 hover:text-primary font-medium" data-testid="button-categories">
              <Grid className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <Link href="/search?category=medicine" className={`py-2 hover:text-primary font-medium ${location.includes('search') ? 'text-primary' : ''}`} data-testid="link-medicine">
            Medicine
          </Link>
          <a href="#" className="py-2 hover:text-primary font-medium" data-testid="link-health-products">Health Products</a>
          <a href="#" className="py-2 hover:text-primary font-medium" data-testid="link-lab-tests">Lab Tests</a>
          <a href="#" className="py-2 hover:text-primary font-medium" data-testid="link-consult-doctor">Consult Doctor</a>
          <a href="#" className="py-2 hover:text-primary font-medium" data-testid="link-health-packages">Health Packages</a>
        </nav> */}
      </div>
    </header>
  );
}
