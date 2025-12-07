import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, ShoppingCart } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  image?: string;
}

interface Wholesaler {
  id: string;
  name: string;
}

interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const retailerUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Fetch all medicines for dropdown from backend
  const { data: medicinesData } = useQuery<Medicine[]>({
    queryKey: ["medicines-list"],
    queryFn: async () => {
      // Fetch from backend MongoDB
      const res = await fetch("http://localhost:3000/retailers");
      if (!res.ok) {
        throw new Error("Failed to fetch medicines");
      }
      const retailers = await res.json();
      
      // Extract unique medicines from all retailers
      const medicineMap = new Map<string, Medicine>();
      retailers.forEach((retailer: any) => {
        retailer.Medicines?.forEach((medEntry: any) => {
          const med = medEntry.Medicine_name;
          if (med && !medicineMap.has(med._id.toString())) {
            medicineMap.set(med._id.toString(), {
              id: med._id.toString(),
              name: med.Medicine_name,
              manufacturer: med.Brand,
              image: med.Image,
            });
          }
        });
      });
      
      return Array.from(medicineMap.values());
    },
  });

  // Fetch all wholesalers for dropdown
  const { data: wholesalersData } = useQuery<Wholesaler[]>({
    queryKey: ["wholesalers-list"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/wholesalers");
      if (!res.ok) {
        throw new Error("Failed to fetch wholesalers");
      }
      const wholesalers = await res.json();
      // Map to expected format: {id, name}
      return wholesalers.map((w: any) => ({
        id: w._id.toString(),
        name: w.Name || "Unknown Wholesaler",
      }));
    },
  });

  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [selectedWholesalerId, setSelectedWholesalerId] = useState<string>("");

  const medicines = medicinesData || [];

  const handleAddItem = () => {
    if (!selectedMedicineId || !quantity || Number(quantity) <= 0) {
      window.alert("Please select a medicine and enter a valid quantity.");
      return;
    }

    const medicine = medicines.find((m) => m.id === selectedMedicineId);
    if (!medicine) return;

    // Check if medicine already added
    if (selectedItems.find((item) => item.medicineId === selectedMedicineId)) {
      window.alert("This medicine is already in your order. Update the quantity instead.");
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        medicineId: selectedMedicineId,
        medicineName: medicine.name,
        quantity: Number(quantity),
      },
    ]);

    setSelectedMedicineId("");
    setQuantity("");
  };

  const handleRemoveItem = (medicineId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.medicineId !== medicineId));
  };

  const handleUpdateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(medicineId);
      return;
    }
    setSelectedItems(
      selectedItems.map((item) =>
        item.medicineId === medicineId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      window.alert("Please add at least one medicine to your order.");
      return;
    }

    if (!selectedWholesalerId) {
      window.alert("Please select a wholesaler for this order.");
      return;
    }

    if (!retailerUserId) {
      window.alert("Retailer user id not found. Please log in again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerUserId,
          wholesalerId: selectedWholesalerId,
          items: selectedItems.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();
      
      // Invalidate queries so wholesaler dashboard shows the new order
      queryClient.invalidateQueries({ queryKey: ["wholesaler-dashboard"] });
      
      window.alert(`Order placed successfully! Order ID: ${data._id}`);
      navigate("/retailer");
    } catch (err) {
      console.error(err);
      window.alert("Failed to place order. Please try again.");
    }
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.quantity * 100, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="p-6" data-testid="create-order-page">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Create Order</h1>
              <p className="text-muted-foreground">
                Select medicines and quantities to place an order
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/retailer")}>
              Back to Dashboard
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Add Medicines */}
            <Card>
              <CardHeader>
                <CardTitle>Add Medicines to Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Wholesaler</label>
                  <Select value={selectedWholesalerId} onValueChange={setSelectedWholesalerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a wholesaler..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(wholesalersData || []).map((wholesaler) => (
                        <SelectItem key={wholesaler.id} value={wholesaler.id}>
                          {wholesaler.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Medicine</label>
                  <select
                    value={selectedMedicineId}
                    onChange={(e) => setSelectedMedicineId(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="">Choose a medicine...</option>
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name} - {medicine.manufacturer}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddItem} className="w-full" disabled={!selectedMedicineId || !quantity}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Order
                </Button>
              </CardContent>
            </Card>

            {/* Right: Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medicines added yet</p>
                    <p className="text-sm">Add medicines from the left panel</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedItems.map((item) => (
                        <div
                          key={item.medicineId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.medicineName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.medicineId, Number(e.target.value))
                                }
                                className="w-20 h-8 text-sm"
                              />
                              <span className="text-sm text-muted-foreground">units</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.medicineId)}
                            className="ml-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Items:</span>
                        <span className="font-medium">{totalItems} units</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Amount:</span>
                        <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button onClick={handlePlaceOrder} className="w-full" size="lg">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Place Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

