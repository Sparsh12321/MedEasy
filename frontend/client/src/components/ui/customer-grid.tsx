// src/components/customer-medicines-grid.tsx
import React, { useEffect, useState } from "react";
import MedicineCard, { AggregatedMedicine } from "../medicine-card";

type MedicineInfo = {
  _id: string;
  Medicine_name: string;
  Brand: string;
  Image: string;
};

type Medicine = {
  _id: string;
  Medicine_name: MedicineInfo;
  Quantity: number;
};

type Retailer = {
  _id: string;
  Name: string;
  Latitude: number;   // ⭐ ensure your API returns these
  Longitude: number;  // ⭐
  Medicines: Medicine[];
};

const RADIUS_KM = 1000; // “good radius” – change if you like

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CustomerMedicinesGrid: React.FC = () => {
  const [medicines, setMedicines] = useState<AggregatedMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/customerMedicines");
        const data: Retailer[] = await res.json();

        // 🔹 user location from localStorage
        const latStr = localStorage.getItem("userLat");
        const lngStr = localStorage.getItem("userLng");
        const userLat = latStr ? parseFloat(latStr) : null;
        const userLng = lngStr ? parseFloat(lngStr) : null;
        const hasLocation = userLat !== null && userLng !== null;

        const map = new Map<string, AggregatedMedicine>();

        data.forEach((retailer) => {
          retailer.Medicines.forEach((med) => {
            const m = med.Medicine_name;
            if (!m?.Medicine_name) return;

            // If we have user location, compute distance
            let distance: number | undefined = undefined;
            if (
              hasLocation &&
              typeof retailer.Latitude === "number" &&
              typeof retailer.Longitude === "number"
            ) {
              distance = distanceKm(
                userLat as number,
                userLng as number,
                retailer.Latitude,
                retailer.Longitude
              );
              // skip this retailer if outside radius
              if (distance > RADIUS_KM) return;
            }

            const key = m.Medicine_name.trim().toLowerCase();

            const retailerEntry = {
              retailerName: retailer.Name,
              quantity: med.Quantity ?? 0,
              distanceKm: distance,
            };

            const existing = map.get(key);

            if (!existing) {
              map.set(key, {
                id: key,
                medicineName: m.Medicine_name.trim(),
                brand: m.Brand,
                image:
                  m.Image || "https://via.placeholder.com/150?text=No+Image",
                retailers: [retailerEntry],
              });
            } else {
              const already = existing.retailers.some(
                (r) => r.retailerName === retailer.Name,
              );
              if (!already) existing.retailers.push(retailerEntry);
            }
          });
        });

        let aggregated = Array.from(map.values());

        // If we have location, you might want to drop medicines
        // that end up with zero nearby retailers.
        if (latStr && lngStr) {
          aggregated = aggregated.filter((m) => m.retailers.length > 0);
        }

        setMedicines(aggregated);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  if (loading) return <p>Loading medicines...</p>;

  if (medicines.length === 0)
    return (
      <p className="text-sm text-gray-500">
        No medicines found in nearby stores. Try changing your location or
        radius.
      </p>
    );

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {medicines.map((m) => (
        <MedicineCard key={m.id} medicine={m} />
      ))}
    </div>
  );
};

export default CustomerMedicinesGrid;
