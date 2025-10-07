import { PhotoGallery } from "@/components/photos/PhotoGallery";

export default function PhotosPage() {
  // In a real app, get userId from auth context
  const userId = "demo-user";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Photo Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your encrypted medical photos
        </p>
      </div>

      <PhotoGallery userId={userId} />
    </div>
  );
}
