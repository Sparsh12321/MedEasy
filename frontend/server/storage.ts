import { 
  type User, type InsertUser, type Medicine, type InsertMedicine, 
  type Category, type Store, type Inventory, type InsertInventory,
  type Order, type InsertOrder, type OrderItem, type ReorderRequest, 
  type InsertReorderRequest, type ReorderItem, type MedicineWithInventory,
  type OrderWithItems, type StoreWithInventory, type ReorderRequestWithItems
} from "@shared/schema";
import { randomUUID } from "crypto";

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

    // Initialize medicines
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
      },
      {
        id: "med2",
        name: "Vitamin D3 60K IU",
        manufacturer: "Sun Pharma",
        categoryId: "cat5",
        description: "Vitamin D3 supplement",
        dosage: "60,000 IU",
        packSize: "4 capsules",
        mrp: "120.00",
        price: "89.00",
        discount: 26,
        prescription: false,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        createdAt: new Date()
      },
      {
        id: "med3",
        name: "Crocin Advance",
        manufacturer: "GSK Pharma",
        categoryId: "cat1",
        description: "Fast pain relief",
        dosage: "500mg",
        packSize: "15 tablets",
        mrp: "40.00",
        price: "32.00",
        discount: 20,
        prescription: false,
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        createdAt: new Date()
      },
      {
        id: "med4",
        name: "Omega 3 Fish Oil",
        manufacturer: "Himalaya",
        categoryId: "cat5",
        description: "Heart and brain health supplement",
        dosage: "1000mg",
        packSize: "60 capsules",
        mrp: "600.00",
        price: "450.00",
        discount: 25,
        prescription: false,
        image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        createdAt: new Date()
      },
      {
        id: "med5",
        name: "Metformin 500mg",
        manufacturer: "Cipla Ltd",
        categoryId: "cat3",
        description: "Diabetes management",
        dosage: "500mg",
        packSize: "30 tablets",
        mrp: "85.00",
        price: "68.00",
        discount: 20,
        prescription: true,
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        createdAt: new Date()
      },
      {
        id: "med6",
        name: "Cetirizine 10mg",
        manufacturer: "Dr. Reddy's",
        categoryId: "cat1",
        description: "Allergy relief",
        dosage: "10mg",
        packSize: "10 tablets",
        mrp: "25.00",
        price: "20.00",
        discount: 20,
        prescription: false,
        image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        createdAt: new Date()
      }
    ];
    medicines.forEach(med => this.medicines.set(med.id, med));

    // Initialize stores
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
      },
      {
        id: "store2",
        name: "Apollo Pharmacy",
        ownerId: "retailer2",
        address: "456 Medical Road, Karol Bagh",
        location: "Delhi, 110005",
        phone: "+91-9876543211",
        license: "DL-PHARM-2024-002",
        rating: "4.3",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "store3",
        name: "HealthPlus Store",
        ownerId: "retailer3",
        address: "789 Wellness Avenue, Lajpat Nagar",
        location: "Delhi, 110024",
        phone: "+91-9876543212",
        license: "DL-PHARM-2024-003",
        rating: "4.7",
        isActive: true,
        createdAt: new Date()
      }
    ];
    stores.forEach(store => this.stores.set(store.id, store));

    // Initialize inventory
    const inventoryItems = [
      { id: "inv1", storeId: "store1", medicineId: "med1", quantity: 125, reorderLevel: 20, status: "in_stock", lastUpdated: new Date() },
      { id: "inv2", storeId: "store1", medicineId: "med2", quantity: 8, reorderLevel: 10, status: "low_stock", lastUpdated: new Date() },
      { id: "inv3", storeId: "store1", medicineId: "med3", quantity: 45, reorderLevel: 15, status: "in_stock", lastUpdated: new Date() },
      { id: "inv4", storeId: "store1", medicineId: "med4", quantity: 0, reorderLevel: 5, status: "out_of_stock", lastUpdated: new Date() },
      { id: "inv5", storeId: "store2", medicineId: "med1", quantity: 78, reorderLevel: 20, status: "in_stock", lastUpdated: new Date() },
      { id: "inv6", storeId: "store2", medicineId: "med2", quantity: 15, reorderLevel: 10, status: "low_stock", lastUpdated: new Date() },
      { id: "inv7", storeId: "store2", medicineId: "med5", quantity: 32, reorderLevel: 10, status: "in_stock", lastUpdated: new Date() },
      { id: "inv8", storeId: "store3", medicineId: "med1", quantity: 95, reorderLevel: 20, status: "in_stock", lastUpdated: new Date() },
      { id: "inv9", storeId: "store3", medicineId: "med6", quantity: 42, reorderLevel: 15, status: "in_stock", lastUpdated: new Date() },
    ];
    inventoryItems.forEach(item => this.inventory.set(item.id, item as Inventory));
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
