var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import session2 from "express-session";
import Stripe from "stripe";

// server/storage.ts
import { randomUUID } from "crypto";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  coupons: () => coupons,
  deliveryServices: () => deliveryServices,
  foodDatabase: () => foodDatabase,
  groceryItems: () => groceryItems,
  insertCouponSchema: () => insertCouponSchema,
  insertDeliveryServiceSchema: () => insertDeliveryServiceSchema,
  insertFoodDatabaseSchema: () => insertFoodDatabaseSchema,
  insertGroceryItemSchema: () => insertGroceryItemSchema,
  insertMealPlanSchema: () => insertMealPlanSchema,
  insertPantryItemSchema: () => insertPantryItemSchema,
  insertPaymentTransactionSchema: () => insertPaymentTransactionSchema,
  insertPremiumMealPlanSchema: () => insertPremiumMealPlanSchema,
  insertRecipeSchema: () => insertRecipeSchema,
  insertRestaurantMenuItemSchema: () => insertRestaurantMenuItemSchema,
  insertShoppingTipSchema: () => insertShoppingTipSchema,
  insertStoreSchema: () => insertStoreSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertUserCouponSchema: () => insertUserCouponSchema,
  insertUserSchema: () => insertUserSchema,
  mealPlans: () => mealPlans,
  pantryItems: () => pantryItems,
  paymentTransactions: () => paymentTransactions,
  premiumMealPlans: () => premiumMealPlans,
  recipes: () => recipes,
  restaurantMenuItems: () => restaurantMenuItems,
  sessions: () => sessions,
  shoppingTips: () => shoppingTips,
  stores: () => stores,
  subscriptionPlans: () => subscriptionPlans,
  userCoupons: () => userCoupons,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionPlan: varchar("subscription_plan").default("free"),
  subscriptionStatus: varchar("subscription_status").default("inactive"),
  trialEndsAt: timestamp("trial_ends_at"),
  trialUsed: boolean("trial_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").$type().notNull(),
  instructions: jsonb("instructions").$type().notNull(),
  cookTime: integer("cook_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(),
  rating: integer("rating").default(0),
  imageUrl: text("image_url"),
  tags: jsonb("tags").$type().default([]),
  calories: integer("calories"),
  caloriesPerServing: integer("calories_per_serving"),
  nutritionInfo: jsonb("nutrition_info").$type(),
  estimatedCost: text("estimated_cost"),
  costPerServing: text("cost_per_serving"),
  createdAt: timestamp("created_at").defaultNow()
});
var mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  mealType: text("meal_type").notNull(),
  // breakfast, lunch, dinner
  recipeId: varchar("recipe_id").references(() => recipes.id),
  recipeName: text("recipe_name").notNull(),
  cookTime: integer("cook_time").notNull(),
  status: text("status").default("planned"),
  // planned, cooking, completed
  currentStep: integer("current_step").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var groceryItems = pgTable("grocery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  category: text("category").default("other"),
  completed: boolean("completed").default(false),
  addedBy: text("added_by").default("user"),
  // user, ai
  estimatedPrice: text("estimated_price"),
  actualPrice: text("actual_price"),
  bestStore: text("best_store"),
  storeLink: text("store_link"),
  couponCode: text("coupon_code"),
  onSale: boolean("on_sale").default(false),
  saleSavings: text("sale_savings"),
  imageUrl: text("image_url"),
  notes: text("notes"),
  priority: integer("priority").default(1),
  // 1-5
  createdAt: timestamp("created_at").defaultNow()
});
var pantryItems = pgTable("pantry_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  expiryDate: text("expiry_date"),
  status: text("status").default("normal"),
  // normal, low, expired
  purchasePrice: text("purchase_price"),
  purchaseDate: text("purchase_date"),
  purchaseStore: text("purchase_store"),
  calories: integer("calories"),
  createdAt: timestamp("created_at").defaultNow()
});
var stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // grocery, supermarket, online, farmers_market
  address: text("address"),
  website: text("website"),
  priceRating: integer("price_rating").default(3),
  // 1-5, 1 being cheapest
  qualityRating: integer("quality_rating").default(3),
  distance: text("distance"),
  deliveryAvailable: boolean("delivery_available").default(false),
  curbsideAvailable: boolean("curbside_available").default(false),
  specialOffers: jsonb("special_offers").$type().default([]),
  createdAt: timestamp("created_at").defaultNow()
});
var shoppingTips = pgTable("shopping_tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // budgeting, coupons, seasonal, bulk_buying
  tipType: text("tip_type").notNull(),
  // savings, quality, timing
  estimatedSavings: text("estimated_savings"),
  difficulty: text("difficulty").default("easy"),
  // easy, medium, advanced
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var foodDatabase = pgTable("food_database", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // fruits, vegetables, proteins, grains, dairy, etc.
  subCategory: text("sub_category"),
  // citrus, leafy_greens, red_meat, etc.
  brand: text("brand"),
  barcode: text("barcode"),
  servingSize: text("serving_size").notNull(),
  calories: integer("calories").notNull(),
  nutritionInfo: jsonb("nutrition_info").$type().notNull(),
  allergens: jsonb("allergens").$type().default([]),
  dietaryTags: jsonb("dietary_tags").$type().default([]),
  // vegan, vegetarian, gluten_free, keto, etc.
  averagePrice: text("average_price"),
  seasonality: text("seasonality"),
  // spring, summer, fall, winter, year_round
  storageInstructions: text("storage_instructions"),
  shelfLife: text("shelf_life"),
  preparationTips: jsonb("preparation_tips").$type().default([]),
  commonUses: jsonb("common_uses").$type().default([]),
  isOrganic: boolean("is_organic").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var deliveryServices = pgTable("delivery_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  // DoorDash, Grubhub, Uber Eats, etc.
  type: text("type").notNull(),
  // food_delivery, grocery_delivery, restaurant_delivery
  websiteUrl: text("website_url").notNull(),
  apiEndpoint: text("api_endpoint"),
  supportedAreas: jsonb("supported_areas").$type().default([]),
  averageDeliveryTime: text("average_delivery_time"),
  deliveryFee: text("delivery_fee"),
  minimumOrder: text("minimum_order"),
  features: jsonb("features").$type().default([]),
  // real_time_tracking, scheduled_delivery, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var restaurantMenuItems = pgTable("restaurant_menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantName: text("restaurant_name").notNull(),
  itemName: text("item_name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  // appetizers, mains, desserts, beverages
  price: text("price").notNull(),
  calories: integer("calories"),
  nutritionInfo: jsonb("nutrition_info").$type(),
  allergens: jsonb("allergens").$type().default([]),
  dietaryTags: jsonb("dietary_tags").$type().default([]),
  ingredients: jsonb("ingredients").$type().default([]),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  deliveryServiceId: varchar("delivery_service_id").references(() => deliveryServices.id),
  doordashUrl: text("doordash_url"),
  grubhubUrl: text("grubhub_url"),
  ubereatsUrl: text("ubereats_url"),
  createdAt: timestamp("created_at").defaultNow()
});
var subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  price: integer("price").notNull(),
  // in cents
  interval: text("interval").notNull(),
  // month, year, lifetime
  features: jsonb("features").$type().notNull(),
  isActive: boolean("is_active").default(true),
  trialDays: integer("trial_days").default(7),
  // 7-day free trial
  maxUsers: integer("max_users"),
  // limit for lifetime plans (e.g., 100)
  currentUsers: integer("current_users").default(0),
  // count of users who purchased
  createdAt: timestamp("created_at").defaultNow()
});
var coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  // percentage, fixed_amount
  discountValue: integer("discount_value").notNull(),
  // percentage or cents
  minAmount: integer("min_amount").default(0),
  // minimum order amount in cents
  maxUses: integer("max_uses"),
  // null = unlimited
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  applicablePlans: jsonb("applicable_plans").$type().default([]),
  // empty = all plans
  createdAt: timestamp("created_at").defaultNow()
});
var userCoupons = pgTable("user_coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  couponId: varchar("coupon_id").references(() => coupons.id),
  usedAt: timestamp("used_at").defaultNow(),
  discountAmount: integer("discount_amount").notNull(),
  // actual discount applied in cents
  createdAt: timestamp("created_at").defaultNow()
});
var paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  amount: integer("amount").notNull(),
  // in cents
  currency: text("currency").default("usd"),
  status: text("status").notNull(),
  // pending, succeeded, failed, canceled
  paymentType: text("payment_type").notNull(),
  // subscription, one_time, meal_plan
  description: text("description"),
  metadata: jsonb("metadata").$type().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var premiumMealPlans = pgTable("premium_meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  // in cents
  duration: integer("duration").notNull(),
  // days
  meals: jsonb("meals").$type().notNull(),
  nutritionGoals: jsonb("nutrition_goals").$type(),
  dietaryTags: jsonb("dietary_tags").$type().default([]),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true
});
var insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true
});
var insertGroceryItemSchema = createInsertSchema(groceryItems).omit({
  id: true,
  createdAt: true
});
var insertPantryItemSchema = createInsertSchema(pantryItems).omit({
  id: true,
  createdAt: true
});
var insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true
});
var insertShoppingTipSchema = createInsertSchema(shoppingTips).omit({
  id: true,
  createdAt: true
});
var insertFoodDatabaseSchema = createInsertSchema(foodDatabase).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDeliveryServiceSchema = createInsertSchema(deliveryServices).omit({
  id: true,
  createdAt: true
});
var insertRestaurantMenuItemSchema = createInsertSchema(restaurantMenuItems).omit({
  id: true,
  createdAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true
});
var insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPremiumMealPlanSchema = createInsertSchema(premiumMealPlans).omit({
  id: true,
  createdAt: true
});
var insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usedCount: true
});
var insertUserCouponSchema = createInsertSchema(userCoupons).omit({
  id: true,
  createdAt: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var MemStorage = class {
  recipes;
  mealPlans;
  groceryItems;
  pantryItems;
  stores;
  shoppingTips;
  foodDatabase;
  users;
  subscriptionPlans;
  paymentTransactions;
  premiumMealPlans;
  deliveryServices;
  restaurantMenuItems;
  coupons;
  userCoupons;
  constructor() {
    this.recipes = /* @__PURE__ */ new Map();
    this.mealPlans = /* @__PURE__ */ new Map();
    this.groceryItems = /* @__PURE__ */ new Map();
    this.pantryItems = /* @__PURE__ */ new Map();
    this.stores = /* @__PURE__ */ new Map();
    this.shoppingTips = /* @__PURE__ */ new Map();
    this.foodDatabase = /* @__PURE__ */ new Map();
    this.deliveryServices = /* @__PURE__ */ new Map();
    this.restaurantMenuItems = /* @__PURE__ */ new Map();
    this.users = /* @__PURE__ */ new Map();
    this.subscriptionPlans = /* @__PURE__ */ new Map();
    this.paymentTransactions = /* @__PURE__ */ new Map();
    this.premiumMealPlans = /* @__PURE__ */ new Map();
    this.coupons = /* @__PURE__ */ new Map();
    this.userCoupons = /* @__PURE__ */ new Map();
    this.initializeSampleData();
  }
  initializeSampleData() {
    const sampleRecipes = [
      {
        name: "Blueberry Pancakes",
        description: "Fluffy pancakes with fresh blueberries",
        ingredients: ["flour", "eggs", "milk", "blueberries", "baking powder", "sugar"],
        instructions: ["Mix dry ingredients", "Combine wet ingredients", "Fold in blueberries", "Cook on griddle"],
        cookTime: 15,
        servings: 4,
        difficulty: "Easy",
        rating: 5,
        imageUrl: "https://pixabay.com/get/gc9a0b89548e8c23a0f125938c2051cbca13d96a12fc3b73cf4c0344b5dab0d222005faa18e3895176658c2937b62e518ac45508e394be9ae3ca1c5bf3f0cb1f2_1280.jpg",
        tags: ["breakfast", "sweet"]
      },
      {
        name: "Grilled Chicken Caesar",
        description: "Fresh Caesar salad with grilled chicken, croutons and parmesan",
        ingredients: ["chicken breast", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
        instructions: ["Grill chicken breast", "Prepare lettuce", "Add dressing and toppings", "Serve immediately"],
        cookTime: 20,
        servings: 2,
        difficulty: "Easy",
        rating: 4,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120",
        tags: ["lunch", "healthy", "salad"]
      },
      {
        name: "Herb-Crusted Salmon",
        description: "Fresh salmon with herb crust and roasted vegetables",
        ingredients: ["salmon fillet", "herbs", "vegetables", "olive oil", "lemon"],
        instructions: ["Prepare herb crust", "Season salmon", "Roast vegetables", "Bake salmon", "Serve with lemon"],
        cookTime: 25,
        servings: 2,
        difficulty: "Medium",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120",
        tags: ["dinner", "healthy", "fish"]
      }
    ];
    sampleRecipes.forEach((recipe) => {
      const id = randomUUID();
      this.recipes.set(id, {
        ...recipe,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        description: recipe.description || null,
        rating: recipe.rating || null,
        imageUrl: recipe.imageUrl || null,
        tags: recipe.tags || null,
        calories: recipe.calories || null,
        caloriesPerServing: recipe.caloriesPerServing || null,
        nutritionInfo: recipe.nutritionInfo || null,
        estimatedCost: recipe.estimatedCost || null,
        costPerServing: recipe.costPerServing || null
      });
    });
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const mealPlans3 = [
      {
        date: today,
        mealType: "breakfast",
        recipeId: Array.from(this.recipes.keys())[0],
        recipeName: "Blueberry Pancakes",
        cookTime: 15,
        status: "planned"
      },
      {
        date: today,
        mealType: "lunch",
        recipeId: Array.from(this.recipes.keys())[1],
        recipeName: "Grilled Chicken Caesar",
        cookTime: 20,
        status: "planned"
      },
      {
        date: today,
        mealType: "dinner",
        recipeId: Array.from(this.recipes.keys())[2],
        recipeName: "Herb-Crusted Salmon",
        cookTime: 25,
        status: "cooking",
        currentStep: 3
      }
    ];
    mealPlans3.forEach((plan) => {
      const id = randomUUID();
      this.mealPlans.set(id, {
        ...plan,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        status: plan.status || null,
        recipeId: plan.recipeId || null,
        currentStep: plan.currentStep || null
      });
    });
    const groceryItems3 = [
      {
        name: "Bananas",
        quantity: 3,
        category: "Produce",
        estimatedPrice: "$1.62",
        // $0.54/lb x 3 lbs
        completed: false,
        storeRecommendation: "ALDI",
        saleSavings: "Save $0.33 vs other stores",
        nutritionHighlights: "High in potassium and vitamin B6"
      },
      {
        name: "Chicken Breast",
        quantity: 2,
        category: "Meat & Seafood",
        estimatedPrice: "$7.78",
        // $3.89/lb x 2 lbs
        completed: false,
        storeRecommendation: "Fareway",
        saleSavings: "Fresh cut daily",
        nutritionHighlights: "Lean protein, 25g per serving"
      },
      {
        name: "Milk (1 gallon)",
        quantity: 1,
        category: "Dairy",
        estimatedPrice: "$2.99",
        completed: true,
        storeRecommendation: "ALDI",
        saleSavings: "Save $0.50 vs average",
        nutritionHighlights: "Calcium, vitamin D, protein"
      },
      {
        name: "Whole Wheat Bread",
        quantity: 1,
        category: "Bakery",
        estimatedPrice: "$1.89",
        completed: false,
        storeRecommendation: "ALDI",
        saleSavings: "Save $0.30 vs average",
        nutritionHighlights: "5g fiber per slice"
      },
      {
        name: "Eggs (dozen)",
        quantity: 1,
        category: "Dairy",
        estimatedPrice: "$2.29",
        completed: false,
        storeRecommendation: "ALDI",
        saleSavings: "Save $0.30 vs average",
        nutritionHighlights: "Complete protein, vitamin B12"
      },
      {
        name: "Ground Beef 80/20",
        quantity: 1,
        category: "Meat & Seafood",
        estimatedPrice: "$4.89",
        // per lb
        completed: false,
        storeRecommendation: "Fareway",
        saleSavings: "Fresh ground daily",
        nutritionHighlights: "Iron, zinc, protein"
      }
    ];
    groceryItems3.forEach((item) => {
      const id = randomUUID();
      this.groceryItems.set(id, {
        ...item,
        id,
        completed: false,
        addedBy: "user",
        createdAt: /* @__PURE__ */ new Date(),
        category: item.category || null,
        estimatedPrice: item.estimatedPrice || null,
        actualPrice: item.actualPrice || null,
        bestStore: item.bestStore || null,
        storeLink: item.storeLink || null,
        couponCode: item.couponCode || null,
        onSale: item.onSale || null,
        saleSavings: item.saleSavings || null
      });
    });
    const pantryItems3 = [
      {
        name: "Flour",
        quantity: "2",
        unit: "lbs",
        status: "low",
        purchasePrice: "$3.99",
        purchaseDate: "2025-07-15",
        purchaseStore: "Walmart",
        calories: 455
      },
      {
        name: "Milk",
        quantity: "1",
        unit: "gallon",
        expiryDate: "2025-08-02",
        status: "normal",
        purchasePrice: "$4.29",
        purchaseDate: "2025-07-25",
        purchaseStore: "Kroger",
        calories: 149
      },
      {
        name: "Eggs",
        quantity: "6",
        unit: "count",
        expiryDate: "2025-08-05",
        status: "normal",
        purchasePrice: "$3.49",
        purchaseDate: "2025-07-20",
        purchaseStore: "Fresh Market",
        calories: 70
      }
    ];
    pantryItems3.forEach((item) => {
      const id = randomUUID();
      this.pantryItems.set(id, {
        ...item,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        calories: item.calories || null,
        status: item.status || null,
        expiryDate: item.expiryDate || null,
        purchasePrice: item.purchasePrice || null,
        purchaseDate: item.purchaseDate || null,
        purchaseStore: item.purchaseStore || null
      });
    });
    const stores3 = [
      {
        name: "Whole Foods Market",
        type: "grocery",
        address: "123 Organic Way, Health City, HC 12345",
        website: "https://wholefoodsmarket.com",
        priceRating: 4,
        qualityRating: 5,
        distance: "0.8 miles",
        deliveryAvailable: true,
        curbsideAvailable: true,
        specialOffers: ["10% off with Prime", "Weekly deals on organic produce"]
      },
      {
        name: "Costco Wholesale",
        type: "warehouse",
        address: "456 Bulk Avenue, Savings Town, ST 67890",
        website: "https://costco.com",
        priceRating: 2,
        qualityRating: 4,
        distance: "2.3 miles",
        deliveryAvailable: true,
        curbsideAvailable: false,
        specialOffers: ["Bulk discounts", "Gas rewards", "Executive member cashback"]
      },
      {
        name: "Kroger",
        type: "supermarket",
        address: "789 Main Street, Anywhere, AW 11111",
        website: "https://kroger.com",
        priceRating: 3,
        qualityRating: 3,
        distance: "1.2 miles",
        deliveryAvailable: true,
        curbsideAvailable: true,
        specialOffers: ["Digital coupons", "Fuel points", "Friday freebies"]
      },
      {
        name: "Local Farmers Market",
        type: "farmers_market",
        address: "City Square, Downtown, DT 22222",
        priceRating: 3,
        qualityRating: 5,
        distance: "1.5 miles",
        deliveryAvailable: false,
        curbsideAvailable: false,
        specialOffers: ["Fresh seasonal produce", "Local honey discounts"]
      }
    ];
    stores3.forEach((store2) => {
      const id = randomUUID();
      this.stores.set(id, {
        ...store2,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        address: store2.address || null,
        website: store2.website || null,
        priceRating: store2.priceRating || null,
        qualityRating: store2.qualityRating || null,
        distance: store2.distance || null,
        deliveryAvailable: store2.deliveryAvailable || null,
        curbsideAvailable: store2.curbsideAvailable || null,
        specialOffers: store2.specialOffers || null
      });
    });
    const shoppingTips3 = [
      {
        title: "Shop the Perimeter First",
        description: "Start with fresh produce, dairy, and meats around the store's edges. These are healthier and often less processed options.",
        category: "budgeting",
        tipType: "savings",
        estimatedSavings: "15-20%",
        difficulty: "easy"
      },
      {
        title: "Use Store Apps for Digital Coupons",
        description: "Download your grocery store's app to access exclusive digital coupons and weekly deals. Many stores offer app-only discounts.",
        category: "coupons",
        tipType: "savings",
        estimatedSavings: "$10-30 per trip",
        difficulty: "easy"
      },
      {
        title: "Buy Generic/Store Brands",
        description: "Store brands are typically 20-30% cheaper than name brands and often made by the same manufacturers.",
        category: "budgeting",
        tipType: "savings",
        estimatedSavings: "20-30%",
        difficulty: "easy"
      },
      {
        title: "Shop Seasonal Produce",
        description: "Buy fruits and vegetables when they're in season for better prices and peak flavor. Freeze extras for later use.",
        category: "seasonal",
        tipType: "savings",
        estimatedSavings: "40-60%",
        difficulty: "medium"
      },
      {
        title: "Bulk Buy Non-Perishables",
        description: "Purchase items like rice, pasta, canned goods, and cleaning supplies in bulk to save money per unit.",
        category: "bulk_buying",
        tipType: "savings",
        estimatedSavings: "25-40%",
        difficulty: "medium"
      }
    ];
    shoppingTips3.forEach((tip) => {
      const id = randomUUID();
      this.shoppingTips.set(id, {
        ...tip,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        difficulty: tip.difficulty || null,
        estimatedSavings: tip.estimatedSavings || null,
        isActive: tip.isActive || null
      });
    });
    const foodDatabaseItems = [
      {
        name: "Organic Avocado",
        category: "fruits",
        subCategory: "citrus_and_tropical",
        servingSize: "1 medium (150g)",
        calories: 234,
        nutritionInfo: {
          protein: 3,
          carbs: 12,
          fat: 21,
          fiber: 10,
          sugar: 1,
          sodium: 7,
          potassium: 690,
          vitaminA: 146,
          vitaminC: 12,
          calcium: 13,
          iron: 0.6
        },
        allergens: [],
        dietaryTags: ["vegan", "vegetarian", "keto", "paleo", "gluten_free"],
        averagePrice: "$1.50",
        seasonality: "year_round",
        storageInstructions: "Store at room temperature until ripe, then refrigerate",
        shelfLife: "7-10 days when ripe",
        preparationTips: ["Let ripen at room temperature", "Add lemon juice to prevent browning", "Perfect for guacamole"],
        commonUses: ["guacamole", "toast topping", "salads", "smoothies"],
        isOrganic: true
      },
      {
        name: "Wild-Caught Salmon Fillet",
        category: "proteins",
        subCategory: "fish_seafood",
        servingSize: "3.5 oz (100g)",
        calories: 208,
        nutritionInfo: {
          protein: 25,
          carbs: 0,
          fat: 12,
          fiber: 0,
          sugar: 0,
          sodium: 59,
          cholesterol: 59,
          potassium: 363,
          vitaminA: 12,
          vitaminC: 0,
          calcium: 9,
          iron: 0.3
        },
        allergens: ["fish"],
        dietaryTags: ["high_protein", "keto", "paleo", "omega3_rich"],
        averagePrice: "$12.99",
        seasonality: "year_round",
        storageInstructions: "Keep refrigerated at 32-38\xB0F, use within 2 days",
        shelfLife: "2-3 days fresh, 6 months frozen",
        preparationTips: ["Don't overcook", "Season 15 minutes before cooking", "Cook skin-side down first"],
        commonUses: ["grilled", "baked", "pan-seared", "sushi"],
        isOrganic: false
      },
      {
        name: "Organic Baby Spinach",
        category: "vegetables",
        subCategory: "leafy_greens",
        servingSize: "1 cup (30g)",
        calories: 7,
        nutritionInfo: {
          protein: 0.9,
          carbs: 1.1,
          fat: 0.1,
          fiber: 0.7,
          sugar: 0.1,
          sodium: 24,
          potassium: 167,
          vitaminA: 2813,
          vitaminC: 8.4,
          calcium: 30,
          iron: 0.8
        },
        allergens: [],
        dietaryTags: ["vegan", "vegetarian", "keto", "paleo", "gluten_free", "low_carb"],
        averagePrice: "$3.99",
        seasonality: "year_round",
        storageInstructions: "Keep refrigerated in original container",
        shelfLife: "5-7 days",
        preparationTips: ["Wash just before using", "Great raw or cooked", "Wilts quickly when heated"],
        commonUses: ["salads", "smoothies", "saut\xE9ed", "pizza topping"],
        isOrganic: true
      },
      {
        name: "Greek Yogurt (Plain, Non-Fat)",
        category: "dairy",
        subCategory: "yogurt",
        brand: "Chobani",
        servingSize: "1 cup (245g)",
        calories: 130,
        nutritionInfo: {
          protein: 23,
          carbs: 9,
          fat: 0,
          fiber: 0,
          sugar: 6,
          sodium: 65,
          calcium: 200,
          potassium: 240,
          vitaminA: 0,
          vitaminC: 0,
          iron: 0.1
        },
        allergens: ["milk"],
        dietaryTags: ["vegetarian", "high_protein", "probiotics"],
        averagePrice: "$1.29",
        seasonality: "year_round",
        storageInstructions: "Keep refrigerated at 40\xB0F or below",
        shelfLife: "2-3 weeks unopened, 1 week opened",
        preparationTips: ["Great base for smoothies", "Add honey for sweetness", "Use in baking as substitute"],
        commonUses: ["breakfast", "smoothies", "cooking substitute", "protein snack"],
        isOrganic: false
      },
      {
        name: "Quinoa (Organic, Tri-Color)",
        category: "grains",
        subCategory: "ancient_grains",
        servingSize: "1 cup cooked (185g)",
        calories: 222,
        nutritionInfo: {
          protein: 8,
          carbs: 39,
          fat: 4,
          fiber: 5,
          sugar: 2,
          sodium: 13,
          potassium: 318,
          calcium: 31,
          iron: 2.8,
          vitaminA: 5,
          vitaminC: 0
        },
        allergens: [],
        dietaryTags: ["vegan", "vegetarian", "gluten_free", "high_protein", "complete_protein"],
        averagePrice: "$4.99",
        seasonality: "year_round",
        storageInstructions: "Store in airtight container in cool, dry place",
        shelfLife: "2-3 years uncooked, 1 week cooked and refrigerated",
        preparationTips: ["Rinse before cooking", "Toast for nutty flavor", "2:1 water to quinoa ratio"],
        commonUses: ["side dish", "salads", "breakfast bowls", "stuffing"],
        isOrganic: true
      }
    ];
    foodDatabaseItems.forEach((item) => {
      const id = randomUUID();
      this.foodDatabase.set(id, {
        ...item,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        brand: item.brand || null,
        subCategory: item.subCategory || null,
        allergens: item.allergens || null,
        dietaryTags: item.dietaryTags || null,
        averagePrice: item.averagePrice || null,
        seasonality: item.seasonality || null,
        storageInstructions: item.storageInstructions || null,
        shelfLife: item.shelfLife || null,
        preparationTips: item.preparationTips || null,
        commonUses: item.commonUses || null,
        isOrganic: item.isOrganic || null
      });
    });
    const deliveryServicesList = [
      {
        name: "DoorDash",
        type: "food_delivery",
        websiteUrl: "https://www.doordash.com",
        supportedAreas: ["nationwide_us", "canada_major_cities"],
        averageDeliveryTime: "25-45 minutes",
        deliveryFee: "$1.99-$4.99",
        minimumOrder: "$12.00",
        features: ["real_time_tracking", "scheduled_delivery", "contactless_delivery", "group_orders"],
        isActive: true
      },
      {
        name: "Grubhub",
        type: "food_delivery",
        websiteUrl: "https://www.grubhub.com",
        supportedAreas: ["nationwide_us", "london_uk"],
        averageDeliveryTime: "30-50 minutes",
        deliveryFee: "$1.99-$3.99",
        minimumOrder: "$10.00",
        features: ["real_time_tracking", "scheduled_delivery", "pickup_option", "loyalty_rewards"],
        isActive: true
      },
      {
        name: "Uber Eats",
        type: "food_delivery",
        websiteUrl: "https://www.ubereats.com",
        supportedAreas: ["global_major_cities"],
        averageDeliveryTime: "20-40 minutes",
        deliveryFee: "$0.99-$4.99",
        minimumOrder: "$12.00",
        features: ["real_time_tracking", "scheduled_delivery", "uber_one_benefits", "grocery_delivery"],
        isActive: true
      },
      {
        name: "Instacart",
        type: "grocery_delivery",
        websiteUrl: "https://www.instacart.com",
        supportedAreas: ["us_canada"],
        averageDeliveryTime: "1-3 hours",
        deliveryFee: "$3.99-$7.99",
        minimumOrder: "$35.00",
        features: ["same_day_delivery", "personal_shopper", "prescription_delivery", "bulk_items"],
        isActive: true
      }
    ];
    deliveryServicesList.forEach((service) => {
      const id = randomUUID();
      this.deliveryServices.set(id, {
        ...service,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        isActive: service.isActive || null,
        apiEndpoint: service.apiEndpoint || null,
        supportedAreas: service.supportedAreas || null,
        averageDeliveryTime: service.averageDeliveryTime || null,
        deliveryFee: service.deliveryFee || null,
        minimumOrder: service.minimumOrder || null,
        features: service.features || null
      });
    });
    const restaurantItems = [
      {
        restaurantName: "Chipotle Mexican Grill",
        itemName: "Chicken Burrito Bowl",
        description: "Cilantro-lime rice, black beans, chicken, salsa, cheese, lettuce",
        category: "mains",
        price: "$8.95",
        calories: 630,
        nutritionInfo: {
          protein: 45,
          carbs: 40,
          fat: 24,
          fiber: 12,
          sugar: 4,
          sodium: 1370
        },
        allergens: ["milk"],
        dietaryTags: ["high_protein", "gluten_free"],
        ingredients: ["rice", "black beans", "chicken", "cheese", "salsa", "lettuce"],
        doordashUrl: "https://www.doordash.com/store/chipotle-mexican-grill",
        grubhubUrl: "https://www.grubhub.com/restaurant/chipotle-mexican-grill",
        ubereatsUrl: "https://www.ubereats.com/store/chipotle-mexican-grill",
        isAvailable: true
      },
      {
        restaurantName: "Sweetgreen",
        itemName: "Harvest Bowl",
        description: "Organic mesclun, roasted chicken, roasted sweet potato, apples, goat cheese, toasted almonds, balsamic vinaigrette",
        category: "mains",
        price: "$13.95",
        calories: 540,
        nutritionInfo: {
          protein: 25,
          carbs: 35,
          fat: 32,
          fiber: 8,
          sugar: 18,
          sodium: 970
        },
        allergens: ["milk", "nuts"],
        dietaryTags: ["high_protein", "organic"],
        ingredients: ["mesclun", "chicken", "sweet potato", "apples", "goat cheese", "almonds", "balsamic"],
        doordashUrl: "https://www.doordash.com/store/sweetgreen",
        grubhubUrl: "https://www.grubhub.com/restaurant/sweetgreen",
        ubereatsUrl: "https://www.ubereats.com/store/sweetgreen",
        isAvailable: true
      },
      {
        restaurantName: "Subway",
        itemName: "Turkey Breast 6-inch Sub",
        description: "Oven-roasted turkey breast on 9-grain wheat bread with vegetables",
        category: "mains",
        price: "$5.99",
        calories: 280,
        nutritionInfo: {
          protein: 18,
          carbs: 40,
          fat: 4.5,
          fiber: 5,
          sugar: 5,
          sodium: 810
        },
        allergens: ["wheat", "soy"],
        dietaryTags: ["high_protein", "low_fat"],
        ingredients: ["turkey", "wheat bread", "lettuce", "tomato", "cucumber"],
        doordashUrl: "https://www.doordash.com/store/subway",
        grubhubUrl: "https://www.grubhub.com/restaurant/subway",
        ubereatsUrl: "https://www.ubereats.com/store/subway",
        isAvailable: true
      },
      {
        restaurantName: "Panda Express",
        itemName: "Orange Chicken with Fried Rice",
        description: "Crispy chicken glazed with orange sauce served with fried rice",
        category: "mains",
        price: "$9.50",
        calories: 820,
        nutritionInfo: {
          protein: 36,
          carbs: 85,
          fat: 31,
          fiber: 3,
          sugar: 19,
          sodium: 1460
        },
        allergens: ["wheat", "soy", "eggs"],
        dietaryTags: [],
        ingredients: ["chicken", "orange sauce", "rice", "vegetables", "soy sauce"],
        doordashUrl: "https://www.doordash.com/store/panda-express",
        grubhubUrl: "https://www.grubhub.com/restaurant/panda-express",
        ubereatsUrl: "https://www.ubereats.com/store/panda-express",
        isAvailable: true
      }
    ];
    restaurantItems.forEach((item) => {
      const id = randomUUID();
      const deliveryServiceId = Array.from(this.deliveryServices.keys())[0];
      this.restaurantMenuItems.set(id, {
        ...item,
        id,
        deliveryServiceId,
        createdAt: /* @__PURE__ */ new Date(),
        description: item.description || null,
        ingredients: item.ingredients || null,
        imageUrl: item.imageUrl || null,
        calories: item.calories || null,
        nutritionInfo: item.nutritionInfo || null,
        allergens: item.allergens || null,
        dietaryTags: item.dietaryTags || null,
        isAvailable: item.isAvailable || null,
        doordashUrl: item.doordashUrl || null,
        grubhubUrl: item.grubhubUrl || null,
        ubereatsUrl: item.ubereatsUrl || null
      });
    });
    const sampleSubscriptionPlans = [
      {
        name: "Free",
        description: "Basic AI cooking assistant with limited features",
        stripePriceId: "price_free",
        // This would be a real Stripe price ID in production
        price: 0,
        interval: "month",
        trialDays: 0,
        features: [
          "Basic recipe suggestions",
          "Simple meal planning",
          "Limited voice commands",
          "Basic grocery lists"
        ],
        isActive: true
      },
      {
        name: "Premium",
        description: "Enhanced AI cooking with advanced features and unlimited access",
        stripePriceId: "price_premium_monthly",
        // This would be a real Stripe price ID in production
        price: 499,
        // $4.99/month - proven PlateJoy pricing model
        interval: "month",
        trialDays: 7,
        features: [
          "Unlimited AI recipe generation",
          "Advanced meal planning with nutrition tracking",
          "Full voice command suite",
          "Smart grocery lists with price comparison",
          "Premium recipe collections",
          "Nutritional analysis and tracking",
          "Priority customer support",
          "Export meal plans and shopping lists"
        ],
        isActive: true
      },
      {
        name: "Pro",
        description: "Professional chef-level features for restaurants and power users",
        stripePriceId: "price_pro_monthly",
        // This would be a real Stripe price ID in production
        price: 999,
        // $9.99 in cents - competitive with PlateJoy
        interval: "month",
        trialDays: 14,
        features: [
          "Everything in Premium",
          "Restaurant partnership features",
          "Advanced dietary restriction management",
          "Professional recipe scaling and conversion",
          "Inventory management with expiration tracking",
          "Meal prep optimization",
          "Integration with smart kitchen appliances",
          "Custom nutrition goals and tracking",
          "Advanced voice AI with natural conversation",
          "Recipe creation from photo analysis",
          "Bulk meal planning for families",
          "White-label customization options"
        ],
        isActive: true
      },
      {
        name: "Premium Yearly",
        description: "Enhanced AI cooking with advanced features - yearly billing",
        stripePriceId: "price_premium_yearly",
        // This would be a real Stripe price ID in production
        price: 4799,
        // $47.99 yearly (20% savings vs $59.88 monthly)
        interval: "year",
        trialDays: 7,
        features: [
          "Everything in Premium Plan",
          "Save 20% compared to monthly billing",
          "Priority customer support",
          "Early access to new features",
          "Annual recipe collection bonus"
        ],
        isActive: true
      },
      {
        name: "Lifetime Pass",
        description: "One-time payment for lifetime access to all ChefGrocer features - Limited time launch offer!",
        stripePriceId: "price_lifetime_pass",
        // This would be a real Stripe price ID in production
        price: 9999,
        // $99.99 - premium lifetime value pricing
        maxUsers: 1e3,
        // Limited launch offer for urgency
        currentUsers: 47,
        // Show growing adoption
        interval: "lifetime",
        trialDays: 0,
        features: [
          "Everything in Pro Plan - Forever",
          "Lifetime access to all current and future features",
          "No recurring payments ever",
          "Priority customer support for life",
          "Early access to all new features",
          "Exclusive lifetime member perks",
          "Restaurant partnership features",
          "Advanced dietary restriction management",
          "Professional recipe scaling and conversion",
          "Inventory management with expiration tracking",
          "Meal prep optimization",
          "Integration with smart kitchen appliances",
          "Custom nutrition goals and tracking",
          "Advanced voice AI with natural conversation",
          "Recipe creation from photo analysis",
          "Bulk meal planning for families",
          "Complete offline recipe access",
          "Export to professional recipe formats",
          "Founding member status and badge"
        ],
        isActive: true
      }
    ];
    sampleSubscriptionPlans.forEach((plan) => {
      const id = randomUUID();
      this.subscriptionPlans.set(id, {
        ...plan,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        isActive: plan.isActive || null,
        trialDays: plan.trialDays || null,
        maxUsers: plan.maxUsers || null,
        currentUsers: plan.currentUsers || 0
      });
    });
    const sampleCoupons = [
      {
        code: "LAUNCH50",
        name: "Launch Special - 50% Off",
        description: "Limited time: 50% off your first month of ChefGrocer Premium",
        discountType: "percentage",
        discountValue: 50,
        minAmount: 0,
        maxUses: 1e3,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        // 30 days from now
        isActive: true,
        applicablePlans: ["price_premium_monthly", "price_premium_yearly"]
      },
      {
        code: "EARLYBIRD",
        name: "Early Bird Discount",
        description: "Get $10 off the Lifetime Pass (first 100 users only)",
        discountType: "fixed_amount",
        discountValue: 1e3,
        // $10.00 in cents
        minAmount: 5e3,
        // Minimum for lifetime pass
        maxUses: 100,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
        // 7 days from now
        isActive: true,
        applicablePlans: ["price_lifetime_pass"]
      },
      {
        code: "FIRSTUSER",
        name: "First User Bonus",
        description: "Extended 21-day trial for early adopters",
        discountType: "percentage",
        discountValue: 100,
        // 100% off trial period
        minAmount: 0,
        maxUses: 200,
        // Limited to first 200 users
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        // 30 days from now
        isActive: true,
        applicablePlans: ["price_premium_monthly", "price_premium_yearly"]
      },
      {
        code: "ANNUAL25",
        name: "Annual Plan Bonus",
        description: "Extra 25% off yearly subscriptions",
        discountType: "percentage",
        discountValue: 25,
        minAmount: 2e3,
        // Only for yearly plan
        maxUses: 500,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3),
        // 60 days from now
        isActive: true,
        applicablePlans: ["price_premium_yearly"]
      },
      {
        code: "APPSTORE25",
        name: "App Store Launch - 25% Off",
        description: "App Store exclusive: 25% off for new iOS users",
        discountType: "percentage",
        discountValue: 25,
        minAmount: 0,
        maxUses: 2e3,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3),
        // 90 days for App Store launch
        isActive: true,
        applicablePlans: ["price_premium_monthly", "price_premium_yearly"]
      }
    ];
    sampleCoupons.forEach((coupon) => {
      const id = randomUUID();
      this.coupons.set(id, {
        ...coupon,
        id,
        usedCount: 0,
        createdAt: /* @__PURE__ */ new Date(),
        description: coupon.description || null,
        isActive: coupon.isActive || null,
        minAmount: coupon.minAmount || null,
        maxUses: coupon.maxUses || null,
        validUntil: coupon.validUntil || null,
        applicablePlans: coupon.applicablePlans || null
      });
    });
    const samplePremiumMealPlans = [
      {
        name: "7-Day Mediterranean Diet",
        description: "A complete Mediterranean diet meal plan focusing on fresh ingredients, healthy fats, and balanced nutrition",
        price: 1999,
        // $19.99 in cents
        duration: 7,
        meals: [
          {
            day: 1,
            breakfast: "Greek Yogurt with Berries and Honey",
            lunch: "Mediterranean Quinoa Salad",
            dinner: "Grilled Salmon with Roasted Vegetables",
            snacks: ["Mixed Nuts", "Hummus with Vegetables"]
          },
          {
            day: 2,
            breakfast: "Avocado Toast with Tomatoes",
            lunch: "Greek Salad with Grilled Chicken",
            dinner: "Herb-Crusted Cod with Lemon Rice",
            snacks: ["Greek Yogurt", "Olives and Cheese"]
          },
          {
            day: 3,
            breakfast: "Mediterranean Scrambled Eggs",
            lunch: "Lentil and Vegetable Soup",
            dinner: "Grilled Chicken with Roasted Eggplant",
            snacks: ["Fresh Fruit", "Almonds"]
          }
        ],
        nutritionGoals: {
          calories: 1800,
          protein: 120,
          carbs: 200,
          fat: 70
        },
        dietaryTags: ["mediterranean", "heart_healthy", "high_protein"],
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
        isActive: true
      },
      {
        name: "14-Day Keto Kickstart",
        description: "A comprehensive ketogenic diet plan designed to help you enter ketosis while enjoying delicious low-carb meals",
        price: 2999,
        // $29.99 in cents
        duration: 14,
        meals: [
          {
            day: 1,
            breakfast: "Keto Bacon and Eggs",
            lunch: "Avocado Chicken Salad",
            dinner: "Grilled Steak with Broccoli",
            snacks: ["Cheese and Pepperoni", "Macadamia Nuts"]
          },
          {
            day: 2,
            breakfast: "Keto Smoothie with MCT Oil",
            lunch: "Cauliflower Rice Bowl",
            dinner: "Baked Salmon with Asparagus",
            snacks: ["Pork Rinds", "Avocado with Salt"]
          }
        ],
        nutritionGoals: {
          calories: 1600,
          protein: 100,
          carbs: 25,
          fat: 130
        },
        dietaryTags: ["keto", "low_carb", "high_fat"],
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        isActive: true
      }
    ];
    samplePremiumMealPlans.forEach((plan) => {
      const id = randomUUID();
      this.premiumMealPlans.set(id, {
        ...plan,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        imageUrl: plan.imageUrl || null,
        isActive: plan.isActive || null,
        dietaryTags: plan.dietaryTags || null,
        nutritionGoals: plan.nutritionGoals || null
      });
    });
  }
  // Recipe methods
  async getRecipes() {
    return Array.from(this.recipes.values());
  }
  async getRecipe(id) {
    return this.recipes.get(id);
  }
  async createRecipe(insertRecipe) {
    const id = randomUUID();
    const recipe = { ...insertRecipe, id, createdAt: /* @__PURE__ */ new Date() };
    this.recipes.set(id, recipe);
    return recipe;
  }
  async searchRecipes(query) {
    const recipes3 = Array.from(this.recipes.values());
    return recipes3.filter(
      (recipe) => recipe.name.toLowerCase().includes(query.toLowerCase()) || recipe.description?.toLowerCase().includes(query.toLowerCase()) || recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query.toLowerCase()))
    );
  }
  // Meal Plan methods
  async getMealPlans(date) {
    const mealPlans3 = Array.from(this.mealPlans.values());
    if (date) {
      return mealPlans3.filter((plan) => plan.date === date);
    }
    return mealPlans3;
  }
  async getMealPlan(id) {
    return this.mealPlans.get(id);
  }
  async createMealPlan(insertMealPlan) {
    const id = randomUUID();
    const mealPlan = { ...insertMealPlan, id, createdAt: /* @__PURE__ */ new Date() };
    this.mealPlans.set(id, mealPlan);
    return mealPlan;
  }
  async updateMealPlan(id, updates) {
    const mealPlan = this.mealPlans.get(id);
    if (!mealPlan) throw new Error("Meal plan not found");
    const updated = { ...mealPlan, ...updates };
    this.mealPlans.set(id, updated);
    return updated;
  }
  async deleteMealPlan(id) {
    this.mealPlans.delete(id);
  }
  // Grocery Item methods
  async getGroceryItems() {
    return Array.from(this.groceryItems.values());
  }
  async createGroceryItem(insertItem) {
    const id = randomUUID();
    const item = { ...insertItem, id, completed: false, addedBy: "user", createdAt: /* @__PURE__ */ new Date() };
    this.groceryItems.set(id, item);
    return item;
  }
  async updateGroceryItem(id, updates) {
    const item = this.groceryItems.get(id);
    if (!item) throw new Error("Grocery item not found");
    const updated = { ...item, ...updates };
    this.groceryItems.set(id, updated);
    return updated;
  }
  async deleteGroceryItem(id) {
    this.groceryItems.delete(id);
  }
  // Pantry Item methods
  async getPantryItems() {
    return Array.from(this.pantryItems.values());
  }
  async createPantryItem(insertItem) {
    const id = randomUUID();
    const item = { ...insertItem, id, createdAt: /* @__PURE__ */ new Date() };
    this.pantryItems.set(id, item);
    return item;
  }
  async updatePantryItem(id, updates) {
    const item = this.pantryItems.get(id);
    if (!item) throw new Error("Pantry item not found");
    const updated = { ...item, ...updates };
    this.pantryItems.set(id, updated);
    return updated;
  }
  async deletePantryItem(id) {
    this.pantryItems.delete(id);
  }
  // Store methods
  async getStores() {
    return Array.from(this.stores.values());
  }
  async createStore(insertStore) {
    const id = randomUUID();
    const store2 = { ...insertStore, id, createdAt: /* @__PURE__ */ new Date() };
    this.stores.set(id, store2);
    return store2;
  }
  async updateStore(id, updates) {
    const store2 = this.stores.get(id);
    if (!store2) throw new Error("Store not found");
    const updated = { ...store2, ...updates };
    this.stores.set(id, updated);
    return updated;
  }
  async deleteStore(id) {
    this.stores.delete(id);
  }
  // Shopping Tips methods
  async getShoppingTips() {
    return Array.from(this.shoppingTips.values());
  }
  async createShoppingTip(insertTip) {
    const id = randomUUID();
    const tip = { ...insertTip, id, createdAt: /* @__PURE__ */ new Date() };
    this.shoppingTips.set(id, tip);
    return tip;
  }
  async getShoppingTipsByCategory(category) {
    const tips = Array.from(this.shoppingTips.values());
    return tips.filter((tip) => tip.category === category && tip.isActive);
  }
  // Food Database methods
  async searchFoodDatabase(query, filters) {
    const foods = Array.from(this.foodDatabase.values());
    return foods.filter((food) => {
      const matchesQuery = food.name.toLowerCase().includes(query.toLowerCase()) || food.category.toLowerCase().includes(query.toLowerCase()) || food.subCategory && food.subCategory.toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (filters?.category && food.category !== filters.category) return false;
      if (filters?.maxCalories && food.calories > filters.maxCalories) return false;
      if (filters?.dietaryTags?.length && !filters.dietaryTags.some((tag) => food.dietaryTags.includes(tag))) return false;
      if (filters?.allergenFree?.length && filters.allergenFree.some((allergen) => food.allergens.includes(allergen))) return false;
      return true;
    });
  }
  async getFoodDatabaseItem(id) {
    return this.foodDatabase.get(id);
  }
  async createFoodDatabaseItem(insertItem) {
    const id = randomUUID();
    const item = { ...insertItem, id, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    this.foodDatabase.set(id, item);
    return item;
  }
  async updateFoodDatabaseItem(id, updates) {
    const item = this.foodDatabase.get(id);
    if (!item) throw new Error("Food item not found");
    const updated = { ...item, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.foodDatabase.set(id, updated);
    return updated;
  }
  // Delivery Services methods
  async getDeliveryServices() {
    return Array.from(this.deliveryServices.values()).filter((service) => service.isActive);
  }
  async createDeliveryService(insertService) {
    const id = randomUUID();
    const service = { ...insertService, id, createdAt: /* @__PURE__ */ new Date() };
    this.deliveryServices.set(id, service);
    return service;
  }
  async getDeliveryServicesByArea(area) {
    const services = Array.from(this.deliveryServices.values());
    return services.filter(
      (service) => service.isActive && service.supportedAreas.some(
        (supportedArea) => supportedArea.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(supportedArea.toLowerCase())
      )
    );
  }
  // Restaurant Menu Items methods
  async getRestaurantMenuItems(filters) {
    const items = Array.from(this.restaurantMenuItems.values());
    return items.filter((item) => {
      if (!item.isAvailable) return false;
      if (filters?.restaurant && !item.restaurantName.toLowerCase().includes(filters.restaurant.toLowerCase())) return false;
      if (filters?.category && item.category !== filters.category) return false;
      if (filters?.maxPrice && parseFloat(item.price.replace("$", "")) > filters.maxPrice) return false;
      if (filters?.dietaryTags?.length && !filters.dietaryTags.some((tag) => item.dietaryTags.includes(tag))) return false;
      return true;
    });
  }
  async createRestaurantMenuItem(insertItem) {
    const id = randomUUID();
    const item = { ...insertItem, id, createdAt: /* @__PURE__ */ new Date() };
    this.restaurantMenuItems.set(id, item);
    return item;
  }
  async getMenuItemsByDeliveryService(serviceId) {
    const items = Array.from(this.restaurantMenuItems.values());
    return items.filter((item) => item.deliveryServiceId === serviceId && item.isAvailable);
  }
  // Users methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.users.set(id, updated);
    return updated;
  }
  async updateStripeCustomerId(userId, stripeCustomerId) {
    return this.updateUser(userId, { stripeCustomerId });
  }
  async updateUserStripeInfo(userId, stripeCustomerId, stripeSubscriptionId) {
    return this.updateUser(userId, { stripeCustomerId, stripeSubscriptionId });
  }
  // Subscription Plans methods
  async getSubscriptionPlans() {
    return Array.from(this.subscriptionPlans.values()).filter((plan) => plan.isActive);
  }
  async getSubscriptionPlan(id) {
    return this.subscriptionPlans.get(id);
  }
  async createSubscriptionPlan(insertPlan) {
    const id = randomUUID();
    const plan = { ...insertPlan, id, createdAt: /* @__PURE__ */ new Date() };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }
  async updateSubscriptionPlan(id, updates) {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) throw new Error("Subscription plan not found");
    const updated = { ...plan, ...updates };
    this.subscriptionPlans.set(id, updated);
    return updated;
  }
  // Payment Transactions methods
  async getPaymentTransactions(userId) {
    const transactions = Array.from(this.paymentTransactions.values());
    return userId ? transactions.filter((t) => t.userId === userId) : transactions;
  }
  async getPaymentTransaction(id) {
    return this.paymentTransactions.get(id);
  }
  async createPaymentTransaction(insertTransaction) {
    const id = randomUUID();
    const transaction = { ...insertTransaction, id, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    this.paymentTransactions.set(id, transaction);
    return transaction;
  }
  async updatePaymentTransaction(id, updates) {
    const transaction = this.paymentTransactions.get(id);
    if (!transaction) throw new Error("Payment transaction not found");
    const updated = { ...transaction, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.paymentTransactions.set(id, updated);
    return updated;
  }
  // Premium Meal Plans methods
  async getPremiumMealPlans() {
    return Array.from(this.premiumMealPlans.values()).filter((plan) => plan.isActive);
  }
  async getPremiumMealPlan(id) {
    return this.premiumMealPlans.get(id);
  }
  async createPremiumMealPlan(insertPlan) {
    const id = randomUUID();
    const plan = { ...insertPlan, id, createdAt: /* @__PURE__ */ new Date() };
    this.premiumMealPlans.set(id, plan);
    return plan;
  }
  async updatePremiumMealPlan(id, updates) {
    const plan = this.premiumMealPlans.get(id);
    if (!plan) throw new Error("Premium meal plan not found");
    const updated = { ...plan, ...updates };
    this.premiumMealPlans.set(id, updated);
    return updated;
  }
  // Additional Subscription Plan methods
  async getSubscriptionPlanByStripeId(stripePriceId) {
    return Array.from(this.subscriptionPlans.values()).find((plan) => plan.stripePriceId === stripePriceId);
  }
  // Coupon methods
  async getCoupons() {
    return Array.from(this.coupons.values());
  }
  async getActiveCoupons() {
    const now = /* @__PURE__ */ new Date();
    return Array.from(this.coupons.values()).filter(
      (coupon) => coupon.isActive && (!coupon.validUntil || new Date(coupon.validUntil) > now) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
    );
  }
  async getCoupon(id) {
    return this.coupons.get(id);
  }
  async getCouponByCode(code) {
    return Array.from(this.coupons.values()).find((coupon) => coupon.code === code);
  }
  async createCoupon(insertCoupon) {
    const id = randomUUID();
    const coupon = { ...insertCoupon, id, usedCount: 0, createdAt: /* @__PURE__ */ new Date() };
    this.coupons.set(id, coupon);
    return coupon;
  }
  async validateCoupon(code, planId) {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) return null;
    const now = /* @__PURE__ */ new Date();
    if (!coupon.isActive) return null;
    if (coupon.validUntil && new Date(coupon.validUntil) < now) return null;
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return null;
    if (coupon.validFrom && new Date(coupon.validFrom) > now) return null;
    if (planId && coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(planId)) {
      return null;
    }
    return coupon;
  }
  async recordCouponUsage(userId, couponId, discountAmount) {
    const id = randomUUID();
    const userCoupon = {
      id,
      userId,
      couponId,
      usedAt: /* @__PURE__ */ new Date(),
      discountAmount,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.userCoupons.set(id, userCoupon);
    const coupon = this.coupons.get(couponId);
    if (coupon) {
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      this.coupons.set(couponId, coupon);
    }
    return userCoupon;
  }
  // Additional User methods for trial support
  async updateUserTrialInfo(userId, trialEndsAt, trialUsed) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, trialEndsAt, trialUsed, updatedAt: /* @__PURE__ */ new Date() };
    this.users.set(userId, updated);
    return updated;
  }
  async updateUserStripeCustomerId(userId, stripeCustomerId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, stripeCustomerId, updatedAt: /* @__PURE__ */ new Date() };
    this.users.set(userId, updated);
    return updated;
  }
};
var storage = new MemStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
var isAuthenticated = async (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log("\u{1F527} Development mode: bypassing authentication");
    return next();
  }
  const user = req.user;
  if (!req.isAuthenticated || !req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/services/usda-api.ts
import { z } from "zod";
var USDAFoodSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  dataType: z.string().optional(),
  brandOwner: z.string().optional(),
  brandName: z.string().optional(),
  ingredients: z.string().optional(),
  foodNutrients: z.array(z.object({
    nutrient: z.object({
      id: z.number(),
      number: z.string(),
      name: z.string(),
      unitName: z.string()
    }),
    amount: z.number()
  })).optional(),
  foodCategory: z.object({
    id: z.number(),
    code: z.string(),
    description: z.string()
  }).optional()
});
var USDASearchResultSchema = z.object({
  foods: z.array(USDAFoodSchema),
  totalHits: z.number(),
  currentPage: z.number(),
  totalPages: z.number()
});
var USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";
var USDAFoodDataService = class {
  apiKey;
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.USDA_API_KEY || "";
  }
  async makeRequest(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error("USDA API key is required. Please set USDA_API_KEY environment variable.");
    }
    const url = new URL(`${USDA_BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  async searchFoods(query, pageSize = 25, pageNumber = 1) {
    try {
      const data = await this.makeRequest("/foods/search", {
        query,
        pageSize,
        pageNumber
      });
      return USDASearchResultSchema.parse(data);
    } catch (error) {
      console.error("Error searching USDA foods:", error);
      throw error;
    }
  }
  async getFoodById(fdcId) {
    try {
      const data = await this.makeRequest(`/food/${fdcId}`);
      return USDAFoodSchema.parse(data);
    } catch (error) {
      console.error("Error fetching USDA food by ID:", error);
      throw error;
    }
  }
  async getFoodsByIds(fdcIds) {
    try {
      const data = await this.makeRequest("/foods", {
        fdcIds: fdcIds.join(",")
      });
      if (Array.isArray(data)) {
        return data.map((food) => USDAFoodSchema.parse(food));
      }
      return [];
    } catch (error) {
      console.error("Error fetching USDA foods by IDs:", error);
      throw error;
    }
  }
  // Convert USDA nutrition data to our app's format
  formatNutritionInfo(foodNutrients) {
    if (!foodNutrients) return {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    const nutritionMap = {
      "203": "protein",
      // Protein (g)
      "205": "carbs",
      // Carbohydrate, by difference (g)
      "204": "fat",
      // Total lipid (fat) (g)
      "291": "fiber",
      // Fiber, total dietary (g)
      "269": "sugar",
      // Sugars, total including NLEA (g)
      "307": "sodium",
      // Sodium, Na (mg)
      "601": "cholesterol",
      // Cholesterol (mg)
      "301": "calcium",
      // Calcium, Ca (mg)
      "303": "iron",
      // Iron, Fe (mg)
      "401": "vitaminC",
      // Vitamin C, total ascorbic acid (mg)
      "320": "vitaminA"
      // Vitamin A, RAE (µg)
    };
    const nutrition = {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    foodNutrients.forEach((nutrient) => {
      const key = nutritionMap[nutrient.nutrient.number];
      if (key) {
        nutrition[key] = Math.round((nutrient.amount || 0) * 100) / 100;
      }
    });
    return nutrition;
  }
  // Enhanced search with nutrition filtering
  async searchFoodsWithNutrition(query, options = {}) {
    const searchResult = await this.searchFoods(
      query,
      options.pageSize || 25,
      options.pageNumber || 1
    );
    const enhancedFoods = searchResult.foods.map((food) => {
      const nutritionInfo = this.formatNutritionInfo(food.foodNutrients);
      const calories = this.calculateCalories(nutritionInfo);
      return {
        ...food,
        calories,
        nutritionInfo,
        allergens: this.extractAllergens(food.ingredients || ""),
        dietaryTags: this.extractDietaryTags(food.ingredients || "", nutritionInfo)
      };
    }).filter((food) => {
      if (options.maxCalories && food.calories > options.maxCalories) return false;
      if (options.minProtein && food.nutritionInfo.protein < options.minProtein) return false;
      if (options.allergenFree && options.allergenFree.some(
        (allergen) => food.allergens.includes(allergen.toLowerCase())
      )) return false;
      return true;
    });
    return {
      foods: enhancedFoods,
      totalHits: searchResult.totalHits,
      currentPage: searchResult.currentPage,
      totalPages: searchResult.totalPages
    };
  }
  calculateCalories(nutrition) {
    return Math.round(nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9);
  }
  extractAllergens(ingredients) {
    const allergens = [];
    const ingredientsLower = ingredients.toLowerCase();
    const allergenMap = {
      "milk": ["milk", "dairy", "lactose", "whey", "casein"],
      "eggs": ["egg", "albumin"],
      "fish": ["fish", "salmon", "tuna", "cod"],
      "shellfish": ["shrimp", "crab", "lobster", "shellfish"],
      "tree nuts": ["almond", "walnut", "pecan", "cashew", "pistachio"],
      "peanuts": ["peanut"],
      "wheat": ["wheat", "gluten"],
      "soy": ["soy", "soybean"]
    };
    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some((keyword) => ingredientsLower.includes(keyword))) {
        allergens.push(allergen);
      }
    });
    return allergens;
  }
  extractDietaryTags(ingredients, nutrition) {
    const tags = [];
    const ingredientsLower = ingredients.toLowerCase();
    if (!ingredientsLower.includes("meat") && !ingredientsLower.includes("chicken") && !ingredientsLower.includes("beef") && !ingredientsLower.includes("pork")) {
      tags.push("vegetarian");
    }
    if (!ingredientsLower.includes("milk") && !ingredientsLower.includes("egg") && !ingredientsLower.includes("dairy")) {
      tags.push("vegan");
    }
    if (!ingredientsLower.includes("wheat") && !ingredientsLower.includes("gluten")) {
      tags.push("gluten-free");
    }
    if (nutrition.protein > 15) tags.push("high-protein");
    if (nutrition.fiber > 5) tags.push("high-fiber");
    if (nutrition.sodium < 140) tags.push("low-sodium");
    if (nutrition.fat < 3) tags.push("low-fat");
    return tags;
  }
};
var usdaService = new USDAFoodDataService();

// server/services/themealdb-api.ts
var BASE_URL = "https://www.themealdb.com/api/json/v1/1";
var TheMealDBAPI = class {
  // Search recipes by name
  static async searchByName(query) {
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("TheMealDB search error:", error);
      return [];
    }
  }
  // Get random recipe
  static async getRandomRecipe() {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      const data = await response.json();
      return data.meals?.[0] || null;
    } catch (error) {
      console.error("TheMealDB random recipe error:", error);
      return null;
    }
  }
  // Get recipe by ID
  static async getRecipeById(id) {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals?.[0] || null;
    } catch (error) {
      console.error("TheMealDB lookup error:", error);
      return null;
    }
  }
  // Filter by ingredient
  static async filterByIngredient(ingredient) {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("TheMealDB ingredient filter error:", error);
      return [];
    }
  }
  // Filter by category
  static async filterByCategory(category) {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("TheMealDB category filter error:", error);
      return [];
    }
  }
  // Filter by cuisine/area
  static async filterByArea(area) {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("TheMealDB area filter error:", error);
      return [];
    }
  }
  // Get all categories
  static async getCategories() {
    try {
      const response = await fetch(`${BASE_URL}/categories.php`);
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error("TheMealDB categories error:", error);
      return [];
    }
  }
  // Get all areas/cuisines
  static async getAreas() {
    try {
      const response = await fetch(`${BASE_URL}/list.php?a=list`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("TheMealDB areas error:", error);
      return [];
    }
  }
  // Get all ingredients
  static async getIngredients() {
    try {
      const response = await fetch(`${BASE_URL}/list.php?i=list`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("TheMealDB ingredients error:", error);
      return [];
    }
  }
  // Convert MealDB recipe to our app format
  static convertToAppFormat(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          amount: measure?.trim() || "1",
          unit: ""
        });
      }
    }
    return {
      id: meal.idMeal,
      title: meal.strMeal,
      name: meal.strMeal,
      description: meal.strInstructions?.substring(0, 200) + "..." || "",
      instructions: meal.strInstructions || "",
      image: meal.strMealThumb,
      category: meal.strCategory,
      cuisine: meal.strArea,
      ingredients,
      readyInMinutes: 30,
      // Default since TheMealDB doesn't provide cook time
      servings: 4,
      // Default
      source: "TheMealDB"
    };
  }
};

// server/services/free-recipe-api.ts
var FreeRecipeAPI = class {
  // Search recipes using free APIs
  static async searchRecipes(query, options = {}) {
    try {
      const results = [];
      if (query) {
        const themealdbResults = await TheMealDBAPI.searchByName(query);
        const convertedResults = themealdbResults.map(
          (recipe) => this.convertTheMealDBToFreeRecipe(recipe)
        );
        results.push(...convertedResults);
      }
      if (options.cuisine && !query) {
        const cuisineResults = await TheMealDBAPI.filterByArea(options.cuisine);
        const convertedResults = cuisineResults.map(
          (recipe) => this.convertTheMealDBToFreeRecipe(recipe)
        );
        results.push(...convertedResults);
      }
      if (!query && !options.cuisine) {
        const randomRecipes = await this.getMultipleRandomRecipes(options.number || 10);
        results.push(...randomRecipes);
      }
      let filteredResults = results;
      if (options.diet) {
        filteredResults = this.filterByDiet(filteredResults, options.diet);
      }
      if (options.maxReadyTime) {
        filteredResults = filteredResults.filter(
          (recipe) => recipe.readyInMinutes <= options.maxReadyTime
        );
      }
      const offset = options.offset || 0;
      const number = options.number || 12;
      const paginatedResults = filteredResults.slice(offset, offset + number);
      return {
        results: paginatedResults,
        totalResults: filteredResults.length,
        offset,
        number
      };
    } catch (error) {
      console.error("Free recipe search error:", error);
      return {
        results: [],
        totalResults: 0,
        offset: 0,
        number: 0
      };
    }
  }
  // Get random recipes
  static async getRandomRecipes(count = 1) {
    const recipes3 = await this.getMultipleRandomRecipes(count);
    return recipes3;
  }
  // Find recipes by ingredients
  static async findRecipesByIngredients(ingredients, options = {}) {
    try {
      const results = [];
      for (const ingredient of ingredients.slice(0, 3)) {
        const recipes3 = await TheMealDBAPI.filterByIngredient(ingredient);
        const convertedRecipes = recipes3.map(
          (recipe) => this.convertTheMealDBToFreeRecipe(recipe)
        );
        results.push(...convertedRecipes);
      }
      const uniqueRecipes = results.filter(
        (recipe, index2, self) => index2 === self.findIndex((r) => r.id === recipe.id)
      );
      return uniqueRecipes.slice(0, options.number || 10);
    } catch (error) {
      console.error("Free recipes by ingredients error:", error);
      return [];
    }
  }
  // Get recipe details by ID
  static async getRecipeInformation(id) {
    try {
      const recipe = await TheMealDBAPI.getRecipeById(id);
      return recipe ? this.convertTheMealDBToFreeRecipe(recipe) : null;
    } catch (error) {
      console.error("Free recipe information error:", error);
      return null;
    }
  }
  // Get multiple random recipes
  static async getMultipleRandomRecipes(count) {
    const recipes3 = [];
    const promises = Array(Math.min(count, 20)).fill(null).map(
      () => TheMealDBAPI.getRandomRecipe()
    );
    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        const converted = this.convertTheMealDBToFreeRecipe(result.value);
        if (!recipes3.find((r) => r.id === converted.id)) {
          recipes3.push(converted);
        }
      }
    }
    return recipes3;
  }
  // Convert TheMealDB recipe to our format
  static convertTheMealDBToFreeRecipe(mealDBRecipe) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = mealDBRecipe[`strIngredient${i}`];
      const measure = mealDBRecipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          amount: measure ? measure.trim() : "1",
          unit: this.extractUnit(measure)
        });
      }
    }
    const instructions = mealDBRecipe.strInstructions ? mealDBRecipe.strInstructions.split(/\r\n|\n|\r/).filter((step) => step.trim()) : [];
    const dietary = this.getDietaryInfo(mealDBRecipe, ingredients);
    return {
      id: mealDBRecipe.idMeal,
      title: mealDBRecipe.strMeal,
      image: mealDBRecipe.strMealThumb,
      readyInMinutes: this.estimateCookTime(ingredients.length, instructions.length),
      servings: 4,
      // Default serving size
      instructions,
      ingredients,
      cuisine: mealDBRecipe.strArea || "International",
      category: mealDBRecipe.strCategory || "Main Course",
      dietary,
      source: "TheMealDB",
      sourceUrl: `https://www.themealdb.com/meal/${mealDBRecipe.idMeal}`,
      nutrition: this.estimateNutrition(ingredients, mealDBRecipe.strCategory)
    };
  }
  // Extract unit from measurement string
  static extractUnit(measure) {
    if (!measure) return "piece";
    const unitMap = {
      "cup": "cup",
      "cups": "cup",
      "tsp": "tsp",
      "tbsp": "tbsp",
      "tablespoon": "tbsp",
      "teaspoon": "tsp",
      "lb": "lb",
      "lbs": "lb",
      "oz": "oz",
      "g": "g",
      "kg": "kg",
      "ml": "ml",
      "l": "l",
      "pint": "pint",
      "quart": "quart"
    };
    const lowerMeasure = measure.toLowerCase();
    for (const [key, value] of Object.entries(unitMap)) {
      if (lowerMeasure.includes(key)) {
        return value;
      }
    }
    return "piece";
  }
  // Estimate cooking time based on complexity
  static estimateCookTime(ingredientCount, instructionCount) {
    const baseTime = 20;
    const ingredientTime = ingredientCount * 2;
    const instructionTime = instructionCount * 3;
    return Math.min(Math.max(baseTime + ingredientTime + instructionTime, 15), 120);
  }
  // Get dietary information
  static getDietaryInfo(recipe, ingredients) {
    const dietary = [];
    const ingredientNames = ingredients.map((ing) => ing.name.toLowerCase()).join(" ");
    if (!ingredientNames.includes("meat") && !ingredientNames.includes("chicken") && !ingredientNames.includes("beef") && !ingredientNames.includes("pork") && !ingredientNames.includes("fish") && !ingredientNames.includes("salmon") && !ingredientNames.includes("tuna")) {
      dietary.push("vegetarian");
    }
    if (!ingredientNames.includes("milk") && !ingredientNames.includes("cheese") && !ingredientNames.includes("butter") && !ingredientNames.includes("cream") && !ingredientNames.includes("yogurt")) {
      dietary.push("dairy-free");
    }
    if (!ingredientNames.includes("flour") && !ingredientNames.includes("bread") && !ingredientNames.includes("pasta") && !ingredientNames.includes("wheat")) {
      dietary.push("gluten-free");
    }
    return dietary;
  }
  // Estimate nutrition based on ingredients and category
  static estimateNutrition(ingredients, category) {
    const baseNutrition = {
      "Beef": { calories: 400, protein: 35, carbohydrates: 20, fat: 20 },
      "Chicken": { calories: 350, protein: 40, carbohydrates: 15, fat: 15 },
      "Seafood": { calories: 300, protein: 35, carbohydrates: 10, fat: 12 },
      "Vegetarian": { calories: 250, protein: 15, carbohydrates: 40, fat: 8 },
      "Pasta": { calories: 450, protein: 15, carbohydrates: 60, fat: 15 },
      "Dessert": { calories: 500, protein: 8, carbohydrates: 70, fat: 20 },
      "Breakfast": { calories: 300, protein: 20, carbohydrates: 35, fat: 12 }
    };
    const defaultNutrition = { calories: 350, protein: 25, carbohydrates: 30, fat: 15 };
    return baseNutrition[category] || defaultNutrition;
  }
  // Filter recipes by diet
  static filterByDiet(recipes3, diet) {
    const dietMap = {
      "vegetarian": ["vegetarian"],
      "vegan": ["vegetarian", "dairy-free"],
      "gluten-free": ["gluten-free"],
      "dairy-free": ["dairy-free"],
      "keto": ["gluten-free"],
      // Simplified for demo
      "paleo": ["gluten-free", "dairy-free"]
    };
    const requiredDietary = dietMap[diet.toLowerCase()];
    if (!requiredDietary) return recipes3;
    return recipes3.filter(
      (recipe) => requiredDietary.every((dietary) => recipe.dietary.includes(dietary))
    );
  }
};
var freeRecipeService = new FreeRecipeAPI();

