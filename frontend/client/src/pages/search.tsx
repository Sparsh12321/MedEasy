// src/pages/search.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/header";
import MedicineCard, {
  AggregatedMedicine,
} from "@/components/medicine-card";

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
  Latitude: number;
  Longitude: number;
  Medicines: Medicine[];
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [allMedicines, setAllMedicines] = useState<AggregatedMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 React to changes in ?q=
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  // Fetch + aggregate medicines once
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
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
                (r) => r.retailerName === retailer.Name
              );
              if (!already) existing.retailers.push(retailerEntry);
            }
          });
        });

        setAllMedicines(Array.from(map.values()));
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const filteredMedicines = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return allMedicines;
    const q = trimmed.toLowerCase();
    return allMedicines.filter(
      (m) =>
        m.medicineName.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q)
    );
  }, [allMedicines, query]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Search Results</h1>
          <p className="text-sm text-muted-foreground">
            {query
              ? `Showing results for “${query}”`
              : "Showing all medicines"}
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading medicines...</p>
        ) : filteredMedicines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No medicines found matching “{query}”.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedicines.map((m) => (
              <MedicineCard key={m.id} medicine={m} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
