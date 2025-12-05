const express=require("express");
const app=express();
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("public/data.json", "utf8"));
const mongoose=require("./utils/mongoose")
const MedcineModel=require("./schemas/medicines");
const RetailerModel=require("./schemas/retailer");
const WholesalerModel=require("./schemas/wholesaler");
const UserModel=require("./schemas/user");
const ReorderRequestModel=require("./schemas/reorderRequest");
const OrderModel=require("./schemas/order");
const cors = require("cors");
app.use(express.json());
app.use(cors());
const filteredData = data.map(item => ({
  Medicine_name: item["Medicine name"],
  Brand: item["Source/Brand"],
  Image: item["Image"]
}));
const RetailerData = data.map(item => ({
  Name: item["Retailer"],
  Latitude: item["Latitude"],
  Longitude: item["Longitude"]
}));
const WholerSalerData = data.map(item => ({
  Name: item["Supplier/Distributor"],
  Latitude: item["Latitude"],
  Longitude: item["Longitude"]
}));

app.get("/api/customerMedicines",async(req,res)=>{
  const medicines=await RetailerModel.find().populate("Medicines.Medicine_name");
  return res.json(medicines);
});
app.get("/api/wholeSalerMedicines",async(req,res)=>{
  const medicines=await WholesalerModel.find().populate("Medicines.Medicine_name");
  return res.json(medicines);
});

/*app.get("/medicines", async (req, res) => {
   try {
     await MedcineModel.insertMany(filteredData);
     res.send("✅ Medicines inserted successfully (name, brand, image only)!");
   } catch (err) {
    console.error("❌ Error inserting:", err);
     res.status(500).send("Error inserting data");
   }
});
app.get("/retailers", async (req, res) => {
   try {
     await RetailerModel.insertMany(RetailerData);
     res.send("✅ Medicines inserted successfully (name, brand, image only)!");
   } catch (err) {
     console.error("❌ Error inserting:", err);
     res.status(500).send("Error inserting data");
   }
 });
 app.get("/wholesalers", async (req, res) => {
   try {
     await WholesalerModel.insertMany(WholerSalerData);
     res.send("✅ Medicines inserted successfully (name, brand, image only)!");
   } catch (err) {
     console.error("❌ Error inserting:", err);
     res.status(500).send("Error inserting data");
   }
 });

 app.get("/populate",async(req,res)=>{
     const meds = await MedcineModel.find({}, "_id");
     const formatted = meds.map(m => ({ Medicine_name: m._id, Quantity: 50 }));
     const result = await RetailerModel.updateMany({}, { $set: { Medicines: formatted } });
     const resss = await WholesalerModel.updateMany({}, { $set: { Medicines: formatted } });
     res.json({ success: true, modifiedCount: result.modifiedCount });
 })*/