// server/services/gemini-ai.ts
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
var GeminiAIService = class {
  // Generate recipe from ingredients using Gemini
  static async generateRecipe(request) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured");
      }
      const { ingredients, dietaryRestrictions = [], cuisine, servings = 4, difficulty = "medium" } = request;
      const prompt = `Create a detailed recipe using these ingredients: ${ingredients.join(", ")}
      
      Requirements:
      - Dietary restrictions: ${dietaryRestrictions.join(", ") || "None"}
      - Cuisine style: ${cuisine || "Any"}
      - Servings: ${servings}
      - Difficulty: ${difficulty}
      
      Please provide a complete recipe with:
      1. Recipe name
      2. Ingredients list with exact measurements
      3. Step-by-step cooking instructions
      4. Cooking time and preparation time
      5. Nutritional highlights
      6. Cost estimate (budget-friendly tips)
      
      Format as JSON with fields: name, ingredients, instructions, prepTime, cookTime, nutrition, cost`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const result = JSON.parse(response.text || "{}");
      console.log("\u2705 Gemini recipe generated successfully");
      return result;
    } catch (error) {
      console.error("Gemini recipe generation error:", error);
      return {
        name: `${request.ingredients[0] || "Ingredient"} Recipe`,
        ingredients: request.ingredients.map((ing) => `1 cup ${ing}`),
        instructions: [
          "Prep all ingredients",
          "Heat pan over medium heat",
          "Cook ingredients until tender",
          "Season to taste and serve"
        ],
        prepTime: "15 minutes",
        cookTime: "20 minutes",
        nutrition: "High in protein and nutrients",
        cost: "$8-12 estimated"
      };
    }
  }
  // Generate cooking instructions using Gemini
  static async generateCookingInstructions(request) {
    try {
      const { recipeName, ingredients, basicInstructions, prepTime, cookTime, servings } = request;
      const prompt = `As an AI cooking assistant, provide detailed step-by-step cooking instructions for: ${recipeName}

      Recipe Details:
      - Ingredients: ${ingredients.join(", ")}
      - Prep Time: ${prepTime || "Unknown"}
      - Cook Time: ${cookTime || "Unknown"}
      - Servings: ${servings || "Unknown"}
      - Basic Instructions: ${basicInstructions.join(". ")}

      Please provide:
      1. A brief cooking overview with key tips
      2. Detailed step-by-step instructions with timing
      3. Pro cooking tips for better results
      4. Safety reminders where relevant

      Format as JSON with:
      - overview: Brief cooking summary
      - steps: Array of {text, timer, tip} objects
      - tips: Array of professional cooking tips`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini cooking instructions error:", error);
      return {
        overview: "AI cooking assistant is temporarily unavailable. Please follow the basic recipe steps.",
        steps: request.basicInstructions.map((instruction, index2) => ({
          text: instruction,
          timer: null,
          tip: null
        })),
        tips: [
          "Always read the entire recipe before starting",
          "Prep all ingredients before cooking (mise en place)",
          "Taste and adjust seasonings as you cook",
          "Keep a clean workspace for food safety"
        ]
      };
    }
  }
  // Generate meal plan using Gemini
  static async generateMealPlan(request) {
    try {
      const { days, dietaryRestrictions = [], budget, preferences = [] } = request;
      const prompt = `Create a ${days}-day meal plan with the following requirements:
      
      - Dietary restrictions: ${dietaryRestrictions.join(", ") || "None"}
      - Budget per day: $${budget || "moderate"}
      - Preferences: ${preferences.join(", ") || "Varied cuisine"}
      
      For each day, provide:
      - Breakfast, lunch, dinner, and one snack
      - Shopping list for all ingredients
      - Estimated total cost
      - Nutritional balance notes
      
      Format as JSON with structure:
      {
        "days": [
          {
            "day": 1,
            "meals": {
              "breakfast": {"name": "", "ingredients": [], "prepTime": ""},
              "lunch": {"name": "", "ingredients": [], "prepTime": ""},
              "dinner": {"name": "", "ingredients": [], "prepTime": ""},
              "snack": {"name": "", "ingredients": [], "prepTime": ""}
            },
            "shoppingList": [],
            "estimatedCost": 0,
            "nutritionNotes": ""
          }
        ],
        "totalCost": 0,
        "shoppingListConsolidated": []
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini meal plan generation error:", error);
      return {
        days: [],
        totalCost: 0,
        shoppingListConsolidated: [],
        error: "Meal plan generation temporarily unavailable"
      };
    }
  }
  // Analyze nutrition using Gemini
  static async analyzeNutrition(request) {
    try {
      const { foodItem, quantity = "1 serving" } = request;
      const prompt = `Provide detailed nutritional analysis for: ${quantity} of ${foodItem}
      
      Include:
      - Calories per serving
      - Macronutrients (protein, carbs, fat) in grams
      - Key vitamins and minerals
      - Health benefits
      - Dietary considerations (allergens, restrictions)
      - Budget-friendly alternatives
      
      Format as JSON:
      {
        "food": "${foodItem}",
        "quantity": "${quantity}",
        "calories": 0,
        "macronutrients": {
          "protein": 0,
          "carbohydrates": 0,
          "fat": 0,
          "fiber": 0
        },
        "vitamins": [],
        "minerals": [],
        "healthBenefits": [],
        "allergens": [],
        "alternatives": []
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini nutrition analysis error:", error);
      return {
        food: request.foodItem,
        quantity: request.quantity || "1 serving",
        error: "Nutrition analysis temporarily unavailable",
        calories: 0,
        macronutrients: { protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
      };
    }
  }
  // Process voice commands using Gemini
  static async processVoiceCommand(command) {
    try {
      const prompt = `You are a smart cooking assistant. Process this voice command and determine the intent and action:
      
      Command: "${command}"
      
      Possible intents:
      - recipe_search: User wants to find recipes
      - cooking_instructions: User wants step-by-step cooking guidance for a specific recipe
      - meal_plan: User wants meal planning help
      - grocery_list: User wants to manage shopping list
      - nutrition_info: User wants nutrition information
      - cooking_help: User needs general cooking assistance
      - price_comparison: User wants price/budget help
      - find_restaurants: User wants to find restaurants or places to eat
      
      Special handling for cooking instructions:
      - If user asks "how to make", "how to cook", "walk me through", "step by step", etc., classify as "cooking_instructions"
      - Extract the recipe name they want instructions for
      
      Respond with JSON:
      {
        "intent": "detected_intent",
        "action": "specific_action_to_take",
        "parameters": {
          "recipe_name": "extracted_recipe_name_if_applicable",
          "query": "original_user_query"
        },
        "response": "friendly_response_to_user"
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini voice command processing error:", error);
      return {
        intent: "unknown",
        action: "error",
        parameters: {},
        response: "I'm sorry, I couldn't understand that command. Please try again."
      };
    }
  }
  static async getRecipeCookingInstructions(recipeName) {
    try {
      const prompt = `As an expert cooking instructor, provide comprehensive step-by-step cooking instructions for: ${recipeName}

      Please provide detailed guidance including:
      1. Ingredient preparation steps
      2. Equipment needed
      3. Step-by-step cooking process with timing
      4. Temperature settings
      5. Visual cues to look for
      6. Safety tips
      7. Common mistakes to avoid
      8. Professional chef tips for best results

      If you don't know the specific recipe, provide general cooking guidance for that type of dish.

      Format as JSON with:
      {
        "recipeName": "name of the dish",
        "overview": "Brief cooking summary and approach",
        "equipment": ["list of needed equipment"],
        "ingredients": ["list of typical ingredients"],
        "steps": [
          {
            "stepNumber": 1,
            "instruction": "detailed step instruction",
            "timing": "estimated time for this step",
            "temperature": "temperature if applicable",
            "tips": "helpful tips for this step",
            "visualCues": "what to look for"
          }
        ],
        "tips": ["array of professional cooking tips"],
        "safetyNotes": ["important safety reminders"],
        "commonMistakes": ["mistakes to avoid"],
        "variations": ["possible recipe variations"]
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini recipe instructions error:", error);
      return {
        recipeName,
        overview: `I'll help you make ${recipeName}. Let me guide you through the cooking process.`,
        equipment: ["Basic cooking equipment"],
        ingredients: ["Check your recipe for specific ingredients"],
        steps: [
          {
            stepNumber: 1,
            instruction: "Gather all ingredients and equipment before starting (mise en place)",
            timing: "5-10 minutes",
            temperature: null,
            tips: "Having everything ready makes cooking smoother",
            visualCues: "All ingredients measured and equipment accessible"
          },
          {
            stepNumber: 2,
            instruction: "Follow your recipe instructions step by step",
            timing: "Varies by recipe",
            temperature: "As specified in recipe",
            tips: "Read the entire recipe before starting",
            visualCues: "Follow visual cues in your specific recipe"
          }
        ],
        tips: [
          "Taste as you go and adjust seasonings",
          "Don't rush - good cooking takes time",
          "Keep your workspace clean and organized",
          "Use fresh, quality ingredients for best results"
        ],
        safetyNotes: [
          "Wash hands frequently",
          "Use proper knife techniques",
          "Handle raw meat safely",
          "Keep hot foods hot and cold foods cold"
        ],
        commonMistakes: [
          "Not reading the recipe completely first",
          "Skipping ingredient prep",
          "Cooking at wrong temperature",
          "Not tasting during cooking"
        ],
        variations: ["Check recipe websites for variations of this dish"]
      };
    }
  }
  // Smart shopping suggestions using Gemini
  static async getShoppingSuggestions(groceryList) {
    try {
      const prompt = `Analyze this grocery list and provide smart shopping suggestions:
      
      Items: ${groceryList.join(", ")}
      
      Provide:
      - Store recommendations (where to find best prices)
      - Seasonal alternatives for better prices
      - Bulk buying opportunities
      - Coupon/sale suggestions
      - Budget optimization tips
      - Missing essentials that pair well
      
      Format as JSON:
      {
        "analysis": {
          "totalEstimatedCost": 0,
          "potentialSavings": 0
        },
        "storeRecommendations": [],
        "seasonalAlternatives": [],
        "bulkBuyingTips": [],
        "couponsAndSales": [],
        "budgetTips": [],
        "suggestedAdditions": []
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini shopping suggestions error:", error);
      return {
        analysis: { totalEstimatedCost: 0, potentialSavings: 0 },
        storeRecommendations: [],
        seasonalAlternatives: [],
        error: "Shopping suggestions temporarily unavailable"
      };
    }
  }
};
var gemini_ai_default = GeminiAIService;

// server/spoonacular.ts
var SPOONACULAR_BASE_URL = "https://api.spoonacular.com";
var API_KEY = process.env.SPOONACULAR_API_KEY;
if (!API_KEY) {
  console.warn("SPOONACULAR_API_KEY not found. Recipe features will use fallback data.");
}
var SpoonacularService = class {
  async makeRequest(endpoint, params = {}) {
    if (!API_KEY) {
      throw new Error("Spoonacular API key not configured");
    }
    const url = new URL(`${SPOONACULAR_BASE_URL}${endpoint}`);
    url.searchParams.append("apiKey", API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
  async searchRecipes(query, options = {}) {
    const params = {
      query,
      number: options.number || 12,
      offset: options.offset || 0,
      addRecipeInformation: true,
      addRecipeNutrition: true,
      fillIngredients: true,
      ...options
    };
    return await this.makeRequest("/recipes/complexSearch", params);
  }
  async getRecipeInformation(id) {
    const params = {
      includeNutrition: true
    };
    return await this.makeRequest(`/recipes/${id}/information`, params);
  }
  async searchRecipesByIngredients(ingredients, options = {}) {
    const params = {
      ingredients: ingredients.join(","),
      number: options.number || 12,
      ranking: options.ranking || 1,
      ignorePantry: options.ignorePantry || true
    };
    return await this.makeRequest("/recipes/findByIngredients", params);
  }
  async getRandomRecipes(options = {}) {
    const params = {
      limitLicense: options.limitLicense || false,
      number: options.number || 6,
      ...options
    };
    return await this.makeRequest("/recipes/random", params);
  }
  async getNutritionByIngredients(ingredients, servings = 1) {
    const params = {
      ingredientList: ingredients.join("\n"),
      servings,
      includeNutrition: true
    };
    return await this.makeRequest("/recipes/parseIngredients", params);
  }
  async getMealPlan(options) {
    const params = {
      timeFrame: options.timeFrame,
      targetCalories: options.targetCalories || 2e3,
      ...options
    };
    return await this.makeRequest("/mealplanner/generate", params);
  }
  async autocompleteIngredient(query, number = 10) {
    const params = {
      query,
      number,
      metaInformation: true
    };
    return await this.makeRequest("/food/ingredients/autocomplete", params);
  }
  async getIngredientInformation(id, amount = 1, unit = "serving") {
    const params = {
      amount,
      unit
    };
    return await this.makeRequest(`/food/ingredients/${id}/information`, params);
  }
  async searchGroceryProducts(query, options = {}) {
    const params = {
      query,
      number: options.number || 25,
      offset: options.offset || 0,
      ...options
    };
    return await this.makeRequest("/food/products/search", params);
  }
  async getProductInformation(id) {
    return await this.makeRequest(`/food/products/${id}`);
  }
  // Wine pairing functionality
  async getWinePairing(food) {
    const params = { food };
    return await this.makeRequest("/food/wine/pairing", params);
  }
  // Recipe cost estimation
  async getRecipePriceBreakdown(id) {
    return await this.makeRequest(`/recipes/${id}/priceBreakdownWidget.json`);
  }
  // Convert between units
  async convertAmounts(ingredientName, sourceAmount, sourceUnit, targetUnit) {
    const params = {
      ingredientName,
      sourceAmount,
      sourceUnit,
      targetUnit
    };
    return await this.makeRequest("/recipes/convert", params);
  }
  // Recipe analysis for dietary restrictions
  async analyzeRecipe(recipe) {
    const params = {
      title: recipe.title,
      servings: recipe.servings,
      ingredients: recipe.ingredients.join("\n"),
      instructions: recipe.instructions
    };
    return await this.makeRequest("/recipes/analyze", params);
  }
  // Substitute ingredients
  async getSubstituteIngredient(ingredientName) {
    const params = { ingredientName };
    return await this.makeRequest("/food/ingredients/substitutes", params);
  }
  // Taste profile analysis
  async getTasteProfile(id) {
    return await this.makeRequest(`/recipes/${id}/tasteWidget.json`);
  }
};
var spoonacularService = new SpoonacularService();

// server/services/shopping.ts
import OpenAI from "openai";
var openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
var REALISTIC_PRICING_DATABASE = {
  "milk": {
    item: "Milk (1 gallon)",
    stores: [
      { name: "Walmart", price: "$3.18", distance: "2.1 miles", delivery: true, curbside: true, savings: "Great Value brand" },
      { name: "Hy-Vee", price: "$3.49", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Fuel Saver points" },
      { name: "Target", price: "$3.29", distance: "2.3 miles", delivery: true, curbside: true, savings: "Good & Gather brand" },
      { name: "ALDI", price: "$2.99", distance: "2.0 miles", delivery: true, curbside: true, savings: "Simply Nature organic available" }
    ],
    bestDeal: { store: "ALDI", price: "$2.99", savings: "Save $0.50 vs average" }
  },
  "bread": {
    item: "Bread (whole wheat loaf)",
    stores: [
      { name: "Walmart", price: "$1.98", distance: "2.1 miles", delivery: true, curbside: true, savings: "Great Value brand" },
      { name: "Hy-Vee", price: "$2.29", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Buy 2 get 1 free" },
      { name: "Fareway", price: "$2.19", distance: "1.5 miles", delivery: false, curbside: true, savings: "Local bakery quality" },
      { name: "ALDI", price: "$1.89", distance: "2.0 miles", delivery: true, curbside: true, savings: "Simply Nature organic $3.49" }
    ],
    bestDeal: { store: "ALDI", price: "$1.89", savings: "Save $0.30 vs average" }
  },
  "eggs": {
    item: "Eggs (dozen large)",
    stores: [
      { name: "Walmart", price: "$2.48", distance: "2.1 miles", delivery: true, curbside: true, savings: "Great Value brand" },
      { name: "Hy-Vee", price: "$2.79", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Cage-free $4.29" },
      { name: "Target", price: "$2.59", distance: "2.3 miles", delivery: true, curbside: true, savings: "Good & Gather brand" },
      { name: "ALDI", price: "$2.29", distance: "2.0 miles", delivery: true, curbside: true, savings: "Never Any! organic $4.99" }
    ],
    bestDeal: { store: "ALDI", price: "$2.29", savings: "Save $0.30 vs average" }
  },
  "bananas": {
    item: "Bananas (per lb)",
    stores: [
      { name: "Walmart", price: "$0.58", distance: "2.1 miles", delivery: true, curbside: true, savings: "Everyday low price" },
      { name: "Hy-Vee", price: "$0.69", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Organic $1.48/lb" },
      { name: "Target", price: "$0.65", distance: "2.3 miles", delivery: true, curbside: true, savings: "Good & Gather organic $1.29" },
      { name: "ALDI", price: "$0.54", distance: "2.0 miles", delivery: true, curbside: true, savings: "Best price guaranteed" }
    ],
    bestDeal: { store: "ALDI", price: "$0.54", savings: "Save $0.11 vs average" }
  },
  "chicken breast": {
    item: "Chicken Breast (per lb)",
    stores: [
      { name: "Walmart", price: "$3.98", distance: "2.1 miles", delivery: true, curbside: true, savings: "Family pack $3.68/lb" },
      { name: "Hy-Vee", price: "$4.49", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Buy 2 get $3 off" },
      { name: "Fareway", price: "$3.89", distance: "1.5 miles", delivery: false, curbside: true, savings: "Fresh cut daily" },
      { name: "Target", price: "$4.29", distance: "2.3 miles", delivery: true, curbside: true, savings: "Good & Gather brand" }
    ],
    bestDeal: { store: "Fareway", price: "$3.89", savings: "Save $0.35 vs average" }
  },
  "ground beef": {
    item: "Ground Beef 80/20 (per lb)",
    stores: [
      { name: "Walmart", price: "$4.98", distance: "2.1 miles", delivery: true, curbside: true, savings: "Family pack discount" },
      { name: "Hy-Vee", price: "$5.49", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Hy-Vee brand $4.99" },
      { name: "Fareway", price: "$4.89", distance: "1.5 miles", delivery: false, curbside: true, savings: "Fresh ground daily" },
      { name: "Target", price: "$5.29", distance: "2.3 miles", delivery: true, curbside: true, savings: "Good & Gather 93/7 $6.99" }
    ],
    bestDeal: { store: "Fareway", price: "$4.89", savings: "Save $0.39 vs average" }
  }
};
function getItemPricing(itemName) {
  const normalizedName = itemName.toLowerCase();
  if (REALISTIC_PRICING_DATABASE[normalizedName]) {
    return REALISTIC_PRICING_DATABASE[normalizedName];
  }
  for (const [key, data] of Object.entries(REALISTIC_PRICING_DATABASE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return data;
    }
  }
  return {
    item: itemName,
    stores: [
      { name: "Walmart", price: "$2.98", distance: "2.1 miles", delivery: true, curbside: true, savings: "Great Value brand available" },
      { name: "Hy-Vee", price: "$3.49", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Fuel Saver points" },
      { name: "Target", price: "$3.29", distance: "2.3 miles", delivery: true, curbside: true, savings: "Good & Gather brand" },
      { name: "ALDI", price: "$2.79", distance: "2.0 miles", delivery: true, curbside: true, savings: "Simply Nature organic available" }
    ],
    bestDeal: { store: "ALDI", price: "$2.79", savings: "Save $0.40 vs average" }
  };
}
async function getPriceComparison(items) {
  if (!openai) {
    return items.map((item) => getItemPricing(item) || {
      item,
      stores: [
        { name: "Walmart", price: "$2.98", distance: "2.1 miles", delivery: true, curbside: true, savings: "Great Value brand" },
        { name: "Hy-Vee", price: "$3.49", distance: "1.8 miles", delivery: true, curbside: true, coupon: "Fuel Saver points" },
        { name: "Target", price: "$3.29", distance: "2.3 miles", delivery: true, curbside: true, savings: "Good & Gather brand" },
        { name: "ALDI", price: "$2.79", distance: "2.0 miles", delivery: true, curbside: true, savings: "Best prices" }
      ],
      bestDeal: { store: "ALDI", price: "$2.79", savings: "Save $0.40 vs average" }
    });
  }
  try {
    const prompt = `Find current prices and shopping information for these grocery items: ${items.join(", ")}

    For each item, provide realistic price comparisons across different store types (grocery stores, supermarkets, warehouse clubs, online retailers). Include money-saving opportunities like sales, coupons, and bulk buying options.

    Respond with JSON in this format:
    {
      "priceComparisons": [
        {
          "item": "string",
          "stores": [
            {
              "name": "Store Name",
              "price": "$X.XX",
              "link": "optional store website",
              "distance": "X.X miles",
              "delivery": true/false,
              "curbside": true/false,
              "savings": "Save $X.XX with store card",
              "coupon": "Use code SAVE10 for 10% off"
            }
          ],
          "bestDeal": {
            "store": "Best Store Name",
            "price": "$X.XX",
            "savings": "Save $X.XX vs average price"
          }
        }
      ]
    }`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a smart shopping assistant that helps people find the best deals on groceries. Provide realistic price comparisons and money-saving tips based on current market data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"priceComparisons": []}');
    return result.priceComparisons || [];
  } catch (error) {
    console.error("Failed to get price comparison:", error);
    throw new Error("Failed to get price comparison: " + error.message);
  }
}
async function getNutritionInfo(items) {
  if (!openai) {
    return items.map((item) => ({
      item,
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3,
      fiber: 2,
      sugar: 8,
      sodium: 200,
      servingSize: "1 serving"
    }));
  }
  try {
    const prompt = `Provide detailed nutrition information for these food items: ${items.join(", ")}

    For each item, include calories and macronutrients per standard serving size.

    Respond with JSON in this format:
    {
      "nutritionInfo": [
        {
          "item": "string",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "fiber": number,
          "sugar": number,
          "sodium": number,
          "servingSize": "1 cup, 100g, etc."
        }
      ]
    }`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert providing accurate nutritional data for food items. Use USDA nutritional database standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"nutritionInfo": []}');
    return result.nutritionInfo || [];
  } catch (error) {
    console.error("Failed to get nutrition info:", error);
    throw new Error("Failed to get nutrition info: " + error.message);
  }
}
async function generateShoppingTips(groceryList, budget) {
  if (!openai) {
    return [
      {
        title: "Shop the Perimeter First",
        description: "Start with fresh produce, dairy, and meat around store edges for healthier choices",
        category: "healthy shopping",
        estimatedSavings: "$20-30/week",
        difficulty: "easy"
      },
      {
        title: "Use Store Apps for Digital Coupons",
        description: "Download your grocery store's app to access exclusive digital coupons and weekly deals",
        category: "savings",
        estimatedSavings: "$10-15/week",
        difficulty: "easy"
      }
    ];
  }
  try {
    const prompt = `Generate practical money-saving shopping tips for someone buying: ${groceryList.join(", ")}
    ${budget ? `Budget: $${budget}` : ""}

    Focus on actionable tips that can save money, including:
    - Store selection strategies
    - Timing (best days/times to shop)
    - Coupon and discount opportunities  
    - Bulk buying advice
    - Generic vs brand name recommendations
    - Seasonal considerations

    Respond with JSON in this format:
    {
      "shoppingTips": [
        {
          "title": "string",
          "description": "detailed explanation",
          "category": "budgeting|coupons|seasonal|bulk_buying|timing|store_selection",
          "estimatedSavings": "$X.XX or XX%",
          "difficulty": "easy|medium|advanced"
        }
      ]
    }`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a frugal shopping expert who helps people save money on groceries through strategic shopping techniques."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"shoppingTips": []}');
    return result.shoppingTips || [];
  } catch (error) {
    console.error("Failed to generate shopping tips:", error);
    throw new Error("Failed to generate shopping tips: " + error.message);
  }
}
async function calculateRecipeNutrition(recipe) {
  if (!openai) {
    return {
      totalCalories: 400 * recipe.servings,
      caloriesPerServing: 400,
      nutritionInfo: {
        protein: 20,
        carbs: 30,
        fat: 15,
        fiber: 5,
        sugar: 10,
        sodium: 600
      }
    };
  }
  try {
    const prompt = `Calculate the total nutrition information for this recipe:
    
    Recipe: ${recipe.name}
    Ingredients: ${recipe.ingredients.join(", ")}
    Servings: ${recipe.servings}

    Provide detailed nutritional breakdown including calories and macronutrients.

    Respond with JSON in this format:
    {
      "totalCalories": number,
      "caloriesPerServing": number,
      "nutritionInfo": {
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      }
    }`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition calculator that provides accurate nutritional analysis for recipes using standard USDA nutritional data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"totalCalories": 0, "caloriesPerServing": 0, "nutritionInfo": {}}');
    return result;
  } catch (error) {
    console.error("Failed to calculate recipe nutrition:", error);
    throw new Error("Failed to calculate recipe nutrition: " + error.message);
  }
}

// server/services/food-database.ts
import OpenAI2 from "openai";
var openai2 = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});
async function searchFoodDatabase(query, filters) {
  try {
    const filterText = filters ? `
    Filters:
    ${filters.category ? `- Category: ${filters.category}` : ""}
    ${filters.dietaryTags?.length ? `- Dietary requirements: ${filters.dietaryTags.join(", ")}` : ""}
    ${filters.maxCalories ? `- Maximum calories: ${filters.maxCalories}` : ""}
    ${filters.allergenFree?.length ? `- Must be free from: ${filters.allergenFree.join(", ")}` : ""}
    ` : "";
    const prompt = `Search for foods matching: "${query}"
    ${filterText}

    Provide detailed nutrition information for each food item found. Include comprehensive nutritional data, allergen information, dietary tags, preparation tips, and common uses.

    Respond with JSON in this format:
    {
      "foods": [
        {
          "id": "unique_id",
          "name": "Food Name",
          "category": "fruits|vegetables|proteins|grains|dairy|nuts|oils|beverages|snacks|condiments",
          "subCategory": "more specific category",
          "brand": "Brand Name (if applicable)",
          "servingSize": "1 cup, 100g, 1 medium, etc.",
          "calories": number,
          "nutritionInfo": {
            "protein": number,
            "carbs": number,
            "fat": number,
            "fiber": number,
            "sugar": number,
            "sodium": number,
            "cholesterol": number,
            "potassium": number,
            "vitaminA": number,
            "vitaminC": number,
            "calcium": number,
            "iron": number
          },
          "allergens": ["milk", "eggs", "fish", "shellfish", "nuts", "peanuts", "wheat", "soy"],
          "dietaryTags": ["vegan", "vegetarian", "gluten_free", "keto", "paleo", "low_carb", "high_protein"],
          "averagePrice": "$X.XX per unit",
          "seasonality": "spring|summer|fall|winter|year_round",
          "preparationTips": ["tip1", "tip2"],
          "commonUses": ["use1", "use2"]
        }
      ]
    }`;
    const response = await openai2.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a comprehensive food database expert with access to detailed nutritional information for thousands of foods. Provide accurate, detailed nutritional data based on USDA standards and common food databases."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"foods": []}');
    return result.foods || [];
  } catch (error) {
    console.error("Failed to search food database:", error);
    throw new Error("Failed to search food database: " + error.message);
  }
}
async function findDeliveryOptions(foodItems, location) {
  try {
    const prompt = `Find delivery options for these food items: ${foodItems.join(", ")}
    Location: ${location}

    Search for restaurants and delivery services that offer these items. Include DoorDash, Grubhub, Uber Eats, and other popular delivery platforms. Provide realistic pricing, delivery times, and service information.

    Respond with JSON in this format:
    {
      "deliveryOptions": [
        {
          "serviceName": "DoorDash|Grubhub|Uber Eats|Postmates",
          "restaurantName": "Restaurant Name",
          "itemName": "Menu Item Name",
          "description": "Brief description of the item",
          "price": "$XX.XX",
          "deliveryTime": "25-40 min",
          "deliveryFee": "$X.XX",
          "doordashUrl": "https://doordash.com/...",
          "grubhubUrl": "https://grubhub.com/...",
          "ubereatsUrl": "https://ubereats.com/...",
          "calories": number,
          "rating": 4.5,
          "reviews": 1234
        }
      ]
    }`;
    const response = await openai2.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a delivery service expert with access to real-time information about restaurants and food delivery options. Provide accurate delivery information with realistic pricing and timing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"deliveryOptions": []}');
    return result.deliveryOptions || [];
  } catch (error) {
    console.error("Failed to find delivery options:", error);
    throw new Error("Failed to find delivery options: " + error.message);
  }
}
async function getDetailedNutrition(foodName, quantity) {
  try {
    const prompt = `Provide detailed nutritional information for: ${quantity} of ${foodName}

    Include comprehensive macro and micronutrient data, plus daily value percentages based on a 2000-calorie diet.

    Respond with JSON in this format:
    {
      "name": "${foodName}",
      "quantity": "${quantity}",
      "calories": number,
      "macros": {
        "protein": number,
        "carbs": number,
        "fat": number
      },
      "micros": {
        "fiber": number,
        "sugar": number,
        "sodium": number,
        "cholesterol": number,
        "potassium": number,
        "vitaminA": number,
        "vitaminC": number,
        "calcium": number,
        "iron": number
      },
      "dailyValues": {
        "protein": number,
        "fiber": number,
        "vitaminA": number,
        "vitaminC": number,
        "calcium": number,
        "iron": number
      }
    }`;
    const response = await openai2.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert providing detailed nutritional analysis based on USDA food composition databases. Provide accurate nutritional data and daily value percentages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Failed to get detailed nutrition:", error);
    throw new Error("Failed to get detailed nutrition: " + error.message);
  }
}
async function findSimilarFoods(foodName, preferences) {
  try {
    const preferenceText = preferences ? `
    Preferences:
    ${preferences.healthier ? "- Find healthier alternatives" : ""}
    ${preferences.cheaper ? "- Find more affordable options" : ""}
    ${preferences.sameFlavor ? "- Maintain similar taste profile" : ""}
    ${preferences.dietaryRestrictions?.length ? `- Must meet dietary restrictions: ${preferences.dietaryRestrictions.join(", ")}` : ""}
    ` : "";
    const prompt = `Find similar food alternatives to: ${foodName}
    ${preferenceText}

    Provide detailed comparisons including nutritional benefits, price differences, and availability information.

    Respond with JSON in this format:
    {
      "alternatives": [
        {
          "name": "Alternative Food Name",
          "reason": "Why this is a good alternative",
          "nutritionComparison": "Detailed nutrition comparison",
          "priceComparison": "Price comparison details",
          "availabilityInfo": "Where to find this alternative"
        }
      ]
    }`;
    const response = await openai2.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a food substitution expert who helps people find better alternatives to foods based on their preferences and dietary needs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"alternatives": []}');
    return result.alternatives || [];
  } catch (error) {
    console.error("Failed to find similar foods:", error);
    throw new Error("Failed to find similar foods: " + error.message);
  }
}

// server/barcode-api.ts
import { z as z2 } from "zod";
var BarcodeLookupSchema = z2.object({
  code: z2.string().min(1, "Barcode is required")
});
var MOCK_PRODUCTS = {
  // Common grocery items
  "123456789012": {
    name: "Organic Whole Milk",
    brand: "Horizon Organic",
    category: "Dairy",
    nutrition: {
      calories: 150,
      protein: 8,
      carbs: 12,
      fat: 8
    },
    allergens: ["milk"],
    price_estimate: "$4.99",
    ingredients: ["Organic Grade A Milk", "Vitamin D3"]
  },
  "987654321098": {
    name: "Sourdough Bread",
    brand: "Dave's Killer Bread",
    category: "Bakery",
    nutrition: {
      calories: 120,
      protein: 5,
      carbs: 22,
      fat: 2
    },
    allergens: ["wheat", "gluten"],
    price_estimate: "$5.49",
    ingredients: ["Organic Whole Wheat Flour", "Water", "Organic Cane Sugar", "Sea Salt", "Yeast"]
  },
  "456789123456": {
    name: "Free-Range Eggs",
    brand: "Vital Farms",
    category: "Dairy & Eggs",
    nutrition: {
      calories: 70,
      protein: 6,
      carbs: 0,
      fat: 5
    },
    allergens: ["eggs"],
    price_estimate: "$6.99",
    ingredients: ["Pasture-Raised Eggs"]
  },
  "789123456789": {
    name: "Organic Bananas",
    brand: "Nature's Promise",
    category: "Produce",
    nutrition: {
      calories: 105,
      protein: 1,
      carbs: 27,
      fat: 0
    },
    allergens: [],
    price_estimate: "$1.49/lb",
    ingredients: ["Organic Bananas"]
  },
  "321654987321": {
    name: "Greek Yogurt",
    brand: "Chobani",
    category: "Dairy",
    nutrition: {
      calories: 100,
      protein: 15,
      carbs: 6,
      fat: 0
    },
    allergens: ["milk"],
    price_estimate: "$1.25",
    ingredients: ["Cultured Lowfat Milk", "Natural Flavors", "Live Cultures"]
  },
  "654321789456": {
    name: "Almond Milk",
    brand: "Silk",
    category: "Plant-Based",
    nutrition: {
      calories: 60,
      protein: 1,
      carbs: 8,
      fat: 2.5
    },
    allergens: ["tree nuts"],
    price_estimate: "$3.99",
    ingredients: ["Almondmilk", "Cane Sugar", "Vitamin E", "Sea Salt", "Natural Flavor"]
  },
  // Sample QR code for testing
  "https://chefgrocer.com": {
    name: "ChefGrocer QR Code",
    brand: "ChefGrocer",
    category: "App",
    nutrition: null,
    allergens: [],
    price_estimate: "Free App",
    ingredients: []
  }
};
function normalizeBarcode(code) {
  code = code.replace(/[^a-zA-Z0-9]/g, "");
  if (/^\d+$/.test(code)) {
    if (code.length === 11) {
      code = "0" + code;
    } else if (code.length < 12) {
      code = code.padStart(12, "0");
    }
  }
  return code;
}
async function lookupProduct(code) {
  const normalizedCode = normalizeBarcode(code);
  if (MOCK_PRODUCTS[normalizedCode] || MOCK_PRODUCTS[code]) {
    return MOCK_PRODUCTS[normalizedCode] || MOCK_PRODUCTS[code];
  }
  if (/^\d{12,13}$/.test(normalizedCode)) {
    const isFood = ["0", "1", "2", "3", "4"].includes(normalizedCode[0]);
    const categories = isFood ? ["Pantry", "Produce", "Dairy", "Meat & Seafood", "Frozen", "Bakery"] : ["Health & Beauty", "Household", "Pet Care", "Electronics"];
    const category = categories[Math.floor(Math.random() * categories.length)];
    return {
      name: `${category} Product`,
      brand: "Store Brand",
      category,
      nutrition: isFood ? {
        calories: Math.floor(Math.random() * 300) + 50,
        protein: Math.floor(Math.random() * 20),
        carbs: Math.floor(Math.random() * 40),
        fat: Math.floor(Math.random() * 15)
      } : null,
      allergens: isFood ? [] : [],
      price_estimate: `$${(Math.random() * 10 + 1).toFixed(2)}`,
      ingredients: isFood ? ["Various ingredients"] : []
    };
  }
  if (code.startsWith("http")) {
    return {
      name: "QR Code Link",
      brand: "Web Link",
      category: "Digital",
      nutrition: null,
      allergens: [],
      price_estimate: "N/A",
      ingredients: []
    };
  }
  return null;
}
async function handleBarcodeLookup(req, res) {
  try {
    const parseResult = BarcodeLookupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: parseResult.error.errors
      });
    }
    const { code } = parseResult.data;
    console.log(`Looking up barcode: ${code}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const product = await lookupProduct(code);
    if (product) {
      res.json({
        success: true,
        code,
        product,
        source: "ChefGrocer Database",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      res.json({
        success: true,
        code,
        product: null,
        message: "Product not found in database",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    console.error("Barcode lookup error:", error);
    res.status(500).json({
      error: "Barcode lookup failed",
      message: "Please try again later"
    });
  }
}
async function handleNutritionLookup(req, res) {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Query parameter is required"
      });
    }
    const nutritionResults = [
      {
        name: query,
        ndb_number: "01001",
        nutrition: {
          calories: Math.floor(Math.random() * 200) + 50,
          protein: Math.floor(Math.random() * 25),
          carbs: Math.floor(Math.random() * 30),
          fat: Math.floor(Math.random() * 15),
          fiber: Math.floor(Math.random() * 10),
          sugar: Math.floor(Math.random() * 20),
          sodium: Math.floor(Math.random() * 500)
        },
        serving_size: "100g",
        category: "Food"
      }
    ];
    res.json({
      success: true,
      results: nutritionResults,
      count: nutritionResults.length
    });
  } catch (error) {
    console.error("Nutrition lookup error:", error);
    res.status(500).json({
      error: "Nutrition lookup failed",
      message: "Please try again later"
    });
  }
}

// server/middleware/rate-limit.ts
var store = {};
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1e3);
function createRateLimit(options) {
  return (req, res, next) => {
    try {
      const key = (req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"] || "anonymous").toString();
      const now = Date.now();
      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 1,
          resetTime: now + options.windowMs
        };
        return next();
      }
      store[key].count++;
      if (store[key].count > options.max) {
        return res.status(429).json({
          message: options.message || "Too many requests, please try again later."
        });
      }
      next();
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      next();
    }
  };
}

// server/middleware/validation.ts
import { z as z3 } from "zod";
function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// server/services/location-store-finder.ts
import { z as z4 } from "zod";
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function formatDistance(miles) {
  if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}
function getStoreDatabase() {
  return [
    // Walmart locations
    {
      id: "walmart_1",
      name: "Walmart Supercenter",
      chain: "Walmart",
      address: "4500 Elmore Ave",
      city: "Davenport",
      state: "IA",
      zipCode: "52807",
      phone: "(563) 391-5900",
      latitude: 41.5362,
      longitude: -90.5776,
      distance: 0,
      distanceText: "",
      isOpen: true,
      openingHours: {
        monday: "6:00 AM - 11:00 PM",
        tuesday: "6:00 AM - 11:00 PM",
        wednesday: "6:00 AM - 11:00 PM",
        thursday: "6:00 AM - 11:00 PM",
        friday: "6:00 AM - 11:00 PM",
        saturday: "6:00 AM - 11:00 PM",
        sunday: "6:00 AM - 11:00 PM"
      },
      services: {
        delivery: true,
        curbside: true,
        pharmacy: true,
        deli: true,
        bakery: true,
        gas: true
      },
      website: "https://www.walmart.com/store/1140",
      storeLocatorUrl: "https://www.walmart.com/store/finder",
      estimatedPricing: "budget",
      specialOffers: ["Rollback prices", "Walmart+ free delivery"]
    },
    {
      id: "hy_vee_1",
      name: "Hy-Vee Food Store",
      chain: "Hy-Vee",
      address: "3235 W Kimberly Rd",
      city: "Davenport",
      state: "IA",
      zipCode: "52806",
      phone: "(563) 391-0213",
      latitude: 41.5447,
      longitude: -90.6089,
      distance: 0,
      distanceText: "",
      isOpen: true,
      openingHours: {
        monday: "6:00 AM - 11:00 PM",
        tuesday: "6:00 AM - 11:00 PM",
        wednesday: "6:00 AM - 11:00 PM",
        thursday: "6:00 AM - 11:00 PM",
        friday: "6:00 AM - 11:00 PM",
        saturday: "6:00 AM - 11:00 PM",
        sunday: "6:00 AM - 10:00 PM"
      },
      services: {
        delivery: true,
        curbside: true,
        pharmacy: true,
        deli: true,
        bakery: true,
        gas: true
      },
      website: "https://www.hy-vee.com/stores/detail.aspx?s=1076",
      storeLocatorUrl: "https://www.hy-vee.com/stores",
      estimatedPricing: "moderate",
      specialOffers: ["Fuel Saver + Perks", "Weekly Ad deals"]
    },
    {
      id: "target_1",
      name: "Target",
      chain: "Target",
      address: "5225 Elmore Ave",
      city: "Davenport",
      state: "IA",
      zipCode: "52807",
      phone: "(563) 386-0494",
      latitude: 41.5395,
      longitude: -90.5701,
      distance: 0,
      distanceText: "",
      isOpen: true,
      openingHours: {
        monday: "8:00 AM - 10:00 PM",
        tuesday: "8:00 AM - 10:00 PM",
        wednesday: "8:00 AM - 10:00 PM",
        thursday: "8:00 AM - 10:00 PM",
        friday: "8:00 AM - 10:00 PM",
        saturday: "8:00 AM - 10:00 PM",
        sunday: "8:00 AM - 9:00 PM"
      },
      services: {
        delivery: true,
        curbside: true,
        pharmacy: true,
        deli: false,
        bakery: false,
        gas: false
      },
      website: "https://www.target.com/sl/davenport/1447",
      storeLocatorUrl: "https://www.target.com/store-locator",
      estimatedPricing: "moderate",
      specialOffers: ["Target Circle rewards", "Buy online pickup in store"]
    },
    {
      id: "fareway_1",
      name: "Fareway Food Stores",
      chain: "Fareway",
      address: "1823 E Kimberly Rd",
      city: "Davenport",
      state: "IA",
      zipCode: "52807",
      phone: "(563) 359-7501",
      latitude: 41.5469,
      longitude: -90.5447,
      distance: 0,
      distanceText: "",
      isOpen: true,
      openingHours: {
        monday: "8:00 AM - 9:00 PM",
        tuesday: "8:00 AM - 9:00 PM",
        wednesday: "8:00 AM - 9:00 PM",
        thursday: "8:00 AM - 9:00 PM",
        friday: "8:00 AM - 9:00 PM",
        saturday: "8:00 AM - 9:00 PM",
        sunday: "8:00 AM - 6:00 PM"
      },
      services: {
        delivery: false,
        curbside: true,
        pharmacy: false,
        deli: true,
        bakery: true,
        gas: false
      },
      website: "https://www.fareway.com/stores/",
      storeLocatorUrl: "https://www.fareway.com/stores/",
      estimatedPricing: "budget",
      specialOffers: ["Meat bundling deals", "Local Iowa products"]
    },
    {
      id: "aldis_1",
      name: "ALDI",
      chain: "ALDI",
      address: "4550 Elmore Ave",
      city: "Davenport",
      state: "IA",
      zipCode: "52807",
      phone: "(855) 955-2534",
      latitude: 41.5359,
      longitude: -90.5784,
      distance: 0,
      distanceText: "",
      isOpen: true,
      openingHours: {
        monday: "9:00 AM - 8:00 PM",
        tuesday: "9:00 AM - 8:00 PM",
        wednesday: "9:00 AM - 8:00 PM",
        thursday: "9:00 AM - 8:00 PM",
        friday: "9:00 AM - 8:00 PM",
        saturday: "9:00 AM - 8:00 PM",
        sunday: "9:00 AM - 8:00 PM"
      },
      services: {
        delivery: true,
        curbside: true,
        pharmacy: false,
        deli: false,
        bakery: true,
        gas: false
      },
      website: "https://stores.aldi.us/ia/davenport/4550-elmore-avenue",
      storeLocatorUrl: "https://www.aldi.us/stores/",
      estimatedPricing: "budget",
      specialOffers: ["Weekly Special Buys", "Simply Nature organic products"]
    }
  ];
}
async function findNearbyStores2(userLocation, radiusMiles = 10) {
  const storeDatabase = getStoreDatabase();
  const nearbyStores = [];
  for (const store2 of storeDatabase) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      store2.latitude,
      store2.longitude
    );
    if (distance <= radiusMiles) {
      nearbyStores.push({
        ...store2,
        distance,
        distanceText: formatDistance(distance)
      });
    }
  }
  return nearbyStores.sort((a, b) => a.distance - b.distance);
}
async function getStoresByChain(chain, userLocation, radiusMiles = 15) {
  const allStores = await findNearbyStores2(userLocation, radiusMiles);
  return allStores.filter(
    (store2) => store2.chain.toLowerCase().includes(chain.toLowerCase())
  );
}
async function searchStoresByName(storeName, userLocation) {
  const allStores = await findNearbyStores2(userLocation, 25);
  return allStores.filter(
    (store2) => store2.name.toLowerCase().includes(storeName.toLowerCase()) || store2.chain.toLowerCase().includes(storeName.toLowerCase())
  );
}
async function reverseGeocode(latitude, longitude) {
  try {
    if (latitude >= 41.5 && latitude <= 41.6 && longitude >= -90.7 && longitude <= -90.5) {
      return {
        address: "Davenport, IA area",
        city: "Davenport",
        state: "IA",
        zipCode: "52807"
      };
    }
    return {
      address: "Unknown location",
      city: "Unknown",
      state: "Unknown",
      zipCode: "00000"
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {};
  }
}

// server/google-maps-stores.ts
var GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
function calculateDistance2(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
async function findNearbyStoresWithGoogleMaps(location) {
  if (!GOOGLE_API_KEY) {
    throw new Error("Google API key not configured");
  }
  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`;
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
      throw new Error("Google Geocoding failed");
    }
    const geocodeData = await geocodeResponse.json();
    if (!geocodeData.results || geocodeData.results.length === 0) {
      const lat2 = 41.5236;
      const lng2 = -90.5776;
      const placesUrl2 = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat2},${lng2}&radius=15000&type=grocery_or_pharmacy&keyword=grocery+supermarket+food&key=${GOOGLE_API_KEY}`;
      const placesResponse2 = await fetch(placesUrl2);
      if (!placesResponse2.ok) {
        throw new Error("Google Places API request failed");
      }
      const placesData2 = await placesResponse2.json();
      if (!placesData2.results) {
        return [];
      }
      const stores4 = placesData2.results.filter((place) => place.name && place.business_status === "OPERATIONAL").slice(0, 12).map((place) => {
        const distance = calculateDistance2(lat2, lng2, place.geometry.location.lat, place.geometry.location.lng);
        return {
          id: place.place_id,
          name: place.name,
          type: place.types.includes("supermarket") ? "supermarket" : place.types.includes("grocery_or_pharmacy") ? "grocery" : "store",
          address: place.vicinity || "Address not available",
          distance: `${distance.toFixed(1)} km`,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          rating: place.rating || void 0,
          price_level: place.price_level || void 0,
          hours: place.opening_hours?.open_now ? "Open now" : "Hours unknown",
          photos: place.photos?.[0]?.photo_reference || void 0
        };
      }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      return stores4;
    }
    const { lat, lng } = geocodeData.results[0].geometry.location;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&type=grocery_or_pharmacy&keyword=grocery+supermarket+food&key=${GOOGLE_API_KEY}`;
    const placesResponse = await fetch(placesUrl);
    if (!placesResponse.ok) {
      throw new Error("Google Places API request failed");
    }
    const placesData = await placesResponse.json();
    if (!placesData.results) {
      return [];
    }
    const stores3 = placesData.results.filter((place) => place.name && place.business_status === "OPERATIONAL").slice(0, 12).map((place) => {
      const distance = calculateDistance2(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      return {
        id: place.place_id,
        name: place.name,
        type: place.types.includes("supermarket") ? "supermarket" : place.types.includes("grocery_or_pharmacy") ? "grocery" : "store",
        address: place.vicinity || "Address not available",
        distance: `${distance.toFixed(1)} km`,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating || void 0,
        price_level: place.price_level || void 0,
        hours: place.opening_hours?.open_now ? "Open now" : "Hours unknown",
        photos: place.photos?.[0]?.photo_reference || void 0
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    return stores3;
  } catch (error) {
    console.error("Google Maps store search error:", error);
    throw error;
  }
}

// server/services/openai-service.ts
import OpenAI3 from "openai";
var openai3 = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
async function processVoiceCommand(transcript) {
  try {
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a smart cooking assistant. Analyze voice commands and respond with JSON in this format:
          {
            "action": "timer|recipe_search|ingredient_info|cooking_help|navigation",
            "parameters": {relevant parameters},
            "response": "friendly response to user",
            "confidence": 0.0-1.0
          }
          
          Common actions:
          - timer: set cooking timers
          - recipe_search: find recipes
          - ingredient_info: get ingredient details
          - cooking_help: cooking tips and guidance
          - navigation: navigate app features`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI voice processing error:", error);
    return {
      action: "error",
      response: "I'm having trouble understanding. Please try again.",
      confidence: 0
    };
  }
}
async function enhanceRecipeInstructions(recipe) {
  try {
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Enhance cooking instructions to be clear, step-by-step, and voice-friendly. Include helpful cooking tips and timing guidance."
        },
        {
          role: "user",
          content: `Enhance these cooking instructions: ${recipe}`
        }
      ],
      temperature: 0.4,
      max_tokens: 800
    });
    return response.choices[0].message.content || recipe;
  } catch (error) {
    console.error("OpenAI recipe enhancement error:", error);
    return recipe;
  }
}
async function generateCookingTips(ingredients) {
  try {
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate 3-5 practical cooking tips for the given ingredients. Return as JSON array of strings."
        },
        {
          role: "user",
          content: `Ingredients: ${ingredients.join(", ")}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.tips || [];
  } catch (error) {
    console.error("OpenAI cooking tips error:", error);
    return [`Great choice with ${ingredients[0]}! Remember to prep all ingredients before cooking.`];
  }
}

// server/routes.ts
import { z as z5 } from "zod";
function calculateDistance3(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
var stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil"
  });
}
async function registerRoutes(app2) {
  console.log("\u{1F527} Setting up development authentication...");
  app2.use(session2({
    secret: process.env.SESSION_SECRET || "development-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      // Allow HTTP in development
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const passport2 = (await import("passport")).default;
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  passport2.serializeUser((user, done) => done(null, user));
  passport2.deserializeUser((user, done) => done(null, user));
  console.log("\u2705 Development session initialized");
  const generalRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // 100 requests per window
    message: "Too many requests from this IP, please try again later."
  });
  const strictRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 20,
    // 20 requests per window for AI endpoints
    message: "Rate limit exceeded for AI endpoints. Please try again later."
  });
  app2.use("/api/", generalRateLimit);
  app2.get("/api/auth/user", async (req, res) => {
    try {
      if (req.session && req.session.userId) {
        const mockUser = {
          id: req.session.userId,
          email: "test@chefgrocer.com",
          firstName: "Test",
          lastName: "User",
          profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          subscriptionPlan: "premium",
          subscriptionStatus: "active",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        res.json(mockUser);
        return;
      }
      res.json(null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      req.session.userId = "dev-user-123";
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ message: "Login successful", redirectTo: "/" });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful", redirectTo: "/" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.post("/api/restaurant-partnerships", generalRateLimit, async (req, res) => {
    try {
      const partnership = req.body;
      console.log("New restaurant partnership application:", partnership);
      res.json({
        success: true,
        message: "Partnership application submitted successfully",
        applicationId: `RP-${Date.now()}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit partnership application" });
    }
  });
  app2.post("/api/create-subscription", isAuthenticated, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }
    try {
      const { planId, priceId } = req.body;
      const userId = req.user?.claims?.sub;
      const userEmail = req.user?.claims?.email;
      if (!userEmail) {
        return res.status(400).json({ message: "User email required" });
      }
      let customer;
      try {
        const customers = await stripe.customers.list({
          email: userEmail,
          limit: 1
        });
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              userId
            }
          });
        }
      } catch (error) {
        console.error("Error creating customer:", error);
        return res.status(500).json({ message: "Failed to create customer" });
      }
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `ChefGrocer ${planId} Plan`
            },
            unit_amount: planId === "premium" ? 499 : planId === "pro" ? 999 : planId === "lifetime" ? 9999 : 0,
            ...planId !== "lifetime" && {
              recurring: {
                interval: "month"
              }
            }
          }
        }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"]
      });
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      });
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  app2.post("/api/premium-content/purchase", isAuthenticated, async (req, res) => {
    try {
      const { contentId } = req.body;
      const userId = req.user?.claims?.sub;
      console.log("Premium content purchase:", { userId, contentId });
      res.json({
        success: true,
        message: "Premium content purchased successfully",
        purchaseId: `PC-${Date.now()}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });
  app2.post("/api/stores/find-nearby", async (req, res) => {
    try {
      const { userLocation, radiusMiles = 10, storeFilter } = req.body;
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        return res.status(400).json({
          message: "User location with latitude and longitude is required"
        });
      }
      let stores3;
      if (storeFilter) {
        stores3 = await searchStoresByName(storeFilter, userLocation);
      } else {
        stores3 = await findNearbyStores(userLocation, radiusMiles);
      }
      res.json(stores3);
    } catch (error) {
      console.error("Error finding nearby stores:", error);
      res.status(500).json({ message: "Failed to find nearby stores" });
    }
  });
  app2.post("/api/stores/by-chain", async (req, res) => {
    try {
      const { chain, userLocation, radiusMiles = 15 } = req.body;
      if (!chain || !userLocation) {
        return res.status(400).json({
          message: "Chain name and user location are required"
        });
      }
      const stores3 = await getStoresByChain(chain, userLocation, radiusMiles);
      res.json(stores3);
    } catch (error) {
      console.error("Error finding stores by chain:", error);
      res.status(500).json({ message: "Failed to find stores by chain" });
    }
  });
  app2.post("/api/location/reverse-geocode", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      if (!latitude || !longitude) {
        return res.status(400).json({
          message: "Latitude and longitude are required"
        });
      }
      const addressInfo = await reverseGeocode(latitude, longitude);
      res.json(addressInfo);
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      res.status(500).json({ message: "Failed to reverse geocode location" });
    }
  });
  app2.get("/api/revenue/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = {
        totalRevenue: 18380.5,
        monthlyGrowth: 23.5,
        subscriptionRevenue: 2998,
        restaurantRevenue: 8982,
        affiliateRevenue: 6400.5,
        activeSubscribers: 170,
        restaurantPartners: 18,
        affiliateCommissions: {
          instacart: 3200.25,
          doordash: 1800.5,
          amazon: 1399.75
        }
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue stats" });
    }
  });
  app2.post("/api/search/ingredients", strictRateLimit, async (req, res) => {
    try {
      const { query, useAI = true } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({
          message: "Search query is required",
          results: []
        });
      }
      const localResults = await storage.searchFoodDatabase(query);
      if (localResults.length > 0 && !useAI) {
        return res.json({
          results: localResults.map((item) => ({
            name: item.name,
            category: item.category,
            subCategory: item.subCategory,
            brand: item.brand,
            servingSize: item.servingSize,
            calories: item.calories,
            nutritionInfo: item.nutritionInfo,
            allergens: item.allergens,
            commonUses: [`Used in ${item.category.toLowerCase()} dishes`, "Great for meal prep", "Versatile ingredient"],
            estimatedPrice: `$${(Math.random() * 5 + 1).toFixed(2)}`
          }))
        });
      }
      if (useAI && process.env.GEMINI_API_KEY) {
        try {
          const { analyzeIngredient } = await import("../lib/gemini");
          const aiResults = await analyzeIngredient(query);
          return res.json({
            results: aiResults || localResults.map((item) => ({
              name: item.name,
              category: item.category,
              subCategory: item.subCategory,
              brand: item.brand,
              servingSize: item.servingSize,
              calories: item.calories,
              nutritionInfo: item.nutritionInfo,
              allergens: item.allergens,
              commonUses: [`Used in ${item.category.toLowerCase()} dishes`],
              estimatedPrice: `$${(Math.random() * 5 + 1).toFixed(2)}`
            }))
          });
        } catch (aiError) {
          console.warn("AI search failed, using local results:", aiError);
        }
      }
      res.json({
        results: localResults.map((item) => ({
          name: item.name,
          category: item.category,
          subCategory: item.subCategory,
          brand: item.brand,
          servingSize: item.servingSize,
          calories: item.calories,
          nutritionInfo: item.nutritionInfo,
          allergens: item.allergens,
          commonUses: [`Used in ${item.category.toLowerCase()} dishes`, "Common ingredient"],
          estimatedPrice: `$${(Math.random() * 5 + 1).toFixed(2)}`
        }))
      });
    } catch (error) {
      console.error("Ingredient search error:", error);
      res.status(500).json({
        message: "Failed to search ingredients",
        results: []
      });
    }
  });
  app2.post("/api/ai/nearby-stores", validateBody(z5.object({
    location: z5.string().min(1, "Location is required")
  })), async (req, res) => {
    try {
      const { location } = req.body;
      const stores3 = await findNearbyStoresWithGoogleMaps(location);
      res.json(stores3);
    } catch (error) {
      console.error("Error finding nearby stores:", error);
      res.status(500).json({
        message: "Failed to find nearby stores",
        error: error.message
      });
    }
  });
  app2.post("/api/voice/process-command", async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) {
        return res.status(400).json({ message: "Voice transcript is required" });
      }
      const result = await processVoiceCommand(transcript);
      res.json(result);
    } catch (error) {
      console.error("Voice command processing error:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });
  app2.post("/api/recipes/enhance-instructions", async (req, res) => {
    try {
      const { recipe } = req.body;
      if (!recipe) {
        return res.status(400).json({ message: "Recipe is required" });
      }
      const enhanced = await enhanceRecipeInstructions(recipe);
      res.json({ enhancedInstructions: enhanced });
    } catch (error) {
      console.error("Recipe enhancement error:", error);
      res.status(500).json({ message: "Failed to enhance recipe instructions" });
    }
  });
  app2.post("/api/cooking/tips", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Ingredients array is required" });
      }
      const tips = await generateCookingTips(ingredients);
      res.json({ tips });
    } catch (error) {
      console.error("Cooking tips error:", error);
      res.status(500).json({ message: "Failed to generate cooking tips" });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    });
  });
  app2.get("/api/spoonacular/search", async (req, res) => {
    try {
      const { query, diet, intolerances, type, number = 12, offset = 0 } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await spoonacularService.searchRecipes(query, {
        diet,
        intolerances,
        type,
        number: parseInt(number),
        offset: parseInt(offset)
      });
      res.json(results);
    } catch (error) {
      console.error("Spoonacular search error:", error);
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });
  app2.get("/api/spoonacular/recipe/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recipe = await spoonacularService.getRecipeInformation(parseInt(id));
      res.json(recipe);
    } catch (error) {
      console.error("Spoonacular recipe fetch error:", error);
      res.status(500).json({ message: "Failed to fetch recipe details" });
    }
  });
  app2.get("/api/spoonacular/random", async (req, res) => {
    try {
      const { tags, number = 6 } = req.query;
      const recipes3 = await spoonacularService.getRandomRecipes({
        tags,
        number: parseInt(number)
      });
      res.json(recipes3);
    } catch (error) {
      console.error("Spoonacular random recipes error:", error);
      res.status(500).json({ message: "Failed to fetch random recipes" });
    }
  });
  app2.post("/api/spoonacular/ingredients", async (req, res) => {
    try {
      const { ingredients, number = 12 } = req.body;
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Ingredients array is required" });
      }
      const recipes3 = await spoonacularService.searchRecipesByIngredients(ingredients, {
        number: parseInt(number)
      });
      res.json(recipes3);
    } catch (error) {
      console.error("Spoonacular ingredients search error:", error);
      res.status(500).json({ message: "Failed to search recipes by ingredients" });
    }
  });
  app2.post("/api/spoonacular/meal-plan", async (req, res) => {
    try {
      const { timeFrame, targetCalories, diet, exclude } = req.body;
      const mealPlan = await spoonacularService.getMealPlan({
        timeFrame: timeFrame || "day",
        targetCalories: targetCalories || 2e3,
        diet,
        exclude
      });
      res.json(mealPlan);
    } catch (error) {
      console.error("Spoonacular meal plan error:", error);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });
  app2.post("/api/spoonacular/nutrition", async (req, res) => {
    try {
      const { ingredients, servings = 1 } = req.body;
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Ingredients array is required" });
      }
      const nutrition = await spoonacularService.getNutritionByIngredients(ingredients, servings);
      res.json(nutrition);
    } catch (error) {
      console.error("Spoonacular nutrition error:", error);
      res.status(500).json({ message: "Failed to analyze nutrition" });
    }
  });
  app2.get("/api/spoonacular/autocomplete", async (req, res) => {
    try {
      const { query, number = 10 } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const suggestions = await spoonacularService.autocompleteIngredient(query, parseInt(number));
      res.json(suggestions);
    } catch (error) {
      console.error("Spoonacular autocomplete error:", error);
      res.status(500).json({ message: "Failed to get ingredient suggestions" });
    }
  });
  app2.get("/api/spoonacular/wine-pairing", async (req, res) => {
    try {
      const { food } = req.query;
      if (!food) {
        return res.status(400).json({ message: "Food parameter is required" });
      }
      const pairing = await spoonacularService.getWinePairing(food);
      res.json(pairing);
    } catch (error) {
      console.error("Spoonacular wine pairing error:", error);
      res.status(500).json({ message: "Failed to get wine pairing" });
    }
  });
  app2.get("/api/spoonacular/recipe/:id/price", async (req, res) => {
    try {
      const { id } = req.params;
      const priceBreakdown = await spoonacularService.getRecipePriceBreakdown(parseInt(id));
      res.json(priceBreakdown);
    } catch (error) {
      console.error("Spoonacular price breakdown error:", error);
      res.status(500).json({ message: "Failed to get recipe price breakdown" });
    }
  });
  app2.get("/api/spoonacular/substitutes", async (req, res) => {
    try {
      const { ingredient } = req.query;
      if (!ingredient) {
        return res.status(400).json({ message: "Ingredient parameter is required" });
      }
      const substitutes = await spoonacularService.getSubstituteIngredient(ingredient);
      res.json(substitutes);
    } catch (error) {
      console.error("Spoonacular substitutes error:", error);
      res.status(500).json({ message: "Failed to get ingredient substitutes" });
    }
  });
  app2.get("/api/recipes", async (req, res) => {
    try {
      const recipes3 = await storage.getRecipes();
      res.json(recipes3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  app2.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  app2.post("/api/recipes", async (req, res) => {
    try {
      const validatedData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validatedData);
      res.status(201).json(recipe);
    } catch (error) {
      res.status(400).json({ message: "Invalid recipe data" });
    }
  });
  app2.get("/api/recipes/search/:query", async (req, res) => {
    try {
      const recipes3 = await storage.searchRecipes(req.params.query);
      res.json(recipes3);
    } catch (error) {
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });
  app2.get("/api/meal-plans", async (req, res) => {
    try {
      const date = req.query.date;
      const mealPlans3 = await storage.getMealPlans(date);
      res.json(mealPlans3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });
  app2.post("/api/meal-plans", async (req, res) => {
    try {
      const validatedData = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(validatedData);
      res.status(201).json(mealPlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal plan data" });
    }
  });
  app2.patch("/api/meal-plans/:id", async (req, res) => {
    try {
      const mealPlan = await storage.updateMealPlan(req.params.id, req.body);
      res.json(mealPlan);
    } catch (error) {
      res.status(404).json({ message: "Meal plan not found" });
    }
  });
  app2.delete("/api/meal-plans/:id", async (req, res) => {
    try {
      await storage.deleteMealPlan(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Meal plan not found" });
    }
  });
  app2.get("/api/grocery-items", async (req, res) => {
    try {
      const items = await storage.getGroceryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grocery items" });
    }
  });
  app2.post("/api/grocery-items", async (req, res) => {
    try {
      const validatedData = insertGroceryItemSchema.parse(req.body);
      const item = await storage.createGroceryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid grocery item data" });
    }
  });
  app2.patch("/api/grocery-items/:id", async (req, res) => {
    try {
      const item = await storage.updateGroceryItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(404).json({ message: "Grocery item not found" });
    }
  });
  app2.delete("/api/grocery-items/:id", async (req, res) => {
    try {
      await storage.deleteGroceryItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Grocery item not found" });
    }
  });
  app2.get("/api/pantry-items", async (req, res) => {
    try {
      const items = await storage.getPantryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pantry items" });
    }
  });
  app2.post("/api/pantry-items", async (req, res) => {
    try {
      const validatedData = insertPantryItemSchema.parse(req.body);
      const item = await storage.createPantryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid pantry item data" });
    }
  });
  app2.patch("/api/pantry-items/:id", async (req, res) => {
    try {
      const item = await storage.updatePantryItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(404).json({ message: "Pantry item not found" });
    }
  });
  app2.delete("/api/pantry-items/:id", async (req, res) => {
    try {
      await storage.deletePantryItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Pantry item not found" });
    }
  });
  app2.post("/api/ai/meal-plan", async (req, res) => {
    try {
      const { days = 7, dietaryRestrictions, budget, preferences } = req.body;
      const mealPlan = await gemini_ai_default.generateMealPlan({
        days,
        dietaryRestrictions: dietaryRestrictions || [],
        budget,
        preferences: preferences || []
      });
      res.json(mealPlan);
    } catch (error) {
      console.error("Meal plan generation error:", error);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });
  app2.post("/api/ai/recipe-suggestions", async (req, res) => {
    try {
      const { ingredients, dietaryRestrictions, cookingTime } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "Ingredients array is required" });
      }
      const recipe = await gemini_ai_default.generateRecipe({
        ingredients,
        dietaryRestrictions: dietaryRestrictions || [],
        cookingTime
      });
      res.json({ recipes: [recipe] });
    } catch (error) {
      console.error("Recipe suggestion error:", error);
      res.status(500).json({ message: "Failed to find recipe suggestions" });
    }
  });
  app2.post("/api/ai/voice-command", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command || typeof command !== "string") {
        return res.status(400).json({ message: "Voice command is required" });
      }
      const result = await gemini_ai_default.processVoiceCommand(command);
      res.json(result);
    } catch (error) {
      console.error("Voice command error:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });
  app2.post("/api/ai/grocery-list", async (req, res) => {
    try {
      const { mealPlans: mealPlans3, ingredients } = req.body;
      const groceryList = {
        items: ingredients || [],
        estimatedCost: "$45-60",
        bestStores: ["ALDI", "Walmart", "Hy-Vee"],
        suggestions: [
          "Shop at ALDI for best prices on basics",
          "Check Hy-Vee for fresh produce sales",
          "Consider buying in bulk for frequently used items"
        ]
      };
      res.json(groceryList);
    } catch (error) {
      console.error("Grocery list generation error:", error);
      res.status(500).json({ message: "Failed to generate grocery list" });
    }
  });
  app2.get("/api/food-database", async (req, res) => {
    try {
      const { search } = req.query;
      if (!search || typeof search !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const foods = await storage.searchFoodDatabase(search);
      res.json(foods);
    } catch (error) {
      console.error("Food database search error:", error);
      res.status(500).json({ message: "Failed to search food database" });
    }
  });
  app2.get("/api/stores", async (req, res) => {
    try {
      const stores3 = await storage.getStores();
      res.json(stores3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });
  app2.post("/api/stores", async (req, res) => {
    try {
      const validatedData = insertStoreSchema.parse(req.body);
      const store2 = await storage.createStore(validatedData);
      res.status(201).json(store2);
    } catch (error) {
      res.status(400).json({ message: "Invalid store data" });
    }
  });
  app2.get("/api/shopping-tips", async (req, res) => {
    try {
      const category = req.query.category;
      const tips = category ? await storage.getShoppingTipsByCategory(category) : await storage.getShoppingTips();
      res.json(tips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping tips" });
    }
  });
  app2.post("/api/shopping-tips", async (req, res) => {
    try {
      const validatedData = insertShoppingTipSchema.parse(req.body);
      const tip = await storage.createShoppingTip(validatedData);
      res.status(201).json(tip);
    } catch (error) {
      res.status(400).json({ message: "Invalid shopping tip data" });
    }
  });
  app2.post("/api/ai/price-comparison", async (req, res) => {
    try {
      const { items } = req.body;
      const priceComparison = await getPriceComparison(items);
      res.json(priceComparison);
    } catch (error) {
      res.status(500).json({ message: "Failed to get price comparison" });
    }
  });
  app2.post("/api/ai/nutrition-info", async (req, res) => {
    try {
      const { items } = req.body;
      const nutritionInfo = await getNutritionInfo(items);
      res.json(nutritionInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to get nutrition information" });
    }
  });
  app2.post("/api/ai/shopping-tips", async (req, res) => {
    try {
      const { groceryList, budget } = req.body;
      const shoppingTips3 = await generateShoppingTips(groceryList, budget);
      res.json(shoppingTips3);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate shopping tips" });
    }
  });
  app2.post("/api/ai/nearby-stores", async (req, res) => {
    try {
      const { location, lat, lon, radius = 5e3 } = req.body;
      let latitude = lat;
      let longitude = lon;
      if (!latitude || !longitude) {
        if (!location) {
          return res.status(400).json({ message: "Location or coordinates are required" });
        }
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            "User-Agent": "ChefGrocer/1.0 (contact@chefgrocer.com)"
          }
        });
        const geocodeData = await geocodeResponse.json();
        if (!geocodeData || geocodeData.length === 0) {
          return res.status(404).json({ message: "Location not found" });
        }
        latitude = parseFloat(geocodeData[0].lat);
        longitude = parseFloat(geocodeData[0].lon);
      }
      const overpassQuery = `[out:json][timeout:25];
(
  node["shop"="supermarket"](around:${radius},${latitude},${longitude});
  node["shop"="convenience"](around:${radius},${latitude},${longitude});
  node["shop"="grocery"](around:${radius},${latitude},${longitude});
);
out meta;`;
      const overpassUrl = "https://overpass-api.de/api/interpreter";
      const overpassResponse = await fetch(overpassUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ChefGrocer/1.0 (contact@chefgrocer.com)"
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });
      if (!overpassResponse.ok) {
        console.error("Overpass API error:", overpassResponse.status, overpassResponse.statusText);
        const errorText = await overpassResponse.text();
        console.error("Overpass API error details:", errorText);
        throw new Error(`Overpass API request failed: ${overpassResponse.status}`);
      }
      const overpassData = await overpassResponse.json();
      console.log("Overpass API response:", overpassData.elements?.length || 0, "elements found");
      const stores3 = overpassData.elements.map((element) => {
        let elementLat, elementLon;
        if (element.type === "node") {
          elementLat = element.lat;
          elementLon = element.lon;
        } else if (element.center) {
          elementLat = element.center.lat;
          elementLon = element.center.lon;
        } else {
          return null;
        }
        const distance = calculateDistance3(latitude, longitude, elementLat, elementLon);
        return {
          id: element.id,
          name: element.tags?.name || "Unnamed Store",
          type: element.tags?.shop || "grocery",
          address: [
            element.tags?.["addr:housenumber"],
            element.tags?.["addr:street"],
            element.tags?.["addr:city"],
            element.tags?.["addr:postcode"]
          ].filter(Boolean).join(" ") || "Address not available",
          latitude: elementLat,
          longitude: elementLon,
          distance,
          distanceText: `${distance.toFixed(1)} km`,
          brand: element.tags?.brand || null,
          website: element.tags?.website || null,
          phone: element.tags?.phone || null,
          openingHours: element.tags?.opening_hours || null,
          wheelchair: element.tags?.wheelchair || null
        };
      }).filter(Boolean).sort((a, b) => a.distance - b.distance);
      res.json(stores3);
    } catch (error) {
      console.error("OpenStreetMap nearby stores error:", error);
      res.status(500).json({ message: "Failed to find nearby stores using OpenStreetMap" });
    }
  });
  app2.post("/api/ai/recipe-nutrition", async (req, res) => {
    try {
      const { recipe } = req.body;
      const nutrition = await calculateRecipeNutrition(recipe);
      res.json(nutrition);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate recipe nutrition" });
    }
  });
  app2.post("/api/barcode-lookup", handleBarcodeLookup);
  app2.get("/api/nutrition-lookup", handleNutritionLookup);
  app2.get("/api/placeholder/recipe-image", (req, res) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <rect width="300" height="200" fill="#f3f4f6"/>
      <circle cx="150" cy="100" r="30" fill="#e5e7eb"/>
      <path d="M135 85 L165 85 L165 95 L155 95 L155 115 L145 115 L145 95 L135 95 Z" fill="#9ca3af"/>
      <text x="150" y="140" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">Recipe Image</text>
    </svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.send(svg);
  });
  app2.post("/api/ai/recipe-instructions", async (req, res) => {
    try {
      const { recipe } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          overview: "AI cooking assistant is currently unavailable. Please follow the basic recipe instructions.",
          steps: recipe.instructions?.map((instruction, index2) => ({
            text: instruction,
            timer: null,
            tip: null
          })) || [],
          tips: ["Cook with love and patience", "Taste and adjust seasonings as needed", "Have all ingredients ready before starting"]
        });
      }
      const instructions = await gemini_ai_default.generateCookingInstructions({
        recipeName: recipe.name,
        ingredients: recipe.ingredients || [],
        basicInstructions: recipe.instructions || [],
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings
      });
      res.json(instructions);
    } catch (error) {
      console.error("AI recipe instructions error:", error);
      res.status(500).json({ message: "Failed to generate cooking instructions" });
    }
  });
  app2.get("/api/food-database", async (req, res) => {
    try {
      const query = req.query.q || "";
      const category = req.query.category;
      const maxCalories = req.query.maxCalories ? parseInt(req.query.maxCalories) : void 0;
      const dietaryTags = req.query.dietaryTags ? req.query.dietaryTags.split(",") : void 0;
      const allergenFree = req.query.allergenFree ? req.query.allergenFree.split(",") : void 0;
      const foods = await storage.searchFoodDatabase(query, {
        category,
        maxCalories,
        dietaryTags,
        allergenFree
      });
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to search food database" });
    }
  });
  app2.get("/api/food-database/:id", async (req, res) => {
    try {
      const food = await storage.getFoodDatabaseItem(req.params.id);
      if (!food) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to get food item" });
    }
  });
  app2.post("/api/food-database", async (req, res) => {
    try {
      const validatedData = insertFoodDatabaseSchema.parse(req.body);
      const food = await storage.createFoodDatabaseItem(validatedData);
      res.status(201).json(food);
    } catch (error) {
      res.status(400).json({ message: "Invalid food data" });
    }
  });
  app2.get("/api/delivery-services", async (req, res) => {
    try {
      const area = req.query.area;
      const services = area ? await storage.getDeliveryServicesByArea(area) : await storage.getDeliveryServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delivery services" });
    }
  });
  app2.post("/api/delivery-services", async (req, res) => {
    try {
      const validatedData = insertDeliveryServiceSchema.parse(req.body);
      const service = await storage.createDeliveryService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid delivery service data" });
    }
  });
  app2.get("/api/restaurant-menu", async (req, res) => {
    try {
      const restaurant = req.query.restaurant;
      const category = req.query.category;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : void 0;
      const dietaryTags = req.query.dietaryTags ? req.query.dietaryTags.split(",") : void 0;
      const items = await storage.getRestaurantMenuItems({
        restaurant,
        category,
        maxPrice,
        dietaryTags
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant menu items" });
    }
  });
  app2.post("/api/restaurant-menu", async (req, res) => {
    try {
      const validatedData = insertRestaurantMenuItemSchema.parse(req.body);
      const item = await storage.createRestaurantMenuItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid menu item data" });
    }
  });
  app2.post("/api/ai/food-search", async (req, res) => {
    try {
      const { query, filters } = req.body;
      const foods = await searchFoodDatabase(query, filters);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to search food database" });
    }
  });
  app2.post("/api/ai/delivery-options", async (req, res) => {
    try {
      const { foodItems, location } = req.body;
      const deliveryOptions = await findDeliveryOptions(foodItems, location);
      res.json(deliveryOptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to find delivery options" });
    }
  });
  app2.post("/api/ai/detailed-nutrition", async (req, res) => {
    try {
      const { foodName, quantity } = req.body;
      const nutrition = await getDetailedNutrition(foodName, quantity);
      res.json(nutrition);
    } catch (error) {
      res.status(500).json({ message: "Failed to get detailed nutrition" });
    }
  });
  app2.post("/api/ai/similar-foods", async (req, res) => {
    try {
      const { foodName, preferences } = req.body;
      const similarFoods = await findSimilarFoods(foodName, preferences);
      res.json(similarFoods);
    } catch (error) {
      res.status(500).json({ message: "Failed to find similar foods" });
    }
  });
  app2.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(400).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables." });
      }
      const { amount, currency = "usd", paymentType = "one_time", description } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          paymentType,
          description: description || ""
        }
      });
      await storage.createPaymentTransaction({
        stripePaymentIntentId: paymentIntent.id,
        amount: Math.round(amount * 100),
        currency,
        status: "pending",
        paymentType,
        description: description || "",
        metadata: { paymentIntentId: paymentIntent.id }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/create-subscription", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(400).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables." });
      }
      const { email, stripePriceId, couponCode, startFreeTrial = true } = req.body;
      let coupon = null;
      let discountAmount = 0;
      if (couponCode) {
        coupon = await storage.validateCoupon(couponCode, stripePriceId);
        if (!coupon) {
          return res.status(400).json({ message: "Invalid or expired coupon code" });
        }
      }
      let user = await storage.getUserByEmail(email);
      let customer;
      if (user && user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email,
          name: username
        });
        if (user) {
          user = await storage.updateUserStripeCustomerId(user.id, customer.id);
        } else {
          user = await storage.createUser({
            email,
            username,
            stripeCustomerId: customer.id
          });
        }
      }
      const plan = await storage.getSubscriptionPlanByStripeId(stripePriceId);
      const trialDays = startFreeTrial && !user.trialUsed && plan?.trialDays ? plan.trialDays : 0;
      const subscriptionParams = {
        customer: customer.id,
        items: [{
          price: stripePriceId
        }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"]
      };
      if (trialDays > 0) {
        subscriptionParams.trial_period_days = trialDays;
        const trialEndsAt = /* @__PURE__ */ new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
        await storage.updateUserTrialInfo(user.id, trialEndsAt, true);
      }
      if (coupon) {
        const stripeCoupon = await stripe.coupons.create({
          id: `coupon_${coupon.id}_${Date.now()}`,
          percent_off: coupon.discountType === "percentage" ? coupon.discountValue : void 0,
          amount_off: coupon.discountType === "fixed_amount" ? coupon.discountValue : void 0,
          currency: coupon.discountType === "fixed_amount" ? "usd" : void 0,
          duration: "once"
        });
        subscriptionParams.coupon = stripeCoupon.id;
        if (plan) {
          if (coupon.discountType === "percentage") {
            discountAmount = Math.round(plan.price * coupon.discountValue / 100);
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
      const subscription = await stripe.subscriptions.create(subscriptionParams);
      await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);
      if (coupon && discountAmount > 0) {
        await storage.recordCouponUsage(user.id, coupon.id, discountAmount);
      }
      res.json({
        subscriptionId: subscription.id,
        clientSecret: trialDays > 0 ? null : subscription.latest_invoice?.payment_intent?.client_secret,
        trialDays,
        discountAmount,
        message: trialDays > 0 ? `Your ${trialDays}-day free trial has started!` : void 0
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });
  app2.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      const lifetimePlan = plans.find((plan) => plan.interval === "lifetime");
      if (lifetimePlan && lifetimePlan.maxUsers && lifetimePlan.currentUsers && lifetimePlan.currentUsers >= lifetimePlan.maxUsers) {
        lifetimePlan.isActive = false;
      }
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });
  app2.post("/api/subscription-plans", async (req, res) => {
    try {
      const validatedData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription plan data" });
    }
  });
  app2.get("/api/revenue-metrics", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      const users2 = await storage.getAllUsers();
      const metrics = {
        totalRevenue: plans.reduce((sum, plan) => {
          const subscriberCount = users2.filter((user) => user.stripeSubscriptionId).length;
          return sum + plan.price * subscriberCount;
        }, 0),
        monthlyRecurringRevenue: plans.reduce((sum, plan) => {
          if (plan.interval === "month") {
            const subscriberCount = Math.floor(Math.random() * 50);
            return sum + plan.price * subscriberCount;
          }
          return sum;
        }, 0),
        subscribers: {
          total: 247,
          // Demo data - replace with real user count
          free: 197,
          premium: 35,
          pro: 12,
          lifetime: 3
        },
        conversionRate: 20.2,
        // Demo data
        churnRate: 3.8,
        averageRevenuePerUser: 599,
        // $5.99 in cents
        lifetimeValue: 14400,
        // $144.00 in cents
        trialConversions: 12,
        growthRate: 32.5
      };
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue metrics" });
    }
  });
  app2.get("/api/subscription-analytics", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      const analytics = plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        subscriberCount: plan.name === "Premium" ? 35 : plan.name === "Pro" ? 12 : plan.name === "Lifetime Pass" ? 3 : 0,
        // Demo data
        revenue: plan.name === "Premium" ? 35 * plan.price : plan.name === "Pro" ? 12 * plan.price : plan.name === "Lifetime Pass" ? 3 * plan.price : 0
      }));
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription analytics" });
    }
  });
  app2.get("/api/premium-meal-plans", async (req, res) => {
    try {
      const plans = await storage.getPremiumMealPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch premium meal plans" });
    }
  });
  app2.get("/api/premium-meal-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getPremiumMealPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Premium meal plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch premium meal plan" });
    }
  });
  app2.post("/api/premium-meal-plans", async (req, res) => {
    try {
      const validatedData = insertPremiumMealPlanSchema.parse(req.body);
      const plan = await storage.createPremiumMealPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid premium meal plan data" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.get("/api/payment-transactions", async (req, res) => {
    try {
      const userId = req.query.userId;
      const transactions = await storage.getPaymentTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment transactions" });
    }
  });
  app2.post("/api/validate-coupon", async (req, res) => {
    try {
      const { code, planId } = req.body;
      const coupon = await storage.validateCoupon(code, planId);
      if (!coupon) {
        return res.status(400).json({
          valid: false,
          message: "Invalid or expired coupon code"
        });
      }
      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minAmount: coupon.minAmount
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });
  app2.get("/api/coupons", async (req, res) => {
    try {
      const coupons3 = await storage.getActiveCoupons();
      res.json(coupons3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });
  app2.post("/api/coupons", async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error) {
      res.status(400).json({ message: "Invalid coupon data" });
    }
  });
  app2.post("/api/start-free-trial", async (req, res) => {
    try {
      const { userId, planId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.trialUsed) {
        return res.status(400).json({ message: "Free trial already used" });
      }
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      const trialDays = plan.trialDays || 7;
      const trialEndsAt = /* @__PURE__ */ new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
      await storage.updateUserTrialInfo(userId, trialEndsAt, true);
      res.json({
        message: `${trialDays}-day free trial started!`,
        trialEndsAt,
        trialDays
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to start free trial" });
    }
  });
  app2.get("/api/trial-status/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const now = /* @__PURE__ */ new Date();
      const isTrialActive = user.trialEndsAt && new Date(user.trialEndsAt) > now;
      const daysRemaining = user.trialEndsAt ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - now.getTime()) / (1e3 * 60 * 60 * 24))) : 0;
      res.json({
        trialUsed: user.trialUsed,
        trialActive: isTrialActive,
        trialEndsAt: user.trialEndsAt,
        daysRemaining
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trial status" });
    }
  });
  app2.get("/api/themealdb/search", async (req, res) => {
    try {
      const query = req.query.query || "";
      const cuisine = req.query.cuisine || "";
      let recipes3 = [];
      if (cuisine && cuisine !== "any") {
        recipes3 = await TheMealDBAPI.filterByArea(cuisine);
      } else if (query) {
        recipes3 = await TheMealDBAPI.searchByName(query);
      } else {
        const randomRecipe = await TheMealDBAPI.getRandomRecipe();
        recipes3 = randomRecipe ? [randomRecipe] : [];
      }
      const convertedRecipes = recipes3.map((recipe) => TheMealDBAPI.convertToAppFormat(recipe));
      res.json({ results: convertedRecipes });
    } catch (error) {
      console.error("TheMealDB search error:", error);
      res.status(500).json({
        error: "Recipe search service temporarily unavailable",
        message: "Please try again later"
      });
    }
  });
  app2.get("/api/themealdb/random", async (req, res) => {
    try {
      const recipe = await TheMealDBAPI.getRandomRecipe();
      if (!recipe) {
        return res.status(404).json({ message: "No random recipe found" });
      }
      const convertedRecipe = TheMealDBAPI.convertToAppFormat(recipe);
      res.json(convertedRecipe);
    } catch (error) {
      console.error("TheMealDB random error:", error);
      res.status(500).json({
        error: "Random recipe service temporarily unavailable"
      });
    }
  });
  app2.get("/api/themealdb/categories", async (req, res) => {
    try {
      const categories = await TheMealDBAPI.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("TheMealDB categories error:", error);
      res.status(500).json({
        error: "Categories service temporarily unavailable"
      });
    }
  });
  app2.get("/api/usda/search", async (req, res) => {
    try {
      const { query, maxCalories, minProtein, allergenFree, dietaryTags, pageSize, pageNumber } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      const options = {
        maxCalories: maxCalories ? parseInt(maxCalories) : void 0,
        minProtein: minProtein ? parseInt(minProtein) : void 0,
        allergenFree: allergenFree ? allergenFree.split(",") : void 0,
        dietaryTags: dietaryTags ? dietaryTags.split(",") : void 0,
        pageSize: pageSize ? parseInt(pageSize) : 25,
        pageNumber: pageNumber ? parseInt(pageNumber) : 1
      };
      const results = await usdaService.searchFoodsWithNutrition(query, options);
      res.json(results);
    } catch (error) {
      console.error("USDA search error:", error);
      if (error.message.includes("USDA API key")) {
        res.status(401).json({ error: "USDA API key required. Please set USDA_API_KEY environment variable." });
      } else {
        res.status(500).json({ error: "Failed to search USDA food database" });
      }
    }
  });
  app2.get("/api/usda/food/:fdcId", async (req, res) => {
    try {
      const fdcId = parseInt(req.params.fdcId);
      if (isNaN(fdcId)) {
        return res.status(400).json({ error: "Invalid FDC ID" });
      }
      const food = await usdaService.getFoodById(fdcId);
      const nutritionInfo = usdaService.formatNutritionInfo(food.foodNutrients);
      const calories = nutritionInfo.protein * 4 + nutritionInfo.carbs * 4 + nutritionInfo.fat * 9;
      res.json({
        ...food,
        calories: Math.round(calories),
        nutritionInfo
      });
    } catch (error) {
      console.error("USDA food fetch error:", error);
      if (error.message.includes("USDA API key")) {
        res.status(401).json({ error: "USDA API key required" });
      } else {
        res.status(500).json({ error: "Failed to fetch food data" });
      }
    }
  });
  app2.get("/api/recipes/search", async (req, res) => {
    try {
      const { query, diet, cuisine, maxReadyTime, number = "12", offset = "0" } = req.query;
      const options = {
        diet: diet || void 0,
        cuisine: cuisine || void 0,
        maxReadyTime: maxReadyTime ? parseInt(maxReadyTime) : void 0,
        number: parseInt(number),
        offset: parseInt(offset)
      };
      const results = await freeRecipeService.searchRecipes(query || "", options);
      res.json(results);
    } catch (error) {
      console.error("Free recipe search error:", error);
      res.status(500).json({ error: "Failed to search recipes" });
    }
  });
  app2.get("/api/recipes/random", async (req, res) => {
    try {
      const { number = "6" } = req.query;
      const results = await freeRecipeService.getRandomRecipes(parseInt(number));
      res.json({ recipes: results });
    } catch (error) {
      console.error("Free random recipes error:", error);
      res.status(500).json({ error: "Failed to fetch random recipes" });
    }
  });
  app2.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: "Invalid recipe ID" });
      }
      const recipe = await freeRecipeService.getRecipeInformation(id);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Free recipe details error:", error);
      res.status(500).json({ error: "Failed to fetch recipe details" });
    }
  });
  app2.post("/api/spoonacular/recipes/:id/convert", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { save } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid recipe ID" });
      }
      const spoonacularRecipe = await spoonacularService.getRecipeInformation(id, true);
      const chefGroverRecipe = spoonacularService.convertToChefGroverRecipe(spoonacularRecipe);
      if (save) {
        const savedRecipe = await storage.createRecipe(chefGroverRecipe);
        res.json({
          message: "Recipe saved successfully",
          recipe: savedRecipe,
          spoonacularId: id
        });
      } else {
        res.json({
          message: "Recipe converted",
          recipe: chefGroverRecipe,
          spoonacularId: id
        });
      }
    } catch (error) {
      console.error("Spoonacular convert error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({
          error: "Spoonacular API key required",
          fallback: true
        });
      } else {
        res.status(500).json({ error: "Failed to convert recipe" });
      }
    }
  });
  app2.get("/api/spoonacular/ingredients/search", async (req, res) => {
    try {
      const { query, number = "10" } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      const options = {
        number: parseInt(number),
        metaInformation: true
      };
      const results = await spoonacularService.searchIngredients(query, options);
      res.json(results);
    } catch (error) {
      console.error("Spoonacular ingredient search error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({
          error: "Spoonacular API key required",
          fallback: true
        });
      } else {
        res.status(500).json({ error: "Failed to search ingredients" });
      }
    }
  });
  app2.post("/api/spoonacular/meal-plan/generate", async (req, res) => {
    try {
      const { timeFrame = "day", targetCalories, diet, exclude } = req.body;
      const options = {
        timeFrame,
        targetCalories: targetCalories ? parseInt(targetCalories) : void 0,
        diet,
        exclude
      };
      const mealPlan = await spoonacularService.generateMealPlan(options);
      res.json(mealPlan);
    } catch (error) {
      console.error("Spoonacular meal plan error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({
          error: "Spoonacular API key required for AI meal planning",
          fallback: true
        });
      } else {
        res.status(500).json({ error: "Failed to generate meal plan" });
      }
    }
  });
  app2.get("/api/spoonacular/recipes/findByIngredients", async (req, res) => {
    try {
      const { ingredients, number = "5", ranking = "1" } = req.query;
      if (!ingredients || typeof ingredients !== "string") {
        return res.status(400).json({ error: "Ingredients parameter is required" });
      }
      const ingredientsList = ingredients.split(",").map((i) => i.trim());
      const options = {
        number: parseInt(number),
        ranking: parseInt(ranking),
        ignorePantry: true
      };
      const results = await spoonacularService.findRecipesByIngredients(ingredientsList, options);
      res.json(results);
    } catch (error) {
      console.error("Spoonacular find by ingredients error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({
          error: "Spoonacular API key required",
          fallback: true
        });
      } else {
        res.status(500).json({ error: "Failed to find recipes by ingredients" });
      }
    }
  });
  app2.post("/api/gemini/recipe/generate", strictRateLimit, async (req, res) => {
    try {
      const { ingredients, dietaryRestrictions, cuisine, servings, difficulty } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: "Ingredients array is required" });
      }
      const recipe = await gemini_ai_default.generateRecipe({
        ingredients,
        dietaryRestrictions,
        cuisine,
        servings,
        difficulty
      });
      res.json(recipe);
    } catch (error) {
      console.error("Gemini recipe generation error:", error);
      res.status(500).json({ error: "Failed to generate recipe using AI" });
    }
  });
  app2.post("/api/gemini/meal-plan/generate", strictRateLimit, async (req, res) => {
    try {
      const { days = 7, dietaryRestrictions, budget, preferences } = req.body;
      const mealPlan = await gemini_ai_default.generateMealPlan({
        days,
        dietaryRestrictions,
        budget,
        preferences
      });
      res.json(mealPlan);
    } catch (error) {
      console.error("Gemini meal plan generation error:", error);
      res.status(500).json({ error: "Failed to generate meal plan using AI" });
    }
  });
  app2.post("/api/gemini/nutrition/analyze", strictRateLimit, async (req, res) => {
    try {
      const { foodItem, quantity } = req.body;
      if (!foodItem) {
        return res.status(400).json({ error: "Food item is required" });
      }
      const nutrition = await gemini_ai_default.analyzeNutrition({
        foodItem,
        quantity
      });
      res.json(nutrition);
    } catch (error) {
      console.error("Gemini nutrition analysis error:", error);
      res.status(500).json({ error: "Failed to analyze nutrition using AI" });
    }
  });
  app2.post("/api/gemini/voice/process", strictRateLimit, async (req, res) => {
    try {
      const { command } = req.body;
      if (!command || typeof command !== "string") {
        return res.status(400).json({ error: "Voice command is required" });
      }
      const result = await gemini_ai_default.processVoiceCommand(command);
      if (result.intent === "cooking_instructions" && result.parameters?.recipe_name) {
        const cookingInstructions = await gemini_ai_default.getRecipeCookingInstructions(result.parameters.recipe_name);
        result.cookingInstructions = cookingInstructions;
        result.response = `I'll guide you through making ${result.parameters.recipe_name} step by step. Let's start cooking!`;
      }
      res.json(result);
    } catch (error) {
      console.error("Gemini voice processing error:", error);
      res.status(500).json({ error: "Failed to process voice command using AI" });
    }
  });
  app2.post("/api/gemini/cooking-instructions", strictRateLimit, async (req, res) => {
    try {
      const { recipeName } = req.body;
      if (!recipeName || typeof recipeName !== "string") {
        return res.status(400).json({ error: "Recipe name is required" });
      }
      const instructions = await gemini_ai_default.getRecipeCookingInstructions(recipeName);
      res.json(instructions);
    } catch (error) {
      console.error("Gemini cooking instructions error:", error);
      res.status(500).json({ error: "Failed to get cooking instructions" });
    }
  });
  app2.post("/api/gemini/shopping/suggestions", strictRateLimit, async (req, res) => {
    try {
      const { groceryList } = req.body;
      if (!groceryList || !Array.isArray(groceryList)) {
        return res.status(400).json({ error: "Grocery list array is required" });
      }
      const suggestions = await gemini_ai_default.getShoppingSuggestions(groceryList);
      res.json(suggestions);
    } catch (error) {
      console.error("Gemini shopping suggestions error:", error);
      res.status(500).json({ error: "Failed to get shopping suggestions using AI" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const { q, types = "recipe,ingredient,restaurant,product", limit = 8 } = req.query;
      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json([]);
      }
      const typeArray = types.split(",");
      const searchQuery = q.toLowerCase();
      const searchDatabase = [
        // Recipes
        {
          id: "r1",
          title: "Classic Chicken Parmesan",
          type: "recipe",
          description: "Crispy breaded chicken breast with marinara sauce and melted mozzarella cheese",
          rating: 4.8,
          category: "Italian",
          trending: true,
          cookTime: 45,
          servings: 4,
          difficulty: "Medium"
        },
        {
          id: "r2",
          title: "Healthy Buddha Bowl",
          type: "recipe",
          description: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing",
          rating: 4.6,
          category: "Healthy",
          cookTime: 30,
          servings: 2,
          difficulty: "Easy"
        },
        {
          id: "r3",
          title: "Beef Stir Fry",
          type: "recipe",
          description: "Quick and delicious stir-fry with tender beef and fresh vegetables",
          rating: 4.7,
          category: "Asian",
          cookTime: 20,
          servings: 4,
          difficulty: "Easy"
        },
        {
          id: "r4",
          title: "Homemade Pizza Margherita",
          type: "recipe",
          description: "Classic Italian pizza with fresh mozzarella, basil, and tomato sauce",
          rating: 4.9,
          category: "Italian",
          cookTime: 25,
          servings: 2,
          difficulty: "Medium"
        },
        // Ingredients
        {
          id: "i1",
          title: "Organic Free-Range Chicken Breast",
          type: "ingredient",
          description: "Premium organic chicken breast, antibiotic-free and hormone-free",
          price: 8.99,
          category: "Meat",
          unit: "lb",
          nutrition: { protein: 31, calories: 165 }
        },
        {
          id: "i2",
          title: "Fresh Basil Leaves",
          type: "ingredient",
          description: "Aromatic fresh basil perfect for Italian dishes and garnishing",
          price: 2.49,
          category: "Herbs",
          unit: "bunch",
          nutrition: { vitamin_k: 98, vitamin_a: 15 }
        },
        {
          id: "i3",
          title: "Extra Virgin Olive Oil",
          type: "ingredient",
          description: "Cold-pressed extra virgin olive oil from Mediterranean olives",
          price: 12.99,
          category: "Oils",
          unit: "500ml",
          nutrition: { healthy_fats: 14, vitamin_e: 13 }
        },
        // Restaurants
        {
          id: "rest1",
          title: "Mama Mia Italian Bistro",
          type: "restaurant",
          description: "Authentic Italian cuisine with fresh pasta and wood-fired pizza",
          rating: 4.5,
          category: "Italian",
          price_range: "$$",
          cuisine: "Italian",
          features: ["Delivery", "Takeout", "Dine-in", "Outdoor seating"]
        },
        {
          id: "rest2",
          title: "Green Garden Cafe",
          type: "restaurant",
          description: "Farm-to-table restaurant specializing in organic, locally-sourced ingredients",
          rating: 4.7,
          category: "Healthy",
          price_range: "$$$",
          cuisine: "American",
          features: ["Vegan options", "Gluten-free", "Organic", "Local sourcing"]
        },
        {
          id: "rest3",
          title: "Tokyo Sushi Bar",
          type: "restaurant",
          description: "Fresh sushi and authentic Japanese cuisine in a modern setting",
          rating: 4.6,
          category: "Japanese",
          price_range: "$$$",
          cuisine: "Japanese",
          features: ["Fresh fish", "Sake bar", "Chef specials", "Omakase"]
        },
        // Products
        {
          id: "p1",
          title: "All-Clad Stainless Steel Pan Set",
          type: "product",
          description: "Professional-grade tri-ply stainless steel cookware set",
          price: 299.99,
          category: "Cookware",
          brand: "All-Clad",
          rating: 4.8,
          features: ["Dishwasher safe", "Oven safe", "Tri-ply construction"]
        },
        {
          id: "p2",
          title: "Vitamix High-Speed Blender",
          type: "product",
          description: "Professional-grade blender perfect for smoothies and food prep",
          price: 449.99,
          category: "Appliances",
          brand: "Vitamix",
          rating: 4.9,
          features: ["Variable speed", "Self-cleaning", "7-year warranty"]
        }
      ];
      const results = searchDatabase.filter(
        (item) => typeArray.includes(item.type) && (item.title.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery) || item.category.toLowerCase().includes(searchQuery))
      ).slice(0, Number(limit));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });
  app2.get("/api/search/trending", async (req, res) => {
    try {
      const trending = [
        "chicken recipes",
        "healthy meal prep",
        "quick dinner ideas",
        "italian restaurants",
        "vegan options",
        "pizza near me",
        "fresh ingredients",
        "cooking equipment"
      ];
      res.json(trending);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending searches" });
    }
  });
  app2.get("/api/stores/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 5, type = "all" } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ message: "Location required" });
      }
      const nearbyStores = [
        {
          id: "store1",
          name: "Whole Foods Market",
          type: "grocery",
          address: "123 Main St, Your City, State 12345",
          distance: 0.8,
          rating: 4.6,
          hours: "Open until 10:00 PM",
          phone: "(555) 123-4567",
          website: "https://wholefoodsmarket.com",
          coordinates: { lat: parseFloat(lat) + 0.01, lng: parseFloat(lng) + 0.01 },
          features: ["Organic", "Deli", "Bakery", "Pharmacy", "Hot Bar"]
        },
        {
          id: "store2",
          name: "Trader Joe's",
          type: "grocery",
          address: "456 Oak Ave, Your City, State 12345",
          distance: 1.2,
          rating: 4.5,
          hours: "Open until 9:00 PM",
          phone: "(555) 987-6543",
          coordinates: { lat: parseFloat(lat) - 0.01, lng: parseFloat(lng) + 0.01 },
          features: ["Unique Products", "Affordable", "Wine Selection", "Frozen Foods"]
        },
        {
          id: "rest1",
          name: "Bella Vista Italian",
          type: "restaurant",
          address: "789 Restaurant Row, Your City, State 12345",
          distance: 0.5,
          rating: 4.7,
          hours: "Open until 11:00 PM",
          phone: "(555) 456-7890",
          website: "https://bellavista.com",
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) + 5e-3 },
          features: ["Outdoor Seating", "Wine Bar", "Takeout", "Reservations"]
        },
        {
          id: "market1",
          name: "Downtown Farmer's Market",
          type: "farmer_market",
          address: "City Park, Downtown Square, Your City",
          distance: 2.1,
          rating: 4.8,
          hours: "Saturdays 8:00 AM - 2:00 PM",
          coordinates: { lat: parseFloat(lat) + 0.02, lng: parseFloat(lng) },
          features: ["Local Produce", "Artisan Goods", "Live Music", "Pet Friendly"]
        }
      ];
      const filteredStores = type === "all" ? nearbyStores : nearbyStores.filter((store2) => store2.type === type);
      const storesInRadius = filteredStores.filter((store2) => store2.distance <= parseFloat(radius));
      res.json(storesInRadius);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby stores" });
    }
  });
  app2.get("/api/stores/search", async (req, res) => {
    try {
      const { q, type = "all" } = req.query;
      if (!q || typeof q !== "string" || q.length < 3) {
        return res.json([]);
      }
      const searchQuery = q.toLowerCase();
      const storeDatabase = [
        {
          id: "chain1",
          name: "Safeway",
          type: "grocery",
          address: "2001 Broadway, San Francisco, CA 94115",
          distance: 3.2,
          rating: 4.2,
          hours: "6:00 AM - 12:00 AM",
          phone: "(415) 555-0123",
          coordinates: { lat: 37.7749, lng: -122.4194 },
          features: ["Pharmacy", "Starbucks", "Deli", "Floral"]
        },
        {
          id: "chain2",
          name: "Target",
          type: "grocery",
          address: "789 Market St, San Francisco, CA 94103",
          distance: 2.8,
          rating: 4.3,
          hours: "8:00 AM - 10:00 PM",
          phone: "(415) 555-0456",
          coordinates: { lat: 37.7849, lng: -122.4094 },
          features: ["Grocery", "Pharmacy", "Electronics", "Clothing"]
        },
        {
          id: "local1",
          name: "The Italian Homemade Company",
          type: "restaurant",
          address: "716 Columbus Ave, San Francisco, CA 94133",
          distance: 1.9,
          rating: 4.6,
          hours: "11:30 AM - 10:00 PM",
          phone: "(415) 555-0789",
          coordinates: { lat: 37.7949, lng: -122.4094 },
          features: ["Fresh Pasta", "Italian Wine", "Romantic Setting"]
        }
      ];
      const searchResults = storeDatabase.filter((store2) => {
        const matchesType = type === "all" || store2.type === type;
        const matchesSearch = store2.name.toLowerCase().includes(searchQuery) || store2.address.toLowerCase().includes(searchQuery) || store2.features.some((feature) => feature.toLowerCase().includes(searchQuery));
        return matchesType && matchesSearch;
      });
      res.json(searchResults);
    } catch (error) {
      res.status(500).json({ message: "Store search failed" });
    }
  });
  app2.get("/api/user/privacy-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const settings = {
        voiceProcessing: user?.privacySettings?.voiceProcessing ?? true,
        dataAnalytics: user?.privacySettings?.dataAnalytics ?? false,
        personalizedRecommendations: user?.privacySettings?.personalizedRecommendations ?? true,
        emailNotifications: user?.privacySettings?.emailNotifications ?? true,
        dataRetention: user?.privacySettings?.dataRetention ?? "standard"
      };
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch privacy settings" });
    }
  });
  app2.put("/api/user/privacy-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;
      console.log(`Privacy settings updated for user ${userId}:`, settings);
      res.json({ message: "Privacy settings updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });
  app2.post("/api/user/data-export", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      console.log(`Data export requested for user ${userId} (${userEmail})`);
      res.json({ message: "Data export request submitted. You'll receive an email within 48 hours." });
    } catch (error) {
      res.status(500).json({ message: "Failed to process data export request" });
    }
  });
  app2.post("/api/user/delete-account", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      const { reason } = req.body;
      console.log(`Account deletion requested for user ${userId} (${userEmail}). Reason:`, reason);
      res.json({ message: "Account deletion request submitted. You'll receive confirmation via email." });
    } catch (error) {
      res.status(500).json({ message: "Failed to process account deletion request" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/middleware/performance.ts
function compressionMiddleware() {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      if (!res.headersSent && typeof body === "object" && JSON.stringify(body).length > 1024) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Vary", "Accept-Encoding");
      }
      return originalSend.call(this, body);
    };
    next();
  };
}
function cacheMiddleware(duration = 300) {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    const noCachePatterns = ["/api/meal-plans", "/api/voice", "/api/create-"];
    if (noCachePatterns.some((pattern) => req.path.includes(pattern))) {
      return next();
    }
    res.setHeader("Cache-Control", `public, max-age=${duration}`);
    next();
  };
}
function requestTimingMiddleware() {
  return (req, res, next) => {
    try {
      const start = Date.now();
      const originalSend = res.send;
      let responseSent = false;
      res.send = function(body) {
        if (responseSent) return originalSend.call(this, body);
        const duration = Date.now() - start;
        responseSent = true;
        if (process.env.NODE_ENV === "development" && duration > 2e3) {
          console.warn(`Slow request: ${req.method || "UNKNOWN"} ${req.path || "UNKNOWN"} took ${duration}ms`);
        }
        try {
          if (!res.headersSent) {
            res.setHeader("X-Response-Time", `${duration}ms`);
          }
        } catch (e) {
        }
        return originalSend.call(this, body);
      };
      next();
    } catch (error) {
      console.error("Request timing middleware error:", error);
      next();
    }
  };
}

// server/index.ts
import helmet from "helmet";
import compression from "compression";
var app = express2();
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.path.startsWith("/api/")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  next();
});
app.options("*", (req, res) => {
  res.sendStatus(200);
});
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(requestTimingMiddleware());
app.use(compressionMiddleware());
app.use(cacheMiddleware(300));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === "production" ? status < 500 ? err.message : "Internal Server Error" : err.message || "Internal Server Error";
    if (process.env.NODE_ENV !== "production") {
      console.error(`Error ${status} on ${req.method} ${req.path}:`, err);
    }
    res.status(status).json({
      message,
      ...process.env.NODE_ENV !== "production" && { stack: err.stack }
    });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
