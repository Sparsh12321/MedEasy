import { Link } from "react-router-dom";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
     
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div>
            <p className="text-sm font-medium text-primary mb-2">
              Welcome to MedEasy
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Smarter way to manage{" "}
              <span className="text-primary">medicines & orders</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              MedEasy connects consumers, retailers, and wholesalers with
              real‑time medicine availability, nearby stores, and seamless
              ordering — all in one dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Create consumer account
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-left mt-8">
            <div className="p-4 rounded-lg border bg-card">
              <p className="font-semibold mb-1 text-sm">Consumers</p>
              <p className="text-xs text-muted-foreground">
                Search medicines, find nearby stores, and track your orders.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="font-semibold mb-1 text-sm">Retailers</p>
              <p className="text-xs text-muted-foreground">
                Manage inventory, low‑stock alerts, and reorder requests.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="font-semibold mb-1 text-sm">Wholesalers</p>
              <p className="text-xs text-muted-foreground">
                View retailer orders, bulk inventory, and key performance stats.
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Partners can log in via{" "}
            <Link to="/login/wholesaleretail">
              <span className="text-primary underline">Retailer / Wholesaler login</span>
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}