// CUSTOMER SIGNUP  -------------------------------------------------
app.post("/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // role defaults to "customer" from schema
    const user = await UserModel.create({
      email,
      password,
      role: role || "customer",
    });

    return res.status(201).json({
      message: "Signup successful",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

// CUSTOMER LOGIN  --------------------------------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email,
      password,
      role: "customer",
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      message: "Login successful",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// RETAILER / WHOLESALER LOGIN  ------------------------------------
app.post("/partner-login", async (req, res) => {
  try {
    const { email, password, role } = req.body; // "retailer" | "wholesaler" (frontend)

    const normalizedRole = role?.toLowerCase();

    if (!["retailer", "wholesaler"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Case-insensitive match on role so it works even if DB has "Wholesaler"
    const user = await UserModel.findOne({
      email,
      password,
      role: { $regex: new RegExp(`^${normalizedRole}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Partner login successful",
      userId: user._id,
      role: normalizedRole, // always send lowercase to frontend
    });
  } catch (err) {
    console.error("Partner login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// INVENTORY UPDATE (Mongo-backed, used by retailer/wholesaler dashboard) -----
app.post("/inventory/update", async (req, res) => {
  try {
    const { medicineId, quantity, retailerUserId } = req.body;

    if (!medicineId || typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({ message: "medicineId and non‑negative quantity are required" });
    }

    // Set the EXACT quantity entered by the user - no calculations, no adjustments
    // This ensures the displayed value always matches what was entered
    const exactQuantity = quantity;

    // Update based on role if provided, otherwise update both
    const { userRole } = req.body;
    
    if (userRole === "retailer") {
      const retailResult = await RetailerModel.updateMany(
        { "Medicines.Medicine_name": medicineId },
        { $set: { "Medicines.$.Quantity": exactQuantity } },
      );

      return res.json({
        success: true,
        quantity: exactQuantity,
        modified: retailResult.modifiedCount ?? retailResult.nModified,
      });
    } else if (userRole === "wholesaler") {
      const wholeResult = await WholesalerModel.updateMany(
        { "Medicines.Medicine_name": medicineId },
        { $set: { "Medicines.$.Quantity": exactQuantity } },
      );

      return res.json({
        success: true,
        quantity: exactQuantity,
        modified: wholeResult.modifiedCount ?? wholeResult.nModified,
      });
    } else {
      // Update both for backward compatibility
      const retailResult = await RetailerModel.updateMany(
        { "Medicines.Medicine_name": medicineId },
        { $set: { "Medicines.$.Quantity": exactQuantity } },
      );

      const wholeResult = await WholesalerModel.updateMany(
        { "Medicines.Medicine_name": medicineId },
        { $set: { "Medicines.$.Quantity": exactQuantity } },
      );

      return res.json({
        success: true,
        quantity: exactQuantity,
        retailModified: retailResult.modifiedCount ?? retailResult.nModified,
        wholeModified: wholeResult.modifiedCount ?? wholeResult.nModified,
      });
    }
  } catch (err) {
    console.error("Inventory update error:", err);
    return res.status(500).json({ message: "Failed to update inventory" });
  }
});

// CREATE REORDER REQUEST (Retailer) -------------------------------
app.post("/reorder-requests", async (req, res) => {
  try {
    const { retailerUserId, medicineId, quantity } = req.body;

    if (!retailerUserId || !medicineId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "retailerUserId, medicineId and positive quantity are required" });
    }

    const request = await ReorderRequestModel.create({
      retailerUserId,
      medicineId,
      quantity,
    });

    return res.status(201).json(request);
  } catch (err) {
    console.error("Create reorder request error:", err);
    return res.status(500).json({ message: "Failed to create reorder request" });
  }
});

// LIST REORDER REQUESTS FOR RETAILER ------------------------------
app.get("/reorder-requests/:retailerUserId", async (req, res) => {
  try {
    const { retailerUserId } = req.params;
    const requests = await ReorderRequestModel.find({ retailerUserId })
      .sort({ createdAt: -1 })
      .populate("medicineId");

    const formatted = requests.map((r) => ({
      id: r._id.toString(),
      quantity: r.quantity,
      status: r.status,
      createdAt: r.createdAt,
      medicine: r.medicineId
        ? {
            id: r.medicineId._id.toString(),
            name: r.medicineId.Medicine_name,
            manufacturer: r.medicineId.Brand,
          }
        : null,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("List reorder requests error:", err);
    return res.status(500).json({ message: "Failed to list reorder requests" });
  }
});

// LIST ALL PENDING REORDER REQUESTS (for wholesalers) ------------
app.get("/reorder-requests", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await ReorderRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .populate("medicineId")
      .populate("retailerUserId");

    const formatted = requests.map((r) => ({
      id: r._id.toString(),
      retailerUserId: r.retailerUserId?._id?.toString() || r.retailerUserId?.toString(),
      retailerEmail: r.retailerUserId?.email || "Unknown",
      quantity: r.quantity,
      status: r.status,
      createdAt: r.createdAt,
      medicine: r.medicineId
        ? {
            id: r.medicineId._id.toString(),
            name: r.medicineId.Medicine_name,
            manufacturer: r.medicineId.Brand,
          }
        : null,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("List all reorder requests error:", err);
    return res.status(500).json({ message: "Failed to list reorder requests" });
  }
});

// APPROVE/REJECT REORDER REQUEST (Wholesaler) ---------------------
app.patch("/reorder-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
    }

    const request = await ReorderRequestModel.findById(requestId).populate("medicineId");

    if (!request) {
      return res.status(404).json({ message: "Reorder request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    // If approved, update stock in RetailerModel
    if (status === "approved") {
      const medicineId = request.medicineId?._id || request.medicineId;
      const reorderQuantity = request.quantity;

      if (!medicineId) {
        return res.status(400).json({ message: "Medicine not found in request" });
      }

      // Add the reorder quantity to existing stock in RetailerModel
      // Find all retailers that have this medicine and add the reorder quantity
      const retailers = await RetailerModel.find().populate("Medicines.Medicine_name");

      let updatedCount = 0;
      for (const retailer of retailers) {
        const medIndex = retailer.Medicines.findIndex(
          (m) => {
            const medId = m.Medicine_name?._id?.toString() || m.Medicine_name?.toString();
            return medId === medicineId.toString();
          }
        );

        if (medIndex !== -1) {
          // Medicine exists - ADD the reorder quantity to existing stock
          const currentQty = retailer.Medicines[medIndex].Quantity || 0;
          const newQty = currentQty + reorderQuantity;
          retailer.Medicines[medIndex].Quantity = newQty;
          await retailer.save();
          updatedCount++;
          console.log(`✅ Added ${reorderQuantity} units to existing stock. New total: ${newQty}`);
        } else {
          // Medicine doesn't exist - create new entry with reorder quantity
          retailer.Medicines.push({
            Medicine_name: medicineId,
            Quantity: reorderQuantity,
          });
          await retailer.save();
          updatedCount++;
          console.log(`✅ Created new inventory entry with ${reorderQuantity} units`);
        }
      }

      console.log(`✅ Stock updated: Added ${reorderQuantity} units of medicine ${medicineId} to ${updatedCount} retailer(s)`);
    }

    // Update request status
    request.status = status;
    await request.save();

    return res.json({
      success: true,
      request: {
        id: request._id.toString(),
        status: request.status,
        quantity: request.quantity,
        medicine: request.medicineId
          ? {
              id: request.medicineId._id.toString(),
              name: request.medicineId.Medicine_name,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("Update reorder request error:", err);
    return res.status(500).json({ message: "Failed to update reorder request" });
  }
});

// RETAILER DASHBOARD (Mongo-backed) --------------------------------
app.get("/dashboard/retailer/:id", async (req, res) => {
  try {
    const retailerUserId = req.params.id;

    // For now we aggregate inventory across all retailers. If you later add a link
    // between UserModel and RetailerModel, you can filter inventory by that here.
    const retailers = await RetailerModel.find().populate("Medicines.Medicine_name");

    if (!retailers || retailers.length === 0) {
      return res.json({
        totalItems: 0,
        lowStock: 0,
        todaySales: 0,
        pendingReorders: 0,
        inventory: [],
        lowStockItems: [],
      });
    }

    // Start with existing inventory from RetailerModel
    // Instead of summing across all retailers, use the FIRST retailer's quantity for each medicine
    // This prevents inflated numbers when multiple retailers have the same medicine
    const existingInventoryMap = new Map();

    for (const retailer of retailers) {
      const meds = retailer.Medicines || [];
      for (const entry of meds) {
        const medDoc = entry.Medicine_name;
        if (!medDoc) continue;

        const medId = medDoc._id.toString();
        const quantity = entry.Quantity || 0;

        // Only set if not already in map - this ensures we use the first retailer's value
        // and don't sum across multiple retailers
        if (!existingInventoryMap.has(medId)) {
          existingInventoryMap.set(medId, {
            id: medId,
            medicineId: medId,
            quantity: quantity, // Use the exact quantity from this retailer
            reorderLevel: 10,
            medicine: {
              id: medId,
              name: medDoc.Medicine_name,
              manufacturer: medDoc.Brand,
              image: medDoc.Image,
            },
          });
        }
        // Don't sum - just use the first value found
      }
    }

    // Reorder requests for this retailer user (for display in reorder requests section)
    const reorderRequests = retailerUserId
      ? await ReorderRequestModel.find({ retailerUserId })
          .sort({ createdAt: -1 })
          .populate("medicineId")
      : [];

    // Note: Approved reorder requests are already added to RetailerModel when approved
    // So we just display the base stock from RetailerModel - no need to add approved requests here

    // Convert map to array and calculate status
    const allInventory = Array.from(existingInventoryMap.values()).map((item) => {
      let status = "in_stock";
      if (item.quantity === 0) status = "out_of_stock";
      else if (item.quantity <= item.reorderLevel) status = "low_stock";

      return {
        ...item,
        status,
      };
    });

    const lowStockItems = allInventory.filter(
      (item) => item.status === "low_stock" || item.status === "out_of_stock",
    );

    // Today's "sales" = total quantity in today's reorder requests (all statuses)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todaysRequests = retailerUserId
      ? await ReorderRequestModel.find({
          retailerUserId: mongoose.Types.ObjectId.isValid(retailerUserId) 
            ? new mongoose.Types.ObjectId(retailerUserId) 
            : retailerUserId,
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        })
      : [];

    const todaySales = todaysRequests.reduce((sum, r) => sum + (r.quantity || 0), 0);

    const pendingReorders = reorderRequests.filter((r) => r.status === "pending").length;

    // Get orders for this retailer user
    // Convert retailerUserId string to ObjectId for proper matching
    let orders = [];
    if (retailerUserId) {
      try {
        // Try with ObjectId conversion first
        const userIdObj = mongoose.Types.ObjectId.isValid(retailerUserId) 
          ? new mongoose.Types.ObjectId(retailerUserId) 
          : retailerUserId;
        
        orders = await OrderModel.find({ retailerUserId: userIdObj })
          .sort({ createdAt: -1 })
          .populate("items.medicineId");
        
        // If no orders found, try with string matching as fallback
        if (orders.length === 0) {
          const allOrders = await OrderModel.find()
            .sort({ createdAt: -1 })
            .populate("items.medicineId");
          
          orders = allOrders.filter((o) => {
            const orderUserId = o.retailerUserId?.toString() || o.retailerUserId;
            return orderUserId === retailerUserId || orderUserId === userIdObj.toString();
          });
        }
        
        console.log(`[Retailer Dashboard] retailerUserId: ${retailerUserId}, Found ${orders.length} orders`);
      } catch (err) {
        console.error("[Retailer Dashboard] Error fetching orders:", err);
      }
    }

    // Get all orders to calculate sequential numbers
    const allOrdersForNumbering = await OrderModel.find()
      .sort({ createdAt: 1 })
      .populate("items.medicineId");

    const orderNumberMap = new Map();
    allOrdersForNumbering.forEach((o, index) => {
      orderNumberMap.set(o._id.toString(), index + 1);
    });

    // Get all reorder requests to calculate sequential numbers
    const allReorderRequests = await ReorderRequestModel.find()
      .sort({ createdAt: 1 });

    const requestNumberMap = new Map();
    allReorderRequests.forEach((r, index) => {
      requestNumberMap.set(r._id.toString(), index + 1);
    });

    // Combine reorder requests and orders into a single array
    const combinedRequests = [
      ...reorderRequests.map((r) => ({
        id: r._id.toString(),
        type: "reorder_request",
        requestNumber: requestNumberMap.get(r._id.toString()) || 0,
        retailerUserId: r.retailerUserId?.toString() || retailerUserId,
        medicine: r.medicineId
          ? {
              id: r.medicineId._id.toString(),
              name: r.medicineId.Medicine_name,
              manufacturer: r.medicineId.Brand,
            }
          : null,
        quantity: r.quantity,
        status: r.status,
        createdAt: r.createdAt,
      })),
      ...orders.map((o) => ({
        id: o._id.toString(),
        type: "order",
        requestNumber: orderNumberMap.get(o._id.toString()) || 0,
        retailerUserId: o.retailerUserId?.toString() || retailerUserId,
        items: o.items.map((item) => ({
          medicineId: item.medicineId?._id?.toString() || item.medicineId?.toString(),
          medicineName: item.medicineId?.Medicine_name || "Unknown",
          medicineManufacturer: item.medicineId?.Brand || "Unknown",
          quantity: item.quantity,
        })),
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Add sequential request numbers (1, 2, 3...) instead of hex IDs
    const stats = {
      totalItems: allInventory.length,
      lowStock: lowStockItems.length,
      todaySales,
      pendingReorders: pendingReorders + orders.filter((o) => o.status === "pending").length,
      inventory: allInventory,
      lowStockItems,
      reorderRequests: combinedRequests, // This includes both reorder requests and orders
    };

    return res.json(stats);
  } catch (err) {
    console.error("Retailer dashboard error:", err);
    return res.status(500).json({ message: "Failed to load retailer dashboard" });
  }
});

// WHOLESALER DASHBOARD (Mongo-backed) ------------------------------
app.get("/dashboard/wholesaler/:id", async (req, res) => {
  try {
    const wholesalers = await WholesalerModel.find().populate("Medicines.Medicine_name");
    const retailers = await RetailerModel.find();

    // Get all pending reorder requests
    const pendingRequests = await ReorderRequestModel.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("medicineId")
      .populate("retailerUserId");

    // Get all pending orders
    const pendingOrders = await OrderModel.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("retailerUserId")
      .populate("items.medicineId");

    // Get all orders to calculate sequential numbers
    const allOrders = await OrderModel.find()
      .sort({ createdAt: 1 }) // Oldest first to assign sequential numbers
      .populate("retailerUserId")
      .populate("items.medicineId");

    // Create a map of order ID to sequential number
    const orderNumberMap = new Map();
    allOrders.forEach((o, index) => {
      orderNumberMap.set(o._id.toString(), index + 1);
    });

    // Get all approved requests and orders from this month for revenue calculation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const approvedThisMonth = await ReorderRequestModel.find({
      status: "approved",
      createdAt: { $gte: startOfMonth },
    });
    const approvedOrdersThisMonth = await OrderModel.find({
      status: "approved",
      createdAt: { $gte: startOfMonth },
    });

    const monthlyRevenue = 
      approvedThisMonth.reduce((sum, r) => sum + (r.quantity || 0) * 100, 0) +
      approvedOrdersThisMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Build inventory from WholesalerModel
    // Instead of summing across all wholesalers, use the FIRST wholesaler's quantity for each medicine
    // This prevents inflated numbers when multiple wholesalers have the same medicine
    const inventoryMap = new Map();

    for (const wholesaler of wholesalers) {
      const meds = wholesaler.Medicines || [];
      for (const entry of meds) {
        const medDoc = entry.Medicine_name;
        if (!medDoc) continue;

        const medId = medDoc._id.toString();
        const quantity = entry.Quantity || 0;

        // Only set if not already in map - this ensures we use the first wholesaler's value
        // and don't sum across multiple wholesalers
        if (!inventoryMap.has(medId)) {
          inventoryMap.set(medId, {
            id: medId,
            medicineId: medId,
            quantity: quantity, // Use the exact quantity from this wholesaler
            reorderLevel: 10,
            medicine: {
              id: medId,
              name: medDoc.Medicine_name,
              manufacturer: medDoc.Brand,
              image: medDoc.Image,
            },
          });
        }
        // Don't sum - just use the first value found
      }
    }

    // Convert map to array and calculate status
    const inventory = Array.from(inventoryMap.values()).map((item) => {
      let status = "in_stock";
      if (item.quantity === 0) status = "out_of_stock";
      else if (item.quantity <= item.reorderLevel) status = "low_stock";

      return {
        ...item,
        status,
      };
    });

    // Get all requests (not just pending) to calculate sequential numbers
    const allRequests = await ReorderRequestModel.find()
      .sort({ createdAt: 1 }) // Oldest first to assign sequential numbers
      .populate("medicineId")
      .populate("retailerUserId");

    // Create a map of request ID to sequential number
    const requestNumberMap = new Map();
    allRequests.forEach((r, index) => {
      requestNumberMap.set(r._id.toString(), index + 1);
    });

    // Combine reorder requests and orders into a single array
    const combinedRequests = [
      ...pendingRequests.map((r) => ({
        id: r._id.toString(),
        type: "reorder_request",
        requestNumber: requestNumberMap.get(r._id.toString()) || 0,
        retailerUserId: r.retailerUserId?._id?.toString() || r.retailerUserId?.toString(),
        retailerEmail: r.retailerUserId?.email || "Unknown",
        quantity: r.quantity,
        status: r.status,
        createdAt: r.createdAt,
        medicine: r.medicineId
          ? {
              id: r.medicineId._id.toString(),
              name: r.medicineId.Medicine_name,
              manufacturer: r.medicineId.Brand,
            }
          : null,
      })),
      ...pendingOrders.map((order) => ({
        id: order._id.toString(),
        type: "order",
        requestNumber: orderNumberMap.get(order._id.toString()) || 0,
        retailerUserId: order.retailerUserId?._id?.toString() || order.retailerUserId?.toString(),
        retailerEmail: order.retailerUserId?.email || "Unknown",
        items: order.items.map((item) => ({
          medicineId: item.medicineId?._id?.toString() || item.medicineId?.toString(),
          medicineName: item.medicineId?.Medicine_name || "Unknown",
          medicineManufacturer: item.medicineId?.Brand || "Unknown",
          quantity: item.quantity,
        })),
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
      activeRetailers: retailers.length,
      pendingOrders: pendingRequests.length + pendingOrders.length,
      monthlyRevenue,
      stockTurnover: 85, // Placeholder until you add turnover calculation
      inventory, // Add inventory data
      recentRequests: combinedRequests.slice(0, 20),
    };

    return res.json(stats);
  } catch (err) {
    console.error("Wholesaler dashboard error:", err);
    return res.status(500).json({ message: "Failed to load wholesaler dashboard" });
  }
});

// CREATE ORDER (Retailer) --------------------------------------------
app.post("/orders", async (req, res) => {
  try {
    const { retailerUserId, items } = req.body;

    if (!retailerUserId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "retailerUserId and items array are required" });
    }

    // Validate items
    for (const item of items) {
      if (!item.medicineId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Each item must have medicineId and positive quantity" });
      }
    }

    // Calculate total amount (assuming ₹100 per unit, you can adjust this)
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * 100), 0);

    // Ensure retailerUserId is stored as ObjectId
    const userIdObj = mongoose.Types.ObjectId.isValid(retailerUserId) 
      ? new mongoose.Types.ObjectId(retailerUserId) 
      : retailerUserId;

    console.log(`[Create Order] Creating order for retailerUserId: ${retailerUserId} (converted to: ${userIdObj})`);

    const order = await OrderModel.create({
      retailerUserId: userIdObj,
      items,
      totalAmount,
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
});

// LIST ORDERS FOR WHOLESALER -----------------------------------------
app.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .populate("retailerUserId")
      .populate("items.medicineId");

    const formatted = orders.map((order) => ({
      id: order._id.toString(),
      retailerUserId: order.retailerUserId?._id?.toString() || order.retailerUserId?.toString(),
      retailerEmail: order.retailerUserId?.email || "Unknown",
      items: order.items.map((item) => ({
        medicineId: item.medicineId?._id?.toString() || item.medicineId?.toString(),
        medicineName: item.medicineId?.Medicine_name || "Unknown",
        medicineManufacturer: item.medicineId?.Brand || "Unknown",
        quantity: item.quantity,
      })),
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("List orders error:", err);
    return res.status(500).json({ message: "Failed to list orders" });
  }
});

// GET ORDER BY ID (for view details) --------------------------------
app.get("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId)
      .populate("retailerUserId")
      .populate("items.medicineId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const formatted = {
      id: order._id.toString(),
      retailerUserId: order.retailerUserId?._id?.toString() || order.retailerUserId?.toString(),
      retailerEmail: order.retailerUserId?.email || "Unknown",
      items: order.items.map((item) => ({
        medicineId: item.medicineId?._id?.toString() || item.medicineId?.toString(),
        medicineName: item.medicineId?.Medicine_name || "Unknown",
        medicineManufacturer: item.medicineId?.Brand || "Unknown",
        quantity: item.quantity,
      })),
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    };

    return res.json(formatted);
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ message: "Failed to get order" });
  }
});

// APPROVE/REJECT ORDER (Wholesaler) ---------------------------------
app.patch("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
    }

    const order = await OrderModel.findById(orderId).populate("items.medicineId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order is not pending" });
    }

    // If approved, update stock in RetailerModel
    // Note: Since RetailerModel doesn't have a userId field, we add stock to all retailers
    // (matching the aggregation approach used in the retailer dashboard)
    // TODO: Add userId field to RetailerModel schema to link users to specific retailers
    if (status === "approved") {
      const retailers = await RetailerModel.find().populate("Medicines.Medicine_name");

      for (const item of order.items) {
        const medicineId = item.medicineId?._id || item.medicineId;
        const quantity = item.quantity;

        if (!medicineId) continue;

        // Add stock to all retailers (since we can't identify the specific retailer)
        // This matches the aggregation approach in the retailer dashboard
        for (const retailer of retailers) {
          const medIndex = retailer.Medicines.findIndex(
            (m) => {
              const medId = m.Medicine_name?._id?.toString() || m.Medicine_name?.toString();
              return medId === medicineId.toString();
            }
          );

          if (medIndex !== -1) {
            const currentQty = retailer.Medicines[medIndex].Quantity || 0;
            retailer.Medicines[medIndex].Quantity = currentQty + quantity;
          } else {
            retailer.Medicines.push({
              Medicine_name: medicineId,
              Quantity: quantity,
            });
          }
        }
      }

      // Save all retailers
      for (const retailer of retailers) {
        await retailer.save();
      }

      console.log(`✅ Order approved: Added stock for ${order.items.length} medicines`);
    }

    order.status = status;
    await order.save();

    return res.json({
      success: true,
      order: {
        id: order._id.toString(),
        status: order.status,
      },
    });
  } catch (err) {
    console.error("Update order error:", err);
    return res.status(500).json({ message: "Failed to update order" });
  }
});

app.listen(3000,()=>console.log("working"));
