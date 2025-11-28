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
  Medicines: Medicine[];
};

const CustomerMedicinesGrid: React.FC = () => {
  const [medicines, setMedicines] = useState<AggregatedMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/customerMedicines");
        const data: Retailer[] = await res.json();

        const map = new Map<string, AggregatedMedicine>();

        data.forEach((retailer) => {
          retailer.Medicines.forEach((med) => {
            const m = med.Medicine_name;
            if (!m?.Medicine_name) return;

            const key = m.Medicine_name.trim().toLowerCase();

            const retailerEntry = {
              retailerName: retailer.Name,
              quantity: med.Quantity ?? 0,
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

        setMedicines(Array.from(map.values()));
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  if (loading) return <p>Loading medicines...</p>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {medicines.map((m) => (
        <MedicineCard key={m.id} medicine={m} />
      ))}
    </div>
  );
};

export default CustomerMedicinesGrid;
