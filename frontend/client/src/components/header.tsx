import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  User,
  LogOut,
} from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [locationLabel, setLocationLabel] = useState<string>("Detecting...");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // --------------------------
  // Auth state
  // --------------------------
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

  // --------------------------
  // Detect + reverse geocode location
  // --------------------------
  useEffect(() => {
    const savedLat = localStorage.getItem("userLat");
    const savedLng = localStorage.getItem("userLng");
    const savedLabel = localStorage.getItem("userLocationLabel");

    if (savedLat && savedLng && savedLabel) {
      setLat(parseFloat(savedLat));
      setLng(parseFloat(savedLng));
      setLocationLabel(savedLabel);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLat(latitude);
          setLng(longitude);

          try {
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

            localStorage.setItem("userLat", latitude.toString());
            localStorage.setItem("userLng", longitude.toString());
            localStorage.setItem("userLocationLabel", placeName);
          } catch {
            setLocationLabel("Your Location");
          }
        },
        () => {
          setLocationLabel("Set location");
        }
      );
    } else {
      setLocationLabel("Location unavailable");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --------------------------
  // SEARCH LOGIC (final)
  // --------------------------
  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) {
      navigate("/"); // stay / return to home when empty
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); // typing only updates state, does NOT navigate
  };

  // --------------------------
  // UI
  // --------------------------
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between py-4">
          
          {/* Logo */}
          <div>
            <Link to="/dashboard" className="text-2xl font-bold text-primary">
              Med<span className="text-secondary">Easy</span>
            </Link>
          </div>

          {/* Location */}
          <div className="hidden md:flex items-center bg-muted px-3 py-2 rounded-lg cursor-pointer">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <div className="text-sm">
              <div className="font-medium">Deliver to</div>
              <div className="text-muted-foreground">{locationLabel}</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <Input
              type="text"
              placeholder="Search for medicines..."
              className="w-full px-4 py-3 pl-12 pr-24"
              value={searchQuery}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />

            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary"
              type="button"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <Link to="/login">
                <Button variant="outline" className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-3 bg-muted px-3 py-2 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <div className="font-medium">{userEmail}</div>
                  <div className="text-xs capitalize text-muted-foreground">
                    {userRole}
                  </div>
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
