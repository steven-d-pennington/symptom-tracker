import { db } from "../db/client";
import { UserRecord, UserPreferences, SymptomCategoryRecord, EntryTemplateRecord } from "../db/schema";
import { generateId, generateUUID } from "../utils/idGenerator";
import { initializeUserDefaults } from "../services/userInitialization";

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
   * Story 3.6.1 - AC3.6.1.13: Use GUID for cloud sync preparation
   */
  async create(
    userData: Omit<UserRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = generateUUID(); // Use GUID format for cloud sync readiness
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

  // Lock to prevent concurrent user creation
  private static userCreationLock: Promise<UserRecord> | null = null;

  /**
   * Create or get current user
   * Story 3.5.1: Now initializes default data for new users
   */
  async getOrCreateCurrentUser(): Promise<UserRecord> {
    // If user creation is already in progress, wait for it
    if (UserRepository.userCreationLock) {
      console.log('[getOrCreateCurrentUser] User creation already in progress, waiting...');
      return await UserRepository.userCreationLock;
    }

    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      // Ensure the current user ID is stored in localStorage
      if (typeof window !== 'undefined') {
        const storedId = window.localStorage.getItem('pocket:currentUserId');
        if (storedId !== currentUser.id) {
          console.log(`[getOrCreateCurrentUser] Updating localStorage with current user ID: ${currentUser.id}`);
          window.localStorage.setItem('pocket:currentUserId', currentUser.id);
        }
      }
      return currentUser;
    }

    // Create a lock promise to prevent concurrent creation
    const creationPromise = (async () => {
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
        flareViewMode: "cards", // Story 0.3: Default to cards-first layout
      },
    });

    const user = await this.getById(id);
    if (!user) {
      throw new Error("Failed to create user");
    }

    // Store the new user ID in localStorage immediately
    if (typeof window !== 'undefined') {
      console.log(`[getOrCreateCurrentUser] Storing new user ID in localStorage: ${id}`);
      window.localStorage.setItem('pocket:currentUserId', id);
    }

    // Story 3.5.1: Initialize default data for new user
    // CRITICAL: Must await to ensure defaults are loaded before user sees the app
    console.log(`[getOrCreateCurrentUser] Initializing default data for new user: ${id}`);
    const initResult = await initializeUserDefaults(id);

    if (initResult.success) {
      console.log(`[getOrCreateCurrentUser] ✅ Defaults initialized successfully:`, initResult.details);
    } else {
      console.error(`[getOrCreateCurrentUser] ⚠️ Failed to initialize defaults: ${initResult.error}`);
      console.error(`[getOrCreateCurrentUser] User can manually initialize via Settings > Advanced > Reinitialize Defaults`);
      // Don't throw - let user proceed even if defaults fail
    }

      return user;
    })();

    // Store the lock
    UserRepository.userCreationLock = creationPromise;

    try {
      const newUser = await creationPromise;
      return newUser;
    } finally {
      // Clear the lock when done
      UserRepository.userCreationLock = null;
    }
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
