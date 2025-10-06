import { db } from "../db/client";
import { UserRecord, UserPreferences } from "../db/schema";
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
      throw new Error(`User not found: ${id}`);
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
      },
    });

    const user = await this.getById(id);
    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }
}

export const userRepository = new UserRepository();
