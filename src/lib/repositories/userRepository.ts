import { db } from "../db/client";
import { UserRecord, UserPreferences, SymptomCategoryRecord, EntryTemplateRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class UserRepository {
  /**
   * Get all users
   */
  async getAll(): Promise<UserRecord[]> {
    return await db.users.toArray();
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<UserRecord | undefined> {
    return await db.users.get(id);
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<UserRecord | undefined> {
    return await db.users.where("email").equals(email).first();
  }

  /**
   * Create a new user
   */
  async create(
    userData: Omit<UserRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = generateId();
    const now = new Date();

    await db.users.add({
      ...userData,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Update an existing user
   */
  async update(id: string, updates: Partial<UserRecord>): Promise<void> {
    await db.users.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    id: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const user = await this.getById(id);
    if (!user) {
      throw new Error(`User not found: ${id}. Please complete onboarding first.`);
    }

    await db.users.update(id, {
      preferences: {
        ...user.preferences,
        ...preferences,
      },
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    await db.users.delete(id);
  }

  /**
   * Get current user (assumes single-user app)
   */
  async getCurrentUser(): Promise<UserRecord | undefined> {
    const users = await this.getAll();
    return users[0];
  }

  /**
   * Create or get current user
   */
  async getOrCreateCurrentUser(): Promise<UserRecord> {
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      return currentUser;
    }

    // Create default user
    const id = await this.create({
      name: "User",
      preferences: {
        theme: "system",
        notifications: {
          remindersEnabled: false,
        },
        privacy: {
          dataStorage: "encrypted-local",
          analyticsOptIn: false,
          crashReportsOptIn: false,
        },
        exportFormat: "json",
        symptomFilterPresets: [],
        foodFavorites: [],
      },
    });

    const user = await this.getById(id);
    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  /**
   * Get symptom filter presets
   */
  async getSymptomFilterPresets(userId: string) {
    const user = await this.getById(userId);
    return user?.preferences.symptomFilterPresets || [];
  }

  /**
   * Save symptom filter preset
   */
  async saveSymptomFilterPreset(userId: string, preset: { id: string; name: string; filters: unknown; createdAt: Date }) {
    const user = await this.getById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const presets = user.preferences.symptomFilterPresets || [];
    const updated = [...presets, {
      id: preset.id,
      name: preset.name,
      filters: JSON.stringify(preset.filters),
      createdAt: preset.createdAt,
    }];

    await this.updatePreferences(userId, {
      symptomFilterPresets: updated,
    });
  }

  /**
   * Get food favorites
   */
  async getFoodFavorites(userId: string): Promise<string[]> {
    const user = await this.getById(userId);
    return user?.preferences.foodFavorites || [];
  }

  /**
   * Toggle a food favorite (add/remove)
   */
  async toggleFoodFavorite(userId: string, foodId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    const current = new Set(user.preferences.foodFavorites || []);
    if (current.has(foodId)) current.delete(foodId); else current.add(foodId);
    await this.updatePreferences(userId, { foodFavorites: Array.from(current) });
  }

  /**
   * Delete symptom filter preset
   */
  async deleteSymptomFilterPreset(userId: string, presetId: string) {
    const user = await this.getById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const presets = user.preferences.symptomFilterPresets || [];
    const updated = presets.filter(p => p.id !== presetId);

    await this.updatePreferences(userId, {
      symptomFilterPresets: updated,
    });
  }

  /**
   * Get symptom categories
   */
  async getSymptomCategories(userId: string) {
    const user = await this.getById(userId);
    return user?.preferences.symptomCategories || [];
  }

  /**
   * Save symptom categories
   */
  async saveSymptomCategories(userId: string, categories: SymptomCategoryRecord[]) {
    await this.updatePreferences(userId, {
      symptomCategories: categories,
    });
  }

  /**
   * Get entry templates
   */
  async getEntryTemplates(userId: string) {
    const user = await this.getById(userId);
    return user?.preferences.entryTemplates || [];
  }

  /**
   * Save entry templates
   */
  async saveEntryTemplates(userId: string, templates: EntryTemplateRecord[]) {
    await this.updatePreferences(userId, {
      entryTemplates: templates,
    });
  }

  /**
   * Get active template ID
   */
  async getActiveTemplateId(userId: string) {
    const user = await this.getById(userId);
    return user?.preferences.activeTemplateId;
  }

  /**
   * Set active template ID
   */
  async setActiveTemplateId(userId: string, templateId: string) {
    await this.updatePreferences(userId, {
      activeTemplateId: templateId,
    });
  }
}

export const userRepository = new UserRepository();
