import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import type { MedicineWithInventory } from "@shared/schema";

interface MedicineCardProps {
  medicine: MedicineWithInventory;
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getStockStatus = () => {
    if (!medicine.inventory || medicine.inventory.length === 0) {
      return { status: 'out_of_stock', label: 'Out of Stock', className: 'stock-out' };
    }
    
    const totalStock = medicine.inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    if (totalStock === 0) {
      return { status: 'out_of_stock', label: 'Out of Stock', className: 'stock-out' };
    } else if (totalStock < 20) {
      return { status: 'low_stock', label: 'Low Stock', className: 'stock-low' };
    }
    return { status: 'in_stock', label: 'In Stock', className: 'stock-in' };
  };

  const stockInfo = getStockStatus();
  const discount = medicine.discount || 0;
  const isOutOfStock = stockInfo.status === 'out_of_stock';

  return (
    <div className="medicine-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden" data-testid={`card-medicine-${medicine.id}`}>
      <img 
        src={medicine.image || 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'} 
        alt={medicine.name} 
        className="w-full h-48 object-cover" 
        data-testid={`img-medicine-${medicine.id}`}
      />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1" data-testid={`text-medicine-name-${medicine.id}`}>
              {medicine.name}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid={`text-manufacturer-${medicine.id}`}>
              {medicine.manufacturer}
            </p>
          </div>
          <Badge 
            className={`${stockInfo.className} text-white text-xs px-2 py-1 rounded-full`}
            data-testid={`badge-stock-${medicine.id}`}
          >
            {stockInfo.label}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary" data-testid={`text-price-${medicine.id}`}>
              ₹{medicine.price}
            </span>
            {discount > 0 && (
              <span className="text-sm text-muted-foreground line-through ml-2" data-testid={`text-mrp-${medicine.id}`}>
                ₹{medicine.mrp}
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="text-sm text-secondary font-semibold" data-testid={`text-discount-${medicine.id}`}>
              {discount}% OFF
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            className={`flex-1 ${isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'} py-2 px-4 rounded-lg transition-colors`}
            disabled={isOutOfStock}
            data-testid={`button-add-cart-${medicine.id}`}
          >
            {isOutOfStock ? 'Notify When Available' : 'Add to Cart'}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className={`p-2 border border-border rounded-lg hover:bg-muted transition-colors ${isWishlisted ? 'bg-red-50 text-red-600' : ''}`}
            onClick={() => setIsWishlisted(!isWishlisted)}
            data-testid={`button-wishlist-${medicine.id}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
