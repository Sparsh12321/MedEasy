import { useState, useEffect } from "react";
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
  LogOut,
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // 🔹 location state
  const [locationLabel, setLocationLabel] = useState<string>("Detecting...");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");

    if (storedUserId && storedRole) {
      setIsLoggedIn(true);
      setUserRole(storedRole);
      setUserEmail(storedEmail);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserEmail(null);
    }
  }, []);

// 🔹 detect + reverse-geocode + store user location
useEffect(() => {
  const savedLat = localStorage.getItem("userLat");
  const savedLng = localStorage.getItem("userLng");
  const savedLabel = localStorage.getItem("userLocationLabel");

  // If saved location exists → use it
  if (savedLat && savedLng && savedLabel) {
    setLat(parseFloat(savedLat));
    setLng(parseFloat(savedLng));
    setLocationLabel(savedLabel);
    return;
  }

  // Detect location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setLat(latitude);
        setLng(longitude);

        try {
          // 🔥 Reverse geocode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const data = await res.json();
          
          const placeName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.state ||
            "Your Location";

          setLocationLabel(placeName);

          // Save for future visits
          localStorage.setItem("userLat", latitude.toString());
          localStorage.setItem("userLng", longitude.toString());
          localStorage.setItem("userLocationLabel", placeName);

        } catch (err) {
          console.error("Reverse geocoding failed", err);
          setLocationLabel("Your Location");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationLabel("Set location");
      }
    );
  } else {
    setLocationLabel("Location unavailable");
  }
}, []);


  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div>
            <Link href="/" className="text-2xl font-bold text-primary">
              Med<span className="text-secondary">Easy</span>
            </Link>
          </div>

          {/* 🔹 Dynamic Location */}
          <div className="hidden md:flex items-center bg-muted px-3 py-2 rounded-lg cursor-pointer">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <div className="text-sm">
              <div className="font-medium">Deliver to</div>
              <div className="text-muted-foreground">
                {locationLabel}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <Input
              type="text"
              placeholder="Search for medicines, health products..."
              className="w-full px-4 py-3 pl-12 pr-24"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Button variant="ghost" className="relative p-2 hover:bg-muted rounded-lg">
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* Sign in / User state */}
            {!isLoggedIn ? (
              <Link href="/login">
                <Button variant="outline" className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-3 bg-muted px-3 py-2 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <div className="font-medium">
                    {userEmail || "Logged in user"}
                  </div>
                  {userRole && (
                    <div className="text-xs capitalize text-muted-foreground">
                      {userRole}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-red-500 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
