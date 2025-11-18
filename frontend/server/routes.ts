import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicineSchema, insertInventorySchema, insertOrderSchema, insertReorderRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Medicines
  app.get("/api/medicines", async (req, res) => {
    try {
      const { category, search } = req.query;
      let medicines;

      if (search) {
        medicines = await storage.searchMedicines(search as string);
      } else if (category) {
        medicines = await storage.getMedicinesByCategory(category as string);
      } else {
        medicines = await storage.getMedicines();
      }

      res.json(medicines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medicines" });
    }
  });

  app.get("/api/medicines/:id", async (req, res) => {
    try {
      const medicine = await storage.getMedicineById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medicine" });
    }
  });

  app.post("/api/medicines", async (req, res) => {
    try {
      const validatedData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(validatedData);
      res.status(201).json(medicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid medicine data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create medicine" });
    }
  });

  // Stores
  app.get("/api/stores", async (req, res) => {
    try {
      const { location, owner } = req.query;
      let stores;

      if (location) {
        stores = await storage.getStoresByLocation(location as string);
      } else if (owner) {
        stores = await storage.getStoresByOwner(owner as string);
      } else {
        stores = await storage.getStores();
      }

      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.get("/api/stores/:id", async (req, res) => {
    try {
      const store = await storage.getStoreById(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch store" });
    }
  });

  // Inventory
  app.get("/api/stores/:storeId/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventoryByStore(req.params.storeId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/medicines/:medicineId/availability", async (req, res) => {
    try {
      const availability = await storage.getInventoryByMedicine(req.params.medicineId);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medicine availability" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const inventory = await storage.updateInventory(validatedData);
      res.json(inventory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid inventory data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update inventory" });
    }
  });

  app.get("/api/stores/:storeId/low-stock", async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems(req.params.storeId);
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/customers/:customerId/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomer(req.params.customerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer orders" });
    }
  });

  app.get("/api/stores/:storeId/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByStore(req.params.storeId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch store orders" });
    }
  });

  app.patch("/api/orders/:orderId/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.orderId, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Reorder Requests
  app.post("/api/reorder-requests", async (req, res) => {
    try {
      const validatedData = insertReorderRequestSchema.parse(req.body);
      const request = await storage.createReorderRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid reorder request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create reorder request" });
    }
  });

  app.get("/api/retailers/:retailerId/reorder-requests", async (req, res) => {
    try {
      const requests = await storage.getReorderRequestsByRetailer(req.params.retailerId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retailer reorder requests" });
    }
  });

  app.get("/api/wholesalers/:wholesalerId/reorder-requests", async (req, res) => {
    try {
      const requests = await storage.getReorderRequestsByWholesaler(req.params.wholesalerId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wholesaler reorder requests" });
    }
  });

  app.patch("/api/reorder-requests/:requestId/status", async (req, res) => {
    try {
      const { status } = req.body;
      const request = await storage.updateReorderStatus(req.params.requestId, status);
      if (!request) {
        return res.status(404).json({ error: "Reorder request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reorder request status" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/consumer/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomer(req.params.userId);
      const nearbyStores = await storage.getStoresByLocation("Delhi");
      
      const stats = {
        totalOrders: orders.length,
        nearbyStores: nearbyStores.length,
        savings: orders.reduce((total, order) => total + parseFloat(order.discount || "0"), 0),
        recentOrders: orders.slice(0, 5)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consumer dashboard data" });
    }
  });

  app.get("/api/dashboard/retailer/:storeId", async (req, res) => {
    try {
      const inventory = await storage.getInventoryByStore(req.params.storeId);
      const lowStock = await storage.getLowStockItems(req.params.storeId);
      const orders = await storage.getOrdersByStore(req.params.storeId);
      
      const todaySales = orders
        .filter(order => {
          const today = new Date();
          const orderDate = new Date(order.createdAt!);
          return orderDate.toDateString() === today.toDateString();
        })
        .reduce((total, order) => total + parseFloat(order.totalAmount), 0);

      const stats = {
        totalItems: inventory.length,
        lowStock: lowStock.length,
        todaySales,
        pendingReorders: 12, // Mock data
        inventory: inventory.slice(0, 10),
        lowStockItems: lowStock
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retailer dashboard data" });
    }
  });

  app.get("/api/dashboard/wholesaler/:userId", async (req, res) => {
    try {
      const retailers = await storage.getUsersByRole("retailer");
      const requests = await storage.getReorderRequestsByWholesaler(req.params.userId);
      
      const stats = {
        activeRetailers: retailers.length,
        pendingOrders: requests.filter(r => r.status === "pending").length,
        monthlyRevenue: 245000, // Mock data
        stockTurnover: 85, // Mock data
        recentRequests: requests.slice(0, 10)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wholesaler dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
