import Link from "next/link";
import { ArrowLeft, Utensils, Star, Clock, Search, ChevronDown } from "lucide-react";

export default function LoggingFoodPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Logging Food</h1>
        <p className="text-lg text-muted-foreground">
          Track meals and identify potential food triggers
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Track Food?</h2>
        <p className="text-muted-foreground">
          Food tracking helps you identify potential dietary triggers for flares and symptoms.
          Over time, you can discover patterns like:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Foods that seem to trigger flares</li>
          <li>Timing between meals and symptom onset</li>
          <li>Correlations with specific ingredients</li>
          <li>Safe foods that don't cause issues</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Log Food</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Navigate to Food Logging
            </h3>
            <p className="text-sm text-muted-foreground">
              From the dashboard, click "Log Food" or use keyboard shortcut <kbd className="px-2 py-1 text-xs bg-muted rounded">F</kbd>
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Choose or Search for Food
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              You'll see foods organized by:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li><strong>Favorites:</strong> Foods you've marked as favorites (shown first)</li>
              <li><strong>Recents:</strong> Foods you've logged recently</li>
              <li><strong>Categories:</strong> Organized groups (Dairy, Grains, Proteins, etc.)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Use the search bar to quickly find specific foods.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Select the Food
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on the food item you ate. You can select multiple foods in one logging session
              if you had a meal with several items.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
              Add Details (Optional)
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Click "Add Details" to include:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>Portion size</li>
              <li>Preparation method (raw, cooked, fried)</li>
              <li>Notes (e.g., "ate out at restaurant")</li>
              <li>Custom time (defaults to now)</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">5</span>
              Save the Entry
            </h3>
            <p className="text-sm text-muted-foreground">
              Click "Save" to log the food entry. It will appear in your timeline and calendar.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Using Categories</h2>
        <p className="text-muted-foreground mb-4">
          Foods are organized into collapsible categories to make finding items easier:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Collapsible Groups</h4>
            <p className="text-sm text-muted-foreground">
              Click the category header (e.g., "Dairy Products") to expand or collapse that group.
              This keeps the list manageable and organized.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Default Expanded</h4>
            <p className="text-sm text-muted-foreground">
              Favorites and Recents are always expanded by default. Other categories start collapsed
              to reduce scrolling.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Managing Favorites</h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Mark as Favorite</h4>
            <p className="text-sm text-muted-foreground">
              Click the star icon next to any food to add it to your favorites. Foods you eat frequently
              should be favorited for quick access.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Why Use Favorites?</h4>
            <p className="text-sm text-muted-foreground">
              Favorites appear at the top of the list and are always visible, making logging common
              meals much faster.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Adding Custom Foods</h2>

        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground mb-2">
            If a food isn't in the pre-populated list:
          </p>
          <ol className="text-sm text-muted-foreground space-y-2 pl-4">
            <li>1. Navigate to Settings → Manage Data → Foods</li>
            <li>2. Click "Add Custom Food"</li>
            <li>3. Enter the food name and category</li>
            <li>4. The food will now appear in your logging list</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-3">
            <Link href="/help/managing-data" className="text-primary hover:underline">
              Learn more about managing data →
            </Link>
          </p>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Utensils className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Pro Tips
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Log food immediately after eating for accurate timing</li>
                <li>• Favorite your most common foods for faster logging</li>
                <li>• Use notes to capture context ("ate out," "new brand," etc.)</li>
                <li>• Log all meals, even "safe" ones - patterns emerge from complete data</li>
                <li>• If you suspect a trigger, add a note so you can review it later</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/logging-symptoms" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Logging Symptoms</h3>
            <p className="text-xs text-muted-foreground">Track symptoms that may correlate with food</p>
          </Link>
          <Link href="/help/analytics" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Analytics & Insights</h3>
            <p className="text-xs text-muted-foreground">Identify food-related patterns</p>
          </Link>
          <Link href="/help/managing-data" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Managing Your Data</h3>
            <p className="text-xs text-muted-foreground">Add custom foods and organize lists</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/tracking-flares" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Tracking Flares
        </Link>
        <Link href="/help/logging-symptoms" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Logging Symptoms
        </Link>
      </div>
    </div>
  );
}
