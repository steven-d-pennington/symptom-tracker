import Link from "next/link";
import { ArrowLeft, Settings, Plus, Star } from "lucide-react";

export default function ManagingDataPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Managing Your Data</h1>
        <p className="text-lg text-muted-foreground">
          Add, edit, and organize symptoms, foods, triggers, and medications
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Accessing Data Management</h2>
        <p className="text-muted-foreground mb-4">
          Manage your custom lists from Settings:
        </p>

        <div className="p-4 rounded-lg border border-border bg-card">
          <ol className="text-sm text-muted-foreground space-y-2">
            <li>1. Navigate to Settings from the main menu</li>
            <li>2. Click on "Manage Data"</li>
            <li>3. Choose the category you want to manage (Symptoms, Foods, Medications, Triggers)</li>
            <li>4. Add, edit, or hide items as needed</li>
          </ol>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Adding Custom Items</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Add Custom Symptom</h3>
            <p className="text-sm text-muted-foreground">
              Click "Add Custom Symptom" and enter the symptom name. It will immediately appear
              in your symptom logging list.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Add Custom Food</h3>
            <p className="text-sm text-muted-foreground">
              Click "Add Custom Food", enter the food name, and select a category (Dairy, Grains, etc.).
              The food appears in that category in your logging interface.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Add Custom Medication</h3>
            <p className="text-sm text-muted-foreground">
              Click "Add Custom Medication" and enter the medication name (generic or brand name).
              Include dosage information in the name if helpful (e.g., "Ibuprofen 200mg").
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Add Custom Trigger</h3>
            <p className="text-sm text-muted-foreground">
              Click "Add Custom Trigger", enter the trigger name, and assign it to a category
              (Weather, Stress, Physical, etc.).
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Editing and Organizing</h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Edit Item Names</h4>
            <p className="text-sm text-muted-foreground">
              Click the edit icon next to any item to change its name or category. All historical
              logs are preserved when you edit.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Hide vs. Delete</h4>
            <p className="text-sm text-muted-foreground">
              Hiding an item removes it from logging lists but preserves historical data. Deleting
              permanently removes the item and all associated logs. We recommend hiding instead of deleting.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Manage Favorites</h4>
            <p className="text-sm text-muted-foreground">
              Star items to mark them as favorites. Favorited items appear at the top of logging
              lists for quick access.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Default vs. Custom Items</h2>

        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground mb-3">
            The app includes 120+ pre-populated default items across all categories. These provide
            a strong foundation and cover common needs.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Default items</strong> cannot be deleted but can be hidden.
            <strong className="text-foreground"> Custom items</strong> (ones you add) can be fully edited or deleted.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tips</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Add custom items as you discover new triggers or needs</li>
                <li>• Use specific names ("Greek Yogurt" vs. just "Yogurt")</li>
                <li>• Hide items you'll never use to keep lists manageable</li>
                <li>• Review and clean up your lists quarterly</li>
                <li>• Favorite your most-used items for faster logging</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/logging-food" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Logging Food</h3>
            <p className="text-xs text-muted-foreground">Use your custom food items</p>
          </Link>
          <Link href="/help/import-export" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Import & Export</h3>
            <p className="text-xs text-muted-foreground">Back up your custom lists</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/calendar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Calendar
        </Link>
        <Link href="/help/import-export" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Import & Export
        </Link>
      </div>
    </div>
  );
}
