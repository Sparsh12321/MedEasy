// src/components/medicine-card.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type RetailerEntry = {
  retailerName: string;
  quantity: number;
  distanceKm?: number;
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
  const [open, setOpen] = useState(false);

  const storeCount = medicine.retailers.length;

  return (
    <>
      {/* Main card */}
      <div className="border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col">
        <img
          src={medicine.image}
          alt={medicine.medicineName}
          className="w-full h-40 object-cover rounded-md mb-2"
        />
        <h3 className="font-semibold text-base mb-1 line-clamp-2">
          {medicine.medicineName}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Brand: <span className="font-semibold">{medicine.brand}</span>
        </p>

        <p className="text-xs text-gray-500 mb-3">
          {storeCount === 0
            ? "Not available in nearby stores within the selected radius."
            : `Available in ${storeCount} nearby ${
                storeCount === 1 ? "store" : "stores"
              }`}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="mt-auto"
          disabled={storeCount === 0}
          onClick={() => setOpen(true)}
        >
          {storeCount === 0 ? "No Nearby Stores" : "View Availability"}
        </Button>
      </div>

      {/* Modal with full availability details */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{medicine.medicineName}</DialogTitle>
            <DialogDescription>
              Brand: <span className="font-medium">{medicine.brand}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 mb-4">
            <img
              src={medicine.image}
              alt={medicine.medicineName}
              className="w-24 h-24 object-cover rounded-md border"
            />
            <div className="text-sm text-muted-foreground flex flex-col justify-center">
              <p>
                This medicine is currently available in{" "}
                <span className="font-semibold text-foreground">
                  {storeCount}{" "}
                  {storeCount === 1 ? "store" : "stores"}
                </span>{" "}
                near your location.
              </p>
              <p className="mt-1">
                Quantities and approximate distance are listed below.
              </p>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-3">
            {medicine.retailers.map((r, idx) => (
              <div
                key={`${r.retailerName}-${idx}`}
                className="border border-gray-200 rounded-md px-3 py-2 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium">{r.retailerName}</p>
                  <p className="text-xs text-gray-500">
                    Qty available:{" "}
                    <span className="font-semibold">{r.quantity}</span>
                  </p>
                </div>
                {typeof r.distanceKm === "number" && (
                  <p className="text-xs text-gray-600">
                    ~{r.distanceKm.toFixed(1)} km
                  </p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicineCard;
