// src/components/medicine-card.tsx
import type React from "react";

type RetailerEntry = {
  retailerName: string;
  quantity: number;
};

export type AggregatedMedicine = {
  id: string;
  medicineName: string;
  brand: string;
  image: string;
  retailers: RetailerEntry[];
};

type Props = {
  medicine: AggregatedMedicine;
};

const MedicineCard: React.FC<Props> = ({ medicine }) => {
  return (
    <div
      className="border border-gray-200 rounded-lg p-3 shadow-sm"
    >
      <img
        src={medicine.image}
        alt={medicine.medicineName}
        className="w-full h-40 object-cover rounded-md mb-2"
      />
      <h3 className="font-semibold text-base mb-1">
        {medicine.medicineName}
      </h3>
      <p className="text-sm text-gray-600">
        Brand: <span className="font-semibold">{medicine.brand}</span>
      </p>

      <p className="mt-2 text-sm font-semibold">Available at:</p>
      <ul className="text-sm max-h-24 overflow-y-auto pl-4">
        {medicine.retailers.map((r) => (
          <li key={r.retailerName}>
            {r.retailerName} (Qty: {r.quantity})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicineCard;
