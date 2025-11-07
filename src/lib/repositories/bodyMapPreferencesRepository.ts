import { db } from "../db/client";
import { BodyMapPreferences, DEFAULT_BODY_MAP_PREFERENCES, LayerType } from "../db/schema";

/**
 * Repository for managing user body map layer preferences (Story 5.2).
 * Handles persistence of last-used layer, visible layers, and view mode.
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
}

// Export singleton instance for consistent access throughout the app
export const bodyMapPreferencesRepository = new BodyMapPreferencesRepository();
