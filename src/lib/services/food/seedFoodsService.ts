import { generateId } from "../../utils/idGenerator";
import type { SymptomTrackerDatabase } from "../../db/client";
import type { FoodRecord } from "../../db/schema";

// Sentinel record to mark seeding as complete
const SEED_SENTINEL_NAME = "__SEED_COMPLETE_V1__";

// Default food catalog organized by category
// Each food includes name, category, and relevant allergen tags
const DEFAULT_FOODS: Omit<FoodRecord, "id" | "userId" | "createdAt" | "updatedAt" | "isDefault" | "isActive">[] = [
  // Breakfast Items (30 items)
  { name: "Eggs (scrambled)", category: "Breakfast", allergenTags: JSON.stringify(["eggs"]), preparationMethod: "cooked" },
  { name: "Eggs (fried)", category: "Breakfast", allergenTags: JSON.stringify(["eggs"]), preparationMethod: "cooked" },
  { name: "Eggs (boiled)", category: "Breakfast", allergenTags: JSON.stringify(["eggs"]), preparationMethod: "cooked" },
  { name: "Oatmeal", category: "Breakfast", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Pancakes", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "eggs", "dairy"]), preparationMethod: "cooked" },
  { name: "Waffles", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "eggs", "dairy"]), preparationMethod: "cooked" },
  { name: "French Toast", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "eggs", "dairy"]), preparationMethod: "cooked" },
  { name: "Cereal", category: "Breakfast", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "raw" },
  { name: "Granola", category: "Breakfast", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Yogurt", category: "Breakfast", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Toast", category: "Breakfast", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Bagel", category: "Breakfast", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "raw" },
  { name: "English Muffin", category: "Breakfast", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "raw" },
  { name: "Bacon", category: "Breakfast", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Sausage", category: "Breakfast", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Hash Browns", category: "Breakfast", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Smoothie", category: "Breakfast", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "blended" },
  { name: "Protein Shake", category: "Breakfast", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "blended" },
  { name: "Muffin", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "eggs", "dairy"]), preparationMethod: "baked" },
  { name: "Croissant", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "dairy"]), preparationMethod: "baked" },
  { name: "Danish Pastry", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "eggs", "dairy"]), preparationMethod: "baked" },
  { name: "Breakfast Burrito", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "eggs", "dairy"]), preparationMethod: "cooked" },
  { name: "Breakfast Sandwich", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "eggs", "dairy"]), preparationMethod: "cooked" },
  { name: "Avocado Toast", category: "Breakfast", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Chia Pudding", category: "Breakfast", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Cottage Cheese", category: "Breakfast", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Fruit Salad", category: "Breakfast", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Acai Bowl", category: "Breakfast", allergenTags: JSON.stringify([]), preparationMethod: "blended" },
  { name: "Breakfast Sausage", category: "Breakfast", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Biscuits and Gravy", category: "Breakfast", allergenTags: JSON.stringify(["gluten", "dairy"]), preparationMethod: "cooked" },

  // Proteins (40 items)
  { name: "Chicken Breast", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Chicken Thighs", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Chicken Wings", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Ground Chicken", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Turkey Breast", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Ground Turkey", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Beef Steak", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Ground Beef", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Beef Roast", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Pork Chops", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Pork Tenderloin", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Ground Pork", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Ham", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Salmon", category: "Proteins", allergenTags: JSON.stringify(["fish"]), preparationMethod: "cooked" },
  { name: "Tuna", category: "Proteins", allergenTags: JSON.stringify(["fish"]), preparationMethod: "cooked" },
  { name: "Cod", category: "Proteins", allergenTags: JSON.stringify(["fish"]), preparationMethod: "cooked" },
  { name: "Tilapia", category: "Proteins", allergenTags: JSON.stringify(["fish"]), preparationMethod: "cooked" },
  { name: "Mahi-Mahi", category: "Proteins", allergenTags: JSON.stringify(["fish"]), preparationMethod: "cooked" },
  { name: "Halibut", category: "Proteins", allergenTags: JSON.stringify(["fish"]), preparationMethod: "cooked" },
  { name: "Shrimp", category: "Proteins", allergenTags: JSON.stringify(["shellfish"]), preparationMethod: "cooked" },
  { name: "Crab", category: "Proteins", allergenTags: JSON.stringify(["shellfish"]), preparationMethod: "cooked" },
  { name: "Lobster", category: "Proteins", allergenTags: JSON.stringify(["shellfish"]), preparationMethod: "cooked" },
  { name: "Scallops", category: "Proteins", allergenTags: JSON.stringify(["shellfish"]), preparationMethod: "cooked" },
  { name: "Tofu", category: "Proteins", allergenTags: JSON.stringify(["soy"]), preparationMethod: "cooked" },
  { name: "Tempeh", category: "Proteins", allergenTags: JSON.stringify(["soy"]), preparationMethod: "cooked" },
  { name: "Seitan", category: "Proteins", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Black Beans", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Kidney Beans", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Chickpeas", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Lentils", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Edamame", category: "Proteins", allergenTags: JSON.stringify(["soy"]), preparationMethod: "cooked" },
  { name: "Almonds", category: "Proteins", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Cashews", category: "Proteins", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Walnuts", category: "Proteins", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Peanuts", category: "Proteins", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Peanut Butter", category: "Proteins", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Almond Butter", category: "Proteins", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Lamb", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Venison", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Duck", category: "Proteins", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },

  // Vegetables (40 items)
  { name: "Broccoli", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Cauliflower", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Carrots", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Celery", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Green Beans", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Asparagus", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Brussels Sprouts", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Spinach", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Kale", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Lettuce", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Arugula", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Swiss Chard", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Cabbage", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Zucchini", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Cucumber", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Bell Peppers", category: "Vegetables", allergenTags: JSON.stringify(["nightshades"]), preparationMethod: "raw" },
  { name: "Tomatoes", category: "Vegetables", allergenTags: JSON.stringify(["nightshades"]), preparationMethod: "raw" },
  { name: "Eggplant", category: "Vegetables", allergenTags: JSON.stringify(["nightshades"]), preparationMethod: "cooked" },
  { name: "Potatoes", category: "Vegetables", allergenTags: JSON.stringify(["nightshades"]), preparationMethod: "cooked" },
  { name: "Sweet Potatoes", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Onions", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Garlic", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Mushrooms", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Corn", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Peas", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Radishes", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Beets", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Butternut Squash", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Acorn Squash", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Pumpkin", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Green Onions", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Leeks", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Bok Choy", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Snow Peas", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Snap Peas", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Artichokes", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Fennel", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Turnips", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Parsnips", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Rutabaga", category: "Vegetables", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },

  // Fruits (30 items)
  { name: "Apple", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Banana", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Orange", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Grapes", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Strawberries", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Blueberries", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Raspberries", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Blackberries", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Watermelon", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Cantaloupe", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Honeydew", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Pineapple", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Mango", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Peach", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Pear", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Plum", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Cherries", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Kiwi", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Papaya", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Grapefruit", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Lemon", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Lime", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Pomegranate", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Avocado", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Coconut", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Figs", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Dates", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Apricots", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Nectarines", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Dragon Fruit", category: "Fruits", allergenTags: JSON.stringify([]), preparationMethod: "raw" },

  // Grains (25 items)
  { name: "White Rice", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Brown Rice", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Jasmine Rice", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Basmati Rice", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Wild Rice", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Quinoa", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Couscous", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Pasta", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Spaghetti", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Penne", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Fettuccine", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Bread", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "baked" },
  { name: "Whole Wheat Bread", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "baked" },
  { name: "Sourdough Bread", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "baked" },
  { name: "Rye Bread", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "baked" },
  { name: "Barley", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Bulgur", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Farro", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "cooked" },
  { name: "Millet", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Buckwheat", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Amaranth", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Polenta", category: "Grains", allergenTags: JSON.stringify([]), preparationMethod: "cooked" },
  { name: "Tortilla", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "raw" },
  { name: "Pita Bread", category: "Grains", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "baked" },
  { name: "Naan", category: "Grains", allergenTags: JSON.stringify(["gluten", "dairy"]), preparationMethod: "baked" },

  // Dairy (15 items)
  { name: "Milk", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Almond Milk", category: "Dairy", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Oat Milk", category: "Dairy", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Soy Milk", category: "Dairy", allergenTags: JSON.stringify(["soy"]), preparationMethod: "raw" },
  { name: "Cheese", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Cheddar Cheese", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Mozzarella Cheese", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Parmesan Cheese", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Feta Cheese", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Cream Cheese", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Sour Cream", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Butter", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Ice Cream", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "frozen" },
  { name: "Greek Yogurt", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Whipped Cream", category: "Dairy", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "whipped" },

  // Snacks (20 items)
  { name: "Chips", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "fried" },
  { name: "Pretzels", category: "Snacks", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "baked" },
  { name: "Popcorn", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "popped" },
  { name: "Crackers", category: "Snacks", allergenTags: JSON.stringify(["gluten"]), preparationMethod: "baked" },
  { name: "Trail Mix", category: "Snacks", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Granola Bar", category: "Snacks", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "baked" },
  { name: "Protein Bar", category: "Snacks", allergenTags: JSON.stringify(["nuts", "dairy"]), preparationMethod: "processed" },
  { name: "Rice Cakes", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "baked" },
  { name: "Hummus", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "blended" },
  { name: "Guacamole", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "mashed" },
  { name: "Salsa", category: "Snacks", allergenTags: JSON.stringify(["nightshades"]), preparationMethod: "blended" },
  { name: "Dark Chocolate", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "processed" },
  { name: "Milk Chocolate", category: "Snacks", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "processed" },
  { name: "Energy Balls", category: "Snacks", allergenTags: JSON.stringify(["nuts"]), preparationMethod: "raw" },
  { name: "Beef Jerky", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "dried" },
  { name: "String Cheese", category: "Snacks", allergenTags: JSON.stringify(["dairy"]), preparationMethod: "raw" },
  { name: "Apple Slices", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Banana Chips", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "dried" },
  { name: "Dried Fruit", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "dried" },
  { name: "Veggie Sticks", category: "Snacks", allergenTags: JSON.stringify([]), preparationMethod: "raw" },

  // Beverages (10 items)
  { name: "Coffee", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "brewed" },
  { name: "Tea", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "brewed" },
  { name: "Green Tea", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "brewed" },
  { name: "Herbal Tea", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "brewed" },
  { name: "Water", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "raw" },
  { name: "Sparkling Water", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "carbonated" },
  { name: "Juice", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "pressed" },
  { name: "Orange Juice", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "pressed" },
  { name: "Apple Juice", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "pressed" },
  { name: "Kombucha", category: "Beverages", allergenTags: JSON.stringify([]), preparationMethod: "fermented" },
];

class SeedFoodsService {
  /**
   * Check if seeding has already been completed for this user
   */
  async isSeedingComplete(
    userId: string,
    db: SymptomTrackerDatabase
  ): Promise<boolean> {
    const sentinel = await db.foods
      .where("[userId+name]")
      .equals([userId, SEED_SENTINEL_NAME])
      .count();
    return sentinel > 0;
  }

  /**
   * Seed default foods for a user
   * Batch inserts in chunks of 50 to avoid blocking the main thread
   */
  async seedDefaultFoods(
    userId: string,
    db: SymptomTrackerDatabase
  ): Promise<void> {
    // Check if seeding already complete
    const isComplete = await this.isSeedingComplete(userId, db);
    if (isComplete) {
      console.log(`[SeedFoodsService] Seeding already complete for user ${userId}`);
      return;
    }

    const now = Date.now();
    const BATCH_SIZE = 50;

    // Prepare food records with generated IDs
    const foodRecords: FoodRecord[] = DEFAULT_FOODS.map((food) => ({
      id: generateId(),
      userId,
      name: food.name,
      category: food.category,
      allergenTags: food.allergenTags,
      preparationMethod: food.preparationMethod,
      isDefault: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));

    // Add sentinel record
    const sentinel: FoodRecord = {
      id: generateId(),
      userId,
      name: SEED_SENTINEL_NAME,
      category: "System",
      allergenTags: JSON.stringify([]),
      preparationMethod: "system",
      isDefault: true,
      isActive: false, // Hidden from queries
      createdAt: now,
      updatedAt: now,
    };

    foodRecords.push(sentinel);

    // Batch insert in chunks
    for (let i = 0; i < foodRecords.length; i += BATCH_SIZE) {
      const batch = foodRecords.slice(i, i + BATCH_SIZE);
      await db.foods.bulkAdd(batch);

      // Yield to prevent blocking
      if (i + BATCH_SIZE < foodRecords.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    console.log(`[SeedFoodsService] Seeded ${DEFAULT_FOODS.length} foods for user ${userId}`);
  }

  /**
   * Get count of seeded foods
   */
  getSeedCount(): number {
    return DEFAULT_FOODS.length;
  }
}

export const seedFoodsService = new SeedFoodsService();
export { SeedFoodsService }; // Export class for testing
