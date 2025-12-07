import { 
  type User, type InsertUser, type Medicine, type InsertMedicine, 
  type Category, type Store, type Inventory, type InsertInventory,
  type Order, type InsertOrder, type OrderItem, type ReorderRequest, 
  type InsertReorderRequest, type ReorderItem, type MedicineWithInventory,
  type OrderWithItems, type StoreWithInventory, type ReorderRequestWithItems
} from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: "consumer" | "retailer" | "wholesaler"): Promise<User[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;

  // Medicine operations
  getMedicines(): Promise<Medicine[]>;
  getMedicineById(id: string): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  searchMedicines(query: string): Promise<MedicineWithInventory[]>;
  getMedicinesByCategory(categoryId: string): Promise<Medicine[]>;

  // Store operations
  getStores(): Promise<Store[]>;
  getStoreById(id: string): Promise<Store | undefined>;
  getStoresByLocation(location: string): Promise<Store[]>;
  getStoresByOwner(ownerId: string): Promise<Store[]>;

  // Inventory operations
  getInventoryByStore(storeId: string): Promise<(Inventory & { medicine: Medicine })[]>;
  updateInventory(inventory: InsertInventory): Promise<Inventory>;
  getInventoryByMedicine(medicineId: string): Promise<(Inventory & { store: Store })[]>;
  getLowStockItems(storeId: string): Promise<(Inventory & { medicine: Medicine })[]>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByCustomer(customerId: string): Promise<OrderWithItems[]>;
  getOrdersByStore(storeId: string): Promise<OrderWithItems[]>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;

  // Reorder operations
  createReorderRequest(request: InsertReorderRequest): Promise<ReorderRequest>;
  getReorderRequestsByRetailer(retailerId: string): Promise<ReorderRequestWithItems[]>;
  getReorderRequestsByWholesaler(wholesalerId: string): Promise<ReorderRequestWithItems[]>;
  updateReorderStatus(requestId: string, status: string): Promise<ReorderRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private medicines: Map<string, Medicine> = new Map();
  private stores: Map<string, Store> = new Map();
  private inventory: Map<string, Inventory> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private reorderRequests: Map<string, ReorderRequest> = new Map();
  private reorderItems: Map<string, ReorderItem> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    try {
      // Read data.json from backend/public/data.json
      // Try multiple possible paths to handle different execution contexts
      const possiblePaths = [
        path.join(__dirname, "../../backend/public/data.json"),
        path.join(process.cwd(), "backend/public/data.json"),
        path.join(process.cwd(), "../backend/public/data.json"),
      ];
      
      let dataJsonPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          dataJsonPath = p;
          break;
        }
      }
      
      if (!dataJsonPath) {
        throw new Error(`data.json not found. Tried: ${possiblePaths.join(", ")}`);
      }
      
      const rawData = fs.readFileSync(dataJsonPath, "utf8");
      const dataJson = JSON.parse(rawData);

      // Initialize categories
      const categoryMap = new Map<string, string>();
      const categories = [
        { id: "cat1", name: "Cold & Cough", description: "Medicines for cold and cough relief", icon: "thermometer", parentId: null },
        { id: "cat2", name: "Heart Care", description: "Cardiovascular medicines", icon: "heart", parentId: null },
        { id: "cat3", name: "Diabetes Care", description: "Diabetic care products", icon: "activity", parentId: null },
        { id: "cat4", name: "Women Care", description: "Women's health products", icon: "user-check", parentId: null },
        { id: "cat5", name: "Vitamins", description: "Vitamins and supplements", icon: "sun", parentId: null },
        { id: "cat6", name: "Baby Care", description: "Baby care products", icon: "shield", parentId: null },
        { id: "cat7", name: "Analgesics", description: "Pain relief medicines", icon: "thermometer", parentId: null },
        { id: "cat8", name: "Antibiotics", description: "Antibiotic medicines", icon: "shield", parentId: null },
        { id: "cat9", name: "Mood Stabilizers", description: "Mood stabilizing medicines", icon: "heart", parentId: null },
        { id: "cat10", name: "Antiseptics", description: "Antiseptic products", icon: "shield", parentId: null },
      ];
      categories.forEach(cat => {
        this.categories.set(cat.id, cat);
        categoryMap.set(cat.name.toLowerCase(), cat.id);
      });

      // Map brand/category to category ID
      const getCategoryId = (brand: string): string => {
        const brandLower = brand.toLowerCase();
        if (brandLower.includes("vitamin") || brandLower.includes("supplement")) return "cat5";
        if (brandLower.includes("analgesic") || brandLower.includes("pain")) return "cat7";
        if (brandLower.includes("antibiotic")) return "cat8";
        if (brandLower.includes("mood") || brandLower.includes("stabilizer")) return "cat9";
        if (brandLower.includes("antiseptic")) return "cat10";
        return "cat1"; // Default to Cold & Cough
      };

      // Extract unique medicines from data.json
      const medicineMap = new Map<string, Medicine>();
      const medicineStoreMap = new Map<string, Set<string>>(); // medicine name -> store IDs

      dataJson.forEach((item: any) => {
        const medicineName = item["Medicine name"]?.trim();
        const brand = item["Source/Brand"]?.trim() || "Unknown";
        const image = item["Image"] || "";
        const retailerName = item["Retailer"]?.trim() || "";

        if (!medicineName) return;

        const medKey = medicineName.toLowerCase();
        if (!medicineMap.has(medKey)) {
          const medId = randomUUID();
          const medicine: Medicine = {
            id: medId,
            name: medicineName,
            manufacturer: brand,
            categoryId: getCategoryId(brand),
            description: `${medicineName} - ${brand}`,
            dosage: "",
            packSize: "",
            mrp: "100.00",
            price: "80.00",
            discount: 20,
            prescription: false,
            image: image,
            createdAt: new Date()
          };
          medicineMap.set(medKey, medicine);
          medicineStoreMap.set(medKey, new Set());
        }
      });

      // Add medicines to storage
      medicineMap.forEach(med => this.medicines.set(med.id, med));

      // Extract unique stores (retailers) from data.json
      const storeMap = new Map<string, Store>();
      const storeInventoryMap = new Map<string, Map<string, number>>(); // store name -> medicine name -> quantity

      dataJson.forEach((item: any) => {
        const retailerName = item["Retailer"]?.trim() || "";
        const medicineName = item["Medicine name"]?.trim() || "";
        const latitude = item["Latitude"];
        const longitude = item["Longitude"];

        if (!retailerName) return;

        if (!storeMap.has(retailerName)) {
          const storeId = randomUUID();
          const store: Store = {
            id: storeId,
            name: retailerName,
            ownerId: `retailer-${storeId}`,
            address: `${retailerName}`,
            location: latitude && longitude ? `${latitude}, ${longitude}` : "Unknown",
            phone: "+91-0000000000",
            license: `LIC-${storeId.substring(0, 8).toUpperCase()}`,
            rating: "4.0",
            isActive: true,
            createdAt: new Date()
          };
          storeMap.set(retailerName, store);
          storeInventoryMap.set(retailerName, new Map());
        }

        // Track which medicines are in which stores
        const storeInv = storeInventoryMap.get(retailerName)!;
        const currentQty = storeInv.get(medicineName) || 0;
        storeInv.set(medicineName, currentQty + 1); // Increment quantity for each occurrence
      });

      // Add stores to storage
      storeMap.forEach(store => this.stores.set(store.id, store));

      // Create inventory entries
      let invCounter = 0;
      storeInventoryMap.forEach((medicineQtyMap, retailerName) => {
        const store = Array.from(storeMap.values()).find(s => s.name === retailerName);
        if (!store) return;

        medicineQtyMap.forEach((quantity, medicineName) => {
          const medKey = medicineName.toLowerCase();
          const medicine = Array.from(medicineMap.values()).find(m => m.name.toLowerCase() === medKey);
          if (!medicine) return;

          // Determine status based on quantity
          const reorderLevel = 10;
          let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
          if (quantity === 0) status = "out_of_stock";
          else if (quantity <= reorderLevel) status = "low_stock";

          const inventory: Inventory = {
            id: randomUUID(),
            storeId: store.id,
            medicineId: medicine.id,
            quantity: quantity,
            reorderLevel: reorderLevel,
            status: status,
            lastUpdated: new Date()
          };
          this.inventory.set(inventory.id, inventory);
          invCounter++;
        });
      });

      console.log(`✅ Loaded ${medicineMap.size} medicines, ${storeMap.size} stores, ${invCounter} inventory items from data.json`);
    } catch (error) {
      console.error("❌ Error loading data.json, falling back to default data:", error);
      // Fallback to default hardcoded data if data.json can't be loaded
      this.initializeDefaultData();
    }
  }

  private initializeDefaultData() {
    // Initialize categories
    const categories = [
      { id: "cat1", name: "Cold & Cough", description: "Medicines for cold and cough relief", icon: "thermometer", parentId: null },
      { id: "cat2", name: "Heart Care", description: "Cardiovascular medicines", icon: "heart", parentId: null },
      { id: "cat3", name: "Diabetes Care", description: "Diabetic care products", icon: "activity", parentId: null },
      { id: "cat4", name: "Women Care", description: "Women's health products", icon: "user-check", parentId: null },
      { id: "cat5", name: "Vitamins", description: "Vitamins and supplements", icon: "sun", parentId: null },
      { id: "cat6", name: "Baby Care", description: "Baby care products", icon: "shield", parentId: null },
    ];
    categories.forEach(cat => this.categories.set(cat.id, cat));

    // Initialize default medicines
    const medicines = [
      {
        id: "med1",
        name: "Paracetamol 500mg",
        manufacturer: "Cipla Ltd",
        categoryId: "cat1",
        description: "Pain relief and fever reducer",
        dosage: "500mg",
        packSize: "10 tablets",
        mrp: "30.00",
        price: "24.00",
        discount: 20,
        prescription: false,
        image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        createdAt: new Date()
      }
    ];
    medicines.forEach(med => this.medicines.set(med.id, med));

    // Initialize default stores
    const stores = [
      {
        id: "store1",
        name: "MedPlus Pharmacy",
        ownerId: "retailer1",
        address: "123 Health Street, Connaught Place",
        location: "Delhi, 110001",
        phone: "+91-9876543210",
        license: "DL-PHARM-2024-001",
        rating: "4.5",
        isActive: true,
        createdAt: new Date()
      }
    ];
    stores.forEach(store => this.stores.set(store.id, store));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getUsersByRole(role: "consumer" | "retailer" | "wholesaler"): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values());
  }

  async getMedicineById(id: string): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const id = randomUUID();
    const medicine: Medicine = { ...insertMedicine, id, createdAt: new Date() };
    this.medicines.set(id, medicine);
    return medicine;
  }

  async searchMedicines(query: string): Promise<MedicineWithInventory[]> {
    const medicines = Array.from(this.medicines.values()).filter(medicine =>
      medicine.name.toLowerCase().includes(query.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(query.toLowerCase())
    );

    return medicines.map(medicine => ({
      ...medicine,
      inventory: Array.from(this.inventory.values()).filter(inv => inv.medicineId === medicine.id),
      category: this.categories.get(medicine.categoryId || "")
    }));
  }

  async getMedicinesByCategory(categoryId: string): Promise<Medicine[]> {
    return Array.from(this.medicines.values()).filter(medicine => medicine.categoryId === categoryId);
  }

  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStoreById(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoresByLocation(location: string): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(store => 
      store.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  async getStoresByOwner(ownerId: string): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(store => store.ownerId === ownerId);
  }

  async getInventoryByStore(storeId: string): Promise<(Inventory & { medicine: Medicine })[]> {
    const storeInventory = Array.from(this.inventory.values()).filter(inv => inv.storeId === storeId);
    return storeInventory.map(inv => ({
      ...inv,
      medicine: this.medicines.get(inv.medicineId!)!
    }));
  }

  async updateInventory(updateData: InsertInventory): Promise<Inventory> {
    const existingInventory = Array.from(this.inventory.values()).find(
      inv => inv.storeId === updateData.storeId && inv.medicineId === updateData.medicineId
    );

    if (existingInventory) {
      const updated = { ...existingInventory, ...updateData, lastUpdated: new Date() };
      this.inventory.set(existingInventory.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newInventory: Inventory = { ...updateData, id, lastUpdated: new Date() };
      this.inventory.set(id, newInventory);
      return newInventory;
    }
  }

  async getInventoryByMedicine(medicineId: string): Promise<(Inventory & { store: Store })[]> {
    const medicineInventory = Array.from(this.inventory.values()).filter(inv => inv.medicineId === medicineId);
    return medicineInventory.map(inv => ({
      ...inv,
      store: this.stores.get(inv.storeId!)!
    })).filter(item => item.store);
  }

  async getLowStockItems(storeId: string): Promise<(Inventory & { medicine: Medicine })[]> {
    const storeInventory = Array.from(this.inventory.values()).filter(
      inv => inv.storeId === storeId && (inv.status === "low_stock" || inv.status === "out_of_stock")
    );
    return storeInventory.map(inv => ({
      ...inv,
      medicine: this.medicines.get(inv.medicineId!)!
    }));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<OrderWithItems[]> {
    const customerOrders = Array.from(this.orders.values()).filter(order => order.customerId === customerId);
    return customerOrders.map(order => ({
      ...order,
      items: Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          medicine: this.medicines.get(item.medicineId!)!
        })),
      store: this.stores.get(order.storeId!)
    }));
  }

  async getOrdersByStore(storeId: string): Promise<OrderWithItems[]> {
    const storeOrders = Array.from(this.orders.values()).filter(order => order.storeId === storeId);
    return storeOrders.map(order => ({
      ...order,
      items: Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          medicine: this.medicines.get(item.medicineId!)!
        })),
      store: this.stores.get(order.storeId!)
    }));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      const updated = { ...order, status: status as any, updatedAt: new Date() };
      this.orders.set(orderId, updated);
      return updated;
    }
    return undefined;
  }

  async createReorderRequest(insertRequest: InsertReorderRequest): Promise<ReorderRequest> {
    const id = randomUUID();
    const request: ReorderRequest = { 
      ...insertRequest, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.reorderRequests.set(id, request);
    return request;
  }

  async getReorderRequestsByRetailer(retailerId: string): Promise<ReorderRequestWithItems[]> {
    const retailerRequests = Array.from(this.reorderRequests.values()).filter(req => req.retailerId === retailerId);
    return retailerRequests.map(request => ({
      ...request,
      items: Array.from(this.reorderItems.values())
        .filter(item => item.requestId === request.id)
        .map(item => ({
          ...item,
          medicine: this.medicines.get(item.medicineId!)!
        })),
      retailer: this.users.get(request.retailerId!),
      wholesaler: this.users.get(request.wholesalerId!)
    }));
  }

  async getReorderRequestsByWholesaler(wholesalerId: string): Promise<ReorderRequestWithItems[]> {
    const wholesalerRequests = Array.from(this.reorderRequests.values()).filter(req => req.wholesalerId === wholesalerId);
    return wholesalerRequests.map(request => ({
      ...request,
      items: Array.from(this.reorderItems.values())
        .filter(item => item.requestId === request.id)
        .map(item => ({
          ...item,
          medicine: this.medicines.get(item.medicineId!)!
        })),
      retailer: this.users.get(request.retailerId!),
      wholesaler: this.users.get(request.wholesalerId!)
    }));
  }

  async updateReorderStatus(requestId: string, status: string): Promise<ReorderRequest | undefined> {
    const request = this.reorderRequests.get(requestId);
    if (request) {
      const updated = { ...request, status: status as any, updatedAt: new Date() };
      this.reorderRequests.set(requestId, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
