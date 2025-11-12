import { db } from "../db/client";
import { BodyMapPreferences, DEFAULT_BODY_MAP_PREFERENCES, LayerType } from "../db/schema";
import type { GenderType, BodyType } from "../types/body-mapping";

/**
 * Repository for managing user body map preferences (Story 5.2, extended in Story 6.6).
 * Handles persistence of layer preferences, gender variant, and body type.
 * All operations are user-scoped to maintain preference isolation.
 */
export class BodyMapPreferencesRepository {
  /**
   * Get user preferences, creating defaults if they don't exist.
   * Returns default preferences on any error to ensure graceful degradation.
   *
   * @param userId - User ID to fetch preferences for
   * @returns Promise resolving to user's body map preferences
   */
  async get(userId: string): Promise<BodyMapPreferences> {
    try {
      const prefs = await db.bodyMapPreferences.get(userId);

      if (!prefs) {
        // Initialize defaults for new users
        const defaultPrefs: BodyMapPreferences = {
          userId,
          ...DEFAULT_BODY_MAP_PREFERENCES,
          updatedAt: Date.now() // Fresh timestamp for new preferences
        };
        await db.bodyMapPreferences.add(defaultPrefs);
        return defaultPrefs;
      }

      return prefs;
    } catch (error) {
      console.error('Failed to load body map preferences:', error);
      // Return defaults on error (don't crash UI)
      return {
        userId,
        ...DEFAULT_BODY_MAP_PREFERENCES,
        updatedAt: Date.now()
      };
    }
  }

  /**
   * Update last-used layer preference.
   * Uses fire-and-forget async persistence for optimistic UI updates.
   *
   * @param userId - User ID to update preferences for
   * @param layer - Layer type to set as last used
   */
  async setLastUsedLayer(userId: string, layer: LayerType): Promise<void> {
    try {
      // Ensure preferences exist before updating
      await this.get(userId);

      await db.bodyMapPreferences.update(userId, {
        lastUsedLayer: layer,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save lastUsedLayer:', error);
    }
  }

  /**
   * Update visible layers preference for multi-layer view.
   *
   * @param userId - User ID to update preferences for
   * @param layers - Array of layer types to make visible
   */
  async setVisibleLayers(userId: string, layers: LayerType[]): Promise<void> {
    try {
      // Ensure preferences exist before updating
      await this.get(userId);

      await db.bodyMapPreferences.update(userId, {
        visibleLayers: layers,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save visibleLayers:', error);
    }
  }

  /**
   * Update view mode preference (single layer vs all layers).
   *
   * @param userId - User ID to update preferences for
   * @param mode - View mode ('single' or 'all')
   */
  async setViewMode(userId: string, mode: 'single' | 'all'): Promise<void> {
    try {
      // Ensure preferences exist before updating
      await this.get(userId);

      await db.bodyMapPreferences.update(userId, {
        defaultViewMode: mode,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save viewMode:', error);
    }
  }

  /**
   * Update gender preference for body map variant (Story 6.6).
   * Controls which anatomical SVG variant is displayed.
   *
   * @param userId - User ID to update preferences for
   * @param gender - Gender type ('female', 'male', or 'neutral')
   */
  async setGenderPreference(userId: string, gender: GenderType): Promise<void> {
    try {
      // Ensure preferences exist before updating
      await this.get(userId);

      await db.bodyMapPreferences.update(userId, {
        selectedGender: gender,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save gender preference:', error);
    }
  }

  /**
   * Update body type preference for body map variant (Story 6.6).
   * Used for optional body type customization.
   *
   * @param userId - User ID to update preferences for
   * @param bodyType - Body type ('slim', 'average', 'plus-size', or 'athletic')
   */
  async setBodyTypePreference(userId: string, bodyType: BodyType): Promise<void> {
    try {
      // Ensure preferences exist before updating
      await this.get(userId);

      await db.bodyMapPreferences.update(userId, {
        selectedBodyType: bodyType,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save body type preference:', error);
    }
  }

  /**
   * Update both gender and body type preferences atomically (Story 6.6).
   * Preferred method when updating both values simultaneously (e.g., from settings form).
   *
   * @param userId - User ID to update preferences for
   * @param gender - Gender type ('female', 'male', or 'neutral')
   * @param bodyType - Body type ('slim', 'average', 'plus-size', or 'athletic')
   */
  async setGenderAndBodyType(userId: string, gender: GenderType, bodyType: BodyType): Promise<void> {
    try {
      // Ensure preferences exist before updating
      await this.get(userId);

      await db.bodyMapPreferences.update(userId, {
        selectedGender: gender,
        selectedBodyType: bodyType,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save gender and body type preferences:', error);
    }
  }

  /**
   * Get user preferences, or create with defaults if they don't exist (Story 6.6).
   * Convenience alias for get() method that emphasizes default creation behavior.
   *
   * @param userId - User ID to fetch preferences for
   * @returns Promise resolving to user's body map preferences with defaults applied
   */
  async getOrCreateDefaults(userId: string): Promise<BodyMapPreferences> {
    return this.get(userId);
  }
}

// Export singleton instance for consistent access throughout the app
export const bodyMapPreferencesRepository = new BodyMapPreferencesRepository();
