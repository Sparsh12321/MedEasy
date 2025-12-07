import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Retailer = {
  _id: string;
  Name: string;
  Latitude: number;
  Longitude: number;
};

type StoreMapModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLat: number | null;
  userLng: number | null;
};

const defaultCenter: [number, number] = [22.9734, 78.6569]; // India center fallback

// Fix for default Leaflet marker icons in bundlers
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = L.icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/64/64113.png", // any user / location icon
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function StoreMapModal({
  open,
  onOpenChange,
  userLat,
  userLng,
}: StoreMapModalProps) {
  const { data: retailers, isLoading } = useQuery<Retailer[]>({
    queryKey: ["/api/customerMedicines"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/customerMedicines");
      if (!res.ok) throw new Error("Failed to fetch retailers");
      return res.json();
    },
    enabled: open, // only fetch when modal is open
  });

  const center: [number, number] =
    userLat !== null && userLng !== null
      ? [userLat, userLng]
      : defaultCenter;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Nearby Stores
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Showing all pharmacies from your dataset on the map.
          </p>
        </DialogHeader>

        <div className="h-[500px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Loading stores on map...
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User location marker */}
              {userLat !== null && userLng !== null && (
                <Marker
                  position={[userLat, userLng]}
                  icon={userIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>Your Location</strong>
                      <br />
                      {userLat.toFixed(4)}, {userLng.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Store markers */}
              {retailers?.map((store) => (
                <Marker
                  key={store._id}
                  position={[store.Latitude, store.Longitude]}
                  icon={defaultIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{store.Name}</strong>
                      <br />
                      Lat: {store.Latitude.toFixed(4)}, Lng:{" "}
                      {store.Longitude.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
