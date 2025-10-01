# Photo Documentation - Implementation Plan

## Overview

The Photo Documentation system enables users to capture, store, and manage visual records of their symptoms. This feature is particularly valuable for autoimmune conditions where visible symptoms like rashes, swelling, or skin changes provide important documentation for medical appointments and treatment tracking. The system combines camera integration, secure storage, and intelligent organization.

## Core Requirements

### User Experience Goals
- **Easy Capture**: One-tap photo capture with automatic optimization
- **Secure Storage**: Encrypted local storage with privacy protection
- **Smart Organization**: Automatic categorization and tagging
- **Medical Ready**: High-quality images suitable for healthcare providers
- **Offline First**: Full functionality without internet connectivity

### Technical Goals
- **Camera Integration**: Native camera API access with fallback options
- **Image Optimization**: Automatic compression and format optimization
- **Privacy Protection**: End-to-end encryption for all photo data
- **Performance**: Efficient storage and fast loading of photo galleries
- **Accessibility**: Voice guidance and alternative input methods

## System Architecture

### Data Model
```typescript
interface SymptomPhoto {
  id: string;
  symptomLogId?: string; // Associated symptom log entry
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number; // File size in bytes
  dimensions: {
    width: number;
    height: number;
  };
  captureDate: Date;
  location?: string; // Body location if applicable
  tags: string[]; // User-defined tags
  notes?: string;
  metadata: PhotoMetadata;
  encryptionKey: string; // Reference to encryption key
  thumbnailPath?: string; // Path to encrypted thumbnail
  isEncrypted: boolean;
}

interface PhotoMetadata {
  camera: {
    make?: string;
    model?: string;
    software?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  capture: {
    exposureTime?: number;
    fNumber?: number;
    iso?: number;
    flash?: boolean;
  };
  symptomContext: {
    severity?: number;
    bodyRegion?: string;
    symptomType?: string;
  };
}

interface PhotoAlbum {
  id: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  photoIds: string[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isDefault: boolean; // Auto-created albums
}
```

### Component Architecture
```
PhotoDocumentationSystem/
├── PhotoCapture.tsx                # Camera interface and capture
├── PhotoGallery.tsx                # Photo browsing and management
├── PhotoViewer.tsx                 # Full-screen photo viewer
├── PhotoEditor.tsx                 # Basic editing (crop, rotate, annotate)
├── PhotoOrganizer.tsx              # Albums, tags, and organization
├── PhotoUploader.tsx               # Import from device/gallery
├── PhotoEncryption.tsx             # Encryption/decryption handling
├── PhotoCompression.tsx            # Image optimization
├── PhotoMetadataExtractor.tsx      # EXIF data extraction
└── PhotoBackup.tsx                 # Backup and sync functionality
```

## Photo Capture Implementation

### Camera Integration
```tsx
function PhotoCapture({ onPhotoCaptured, captureMode = 'symptom' }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [captureSettings, setCaptureSettings] = useState({
    resolution: 'high',
    timer: 0,
    grid: false
  });

  useEffect(() => {
    initializeCamera();
    return () => stopCamera();
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      // Fallback to file input
      setShowFileInput(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const photoData = await processCapturedPhoto(blob, captureMode);
        onPhotoCaptured(photoData);
      }
    }, 'image/jpeg', 0.9);
  };

  const processCapturedPhoto = async (blob: Blob, mode: string): Promise<SymptomPhoto> => {
    // Extract metadata
    const metadata = await extractPhotoMetadata(blob);

    // Generate filename
    const filename = generatePhotoFilename(mode);

    // Create photo object
    const photo: SymptomPhoto = {
      id: generateId(),
      filename,
      originalFilename: filename,
      mimeType: 'image/jpeg',
      size: blob.size,
      dimensions: {
        width: metadata.dimensions?.width || 1920,
        height: metadata.dimensions?.height || 1080
      },
      captureDate: new Date(),
      tags: generateAutoTags(mode, metadata),
      metadata,
      isEncrypted: true,
      encryptionKey: await generateEncryptionKey()
    };

    // Compress and encrypt
    const processedBlob = await compressAndEncryptPhoto(blob, photo.encryptionKey);

    // Store photo
    await storePhoto(photo, processedBlob);

    return photo;
  };

  const generateAutoTags = (mode: string, metadata: PhotoMetadata): string[] => {
    const tags = [mode];

    if (metadata.symptomContext?.bodyRegion) {
      tags.push(metadata.symptomContext.bodyRegion);
    }

    if (metadata.location) {
      tags.push('geotagged');
    }

    // Add time-based tags
    const hour = new Date().getHours();
    if (hour < 6) tags.push('early-morning');
    else if (hour < 12) tags.push('morning');
    else if (hour < 18) tags.push('afternoon');
    else tags.push('evening');

    return tags;
  };

  return (
    <div className="photo-capture">
      {/* Camera preview */}
      <div className="camera-preview">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />

        {/* Capture grid overlay */}
        {captureSettings.grid && (
          <div className="capture-grid">
            <div className="grid-line horizontal top" />
            <div className="grid-line horizontal middle" />
            <div className="grid-line horizontal bottom" />
            <div className="grid-line vertical left" />
            <div className="grid-line vertical middle" />
            <div className="grid-line vertical right" />
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Camera controls */}
      <div className="camera-controls">
        <div className="control-row">
          {/* Flash toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cycleFlashMode()}
            aria-label={`Flash ${flashMode}`}
          >
            <FlashIcon mode={flashMode} />
          </Button>

          {/* Camera switch */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleCamera()}
            aria-label="Switch camera"
          >
            <CameraSwitchIcon />
          </Button>

          {/* Timer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cycleTimer()}
            aria-label={`Timer ${captureSettings.timer}s`}
          >
            <TimerIcon seconds={captureSettings.timer} />
          </Button>
        </div>

        {/* Capture button */}
        <div className="capture-button-row">
          <button
            className="capture-button"
            onClick={capturePhoto}
            disabled={!isStreaming}
            aria-label="Capture photo"
          >
            <div className="capture-button-ring" />
          </button>
        </div>

        {/* Settings */}
        <div className="settings-row">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCaptureSettings(prev => ({ ...prev, grid: !prev.grid }))}
            aria-label="Toggle grid"
          >
            <GridIcon active={captureSettings.grid} />
          </Button>
        </div>
      </div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isStreaming ? 'Camera ready' : 'Initializing camera'}
      </div>
    </div>
  );
}
```

### Photo Processing Pipeline
```typescript
class PhotoProcessor {
  async processPhoto(blob: Blob, options: ProcessingOptions): Promise<ProcessedPhoto> {
    // Step 1: Extract metadata
    const metadata = await this.extractMetadata(blob);

    // Step 2: Optimize image
    const optimized = await this.optimizeImage(blob, options.quality);

    // Step 3: Generate thumbnail
    const thumbnail = await this.generateThumbnail(optimized);

    // Step 4: Encrypt data
    const encryptionKey = await this.generateEncryptionKey();
    const encryptedData = await this.encryptPhotoData(optimized, encryptionKey);
    const encryptedThumbnail = await this.encryptPhotoData(thumbnail, encryptionKey);

    return {
      original: blob,
      optimized,
      thumbnail,
      encrypted: {
        data: encryptedData,
        thumbnail: encryptedThumbnail,
        key: encryptionKey
      },
      metadata
    };
  }

  private async optimizeImage(blob: Blob, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate optimal dimensions (max 1920px on longest side)
        const maxDimension = 1920;
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = URL.createObjectURL(blob);
    });
  }

  private async generateThumbnail(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Fixed thumbnail size
        const thumbSize = 200;
        canvas.width = thumbSize;
        canvas.height = thumbSize;

        // Calculate aspect ratio
        const aspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

        if (aspect > 1) {
          // Landscape
          drawWidth = thumbSize;
          drawHeight = thumbSize / aspect;
          offsetY = (thumbSize - drawHeight) / 2;
        } else {
          // Portrait
          drawHeight = thumbSize;
          drawWidth = thumbSize * aspect;
          offsetX = (thumbSize - drawWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
      img.src = URL.createObjectURL(blob);
    });
  }

  private async extractMetadata(blob: Blob): Promise<PhotoMetadata> {
    // Use EXIF.js or similar library to extract metadata
    const metadata: PhotoMetadata = {
      camera: {},
      capture: {},
      symptomContext: {}
    };

    try {
      // Extract EXIF data
      const exifData = await extractEXIF(blob);

      metadata.camera = {
        make: exifData.Make,
        model: exifData.Model,
        software: exifData.Software
      };

      metadata.capture = {
        exposureTime: exifData.ExposureTime,
        fNumber: exifData.FNumber,
        iso: exifData.ISO,
        flash: exifData.Flash > 0
      };

      // Try to get location if available
      if (exifData.GPSLatitude && exifData.GPSLongitude) {
        metadata.location = {
          latitude: exifData.GPSLatitude,
          longitude: exifData.GPSLongitude,
          accuracy: 10 // Default accuracy
        };
      }
    } catch (error) {
      console.warn('Failed to extract photo metadata:', error);
    }

    return metadata;
  }

  private async generateEncryptionKey(): Promise<string> {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  private async encryptPhotoData(blob: Blob, keyBase64: string): Promise<Blob> {
    const key = await this.base64ToKey(keyBase64);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await blob.arrayBuffer();

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return new Blob([combined]);
  }
}
```

## Photo Gallery and Management

### Gallery View
```tsx
function PhotoGallery({ albumId, onPhotoSelect }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<SymptomPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  useEffect(() => {
    loadPhotos();
  }, [albumId, sortBy, filterTags]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      let query = db.photos;

      if (albumId) {
        const album = await db.albums.get(albumId);
        query = query.where('id').anyOf(album.photoIds);
      }

      let photos = await query.toArray();

      // Apply filters
      if (filterTags.length > 0) {
        photos = photos.filter(photo =>
          filterTags.some(tag => photo.tags.includes(tag))
        );
      }

      // Apply sorting
      photos.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return b.captureDate.getTime() - a.captureDate.getTime();
          case 'name':
            return a.filename.localeCompare(b.filename);
          case 'size':
            return b.size - a.size;
          default:
            return 0;
        }
      });

      setPhotos(photos);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photo: SymptomPhoto) => {
    if (selectedPhotos.size > 0) {
      // Multi-select mode
      setSelectedPhotos(prev => {
        const newSet = new Set(prev);
        if (newSet.has(photo.id)) {
          newSet.delete(photo.id);
        } else {
          newSet.add(photo.id);
        }
        return newSet;
      });
    } else {
      // Single select mode
      onPhotoSelect(photo);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return;

    const confirmed = await confirmBulkDelete(selectedPhotos.size);
    if (!confirmed) return;

    try {
      for (const photoId of selectedPhotos) {
        await deletePhoto(photoId);
      }

      setSelectedPhotos(new Set());
      await loadPhotos(); // Refresh gallery
    } catch (error) {
      console.error('Failed to delete photos:', error);
    }
  };

  return (
    <div className="photo-gallery">
      {/* Gallery controls */}
      <div className="gallery-controls">
        <div className="view-controls">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <GridIcon />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListIcon />
          </Button>
        </div>

        <div className="sort-controls">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedPhotos.size > 0 && (
          <div className="bulk-actions">
            <span className="text-sm text-muted-foreground">
              {selectedPhotos.size} selected
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Tag filters */}
      <TagFilter
        availableTags={getAllTags(photos)}
        selectedTags={filterTags}
        onTagsChange={setFilterTags}
      />

      {/* Photo grid/list */}
      {loading ? (
        <PhotoGridSkeleton />
      ) : photos.length === 0 ? (
        <EmptyGalleryState />
      ) : viewMode === 'grid' ? (
        <PhotoGrid
          photos={photos}
          selectedPhotos={selectedPhotos}
          onPhotoClick={handlePhotoClick}
        />
      ) : (
        <PhotoList
          photos={photos}
          selectedPhotos={selectedPhotos}
          onPhotoClick={handlePhotoClick}
        />
      )}
    </div>
  );
}

function PhotoGrid({ photos, selectedPhotos, onPhotoClick }: PhotoGridProps) {
  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <PhotoGridItem
          key={photo.id}
          photo={photo}
          isSelected={selectedPhotos.has(photo.id)}
          onClick={() => onPhotoClick(photo)}
        />
      ))}
    </div>
  );
}

function PhotoGridItem({ photo, isSelected, onClick }: PhotoGridItemProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    loadThumbnail();
  }, [photo.id]);

  const loadThumbnail = async () => {
    try {
      const thumbnail = await loadEncryptedPhoto(photo.thumbnailPath, photo.encryptionKey);
      const url = URL.createObjectURL(thumbnail);
      setThumbnailUrl(url);
    } catch (error) {
      console.error('Failed to load thumbnail:', error);
    }
  };

  return (
    <div
      className={`photo-grid-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Photo: ${photo.filename}, captured ${photo.captureDate.toLocaleDateString()}`}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className="photo-thumbnail"
          loading="lazy"
        />
      ) : (
        <div className="photo-thumbnail-placeholder">
          <ImageIcon />
        </div>
      )}

      {isSelected && (
        <div className="selection-indicator">
          <CheckIcon />
        </div>
      )}

      <div className="photo-overlay">
        <div className="photo-info">
          <span className="photo-date">
            {photo.captureDate.toLocaleDateString()}
          </span>
          {photo.tags.length > 0 && (
            <div className="photo-tags">
              {photo.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {photo.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{photo.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Photo Viewer
```tsx
function PhotoViewer({ photo, onClose, onEdit, onDelete }: PhotoViewerProps) {
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadFullImage();
  }, [photo.id]);

  const loadFullImage = async () => {
    setLoading(true);
    try {
      const fullImage = await loadEncryptedPhoto(photo.filename, photo.encryptionKey);
      const url = URL.createObjectURL(fullImage);
      setFullImageUrl(url);
    } catch (error) {
      console.error('Failed to load full image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fullImageUrl) return;

    const link = document.createElement('a');
    link.href = fullImageUrl;
    link.download = photo.originalFilename;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share && fullImageUrl) {
      try {
        const file = await urlToFile(fullImageUrl, photo.originalFilename, photo.mimeType);
        await navigator.share({
          title: 'Symptom Photo',
          text: `Symptom photo from ${photo.captureDate.toLocaleDateString()}`,
          files: [file]
        });
      } catch (error) {
        console.warn('Share failed:', error);
        // Fallback to download
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="photo-viewer-overlay" onClick={onClose}>
      <div className="photo-viewer" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="close-button"
          onClick={onClose}
          aria-label="Close photo viewer"
        >
          <XIcon />
        </Button>

        {/* Main image */}
        <div className="photo-container">
          {loading ? (
            <div className="photo-loading">
              <Spinner />
            </div>
          ) : fullImageUrl ? (
            <img
              src={fullImageUrl}
              alt={`Symptom photo from ${photo.captureDate.toLocaleDateString()}`}
              className="full-photo"
              onClick={() => setShowInfo(!showInfo)}
            />
          ) : (
            <div className="photo-error">
              <ImageIcon />
              <p>Failed to load photo</p>
            </div>
          )}
        </div>

        {/* Photo info overlay */}
        {showInfo && (
          <div className="photo-info-overlay">
            <div className="photo-details">
              <h3>{photo.originalFilename}</h3>
              <p>Captured: {photo.captureDate.toLocaleDateString()}</p>
              <p>Size: {formatFileSize(photo.size)}</p>
              {photo.location && <p>Location: {photo.location}</p>}
              {photo.notes && <p>Notes: {photo.notes}</p>}

              <div className="photo-tags">
                {photo.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {photo.metadata.location && (
                <div className="photo-location">
                  <MapPinIcon />
                  <span>Geotagged</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="photo-actions">
          <Button variant="outline" onClick={() => setShowInfo(!showInfo)}>
            <InfoIcon />
          </Button>

          <Button variant="outline" onClick={handleShare}>
            <ShareIcon />
          </Button>

          <Button variant="outline" onClick={onEdit}>
            <EditIcon />
          </Button>

          <Button variant="outline" onClick={onDelete}>
            <TrashIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Organization and Search

### Album Management
```typescript
function PhotoOrganizer({ photos }: PhotoOrganizerProps) {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    const userAlbums = await db.albums.where('isDefault').equals(false).toArray();
    const defaultAlbums = await createDefaultAlbums(photos);
    setAlbums([...defaultAlbums, ...userAlbums]);
  };

  const createDefaultAlbums = async (photos: SymptomPhoto[]): Promise<PhotoAlbum[]> => {
    const albums: PhotoAlbum[] = [];

    // Recent photos album
    const recentPhotos = photos
      .filter(p => {
        const daysSince = (Date.now() - p.captureDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      })
      .map(p => p.id);

    if (recentPhotos.length > 0) {
      albums.push({
        id: 'recent',
        name: 'Recent',
        description: 'Photos from the last 30 days',
        photoIds: recentPhotos,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        isDefault: true
      });
    }

    // Symptom type albums
    const symptomTypes = [...new Set(photos.flatMap(p => p.tags))];
    symptomTypes.forEach(type => {
      const typePhotos = photos
        .filter(p => p.tags.includes(type))
        .map(p => p.id);

      if (typePhotos.length > 0) {
        albums.push({
          id: `symptom-${type}`,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          description: `Photos tagged with ${type}`,
          photoIds: typePhotos,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [type],
          isDefault: true
        });
      }
    });

    return albums;
  };

  const handleCreateAlbum = async () => {
    const albumName = prompt('Album name:');
    if (!albumName?.trim()) return;

    const newAlbum: PhotoAlbum = {
      id: generateId(),
      name: albumName.trim(),
      photoIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      isDefault: false
    };

    await db.albums.add(newAlbum);
    await loadAlbums();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent, album: PhotoAlbum) => {
    e.preventDefault();
    setDragOver(false);

    const photoIds = e.dataTransfer.getData('text/plain').split(',');
    const updatedAlbum = {
      ...album,
      photoIds: [...new Set([...album.photoIds, ...photoIds])],
      updatedAt: new Date()
    };

    await db.albums.put(updatedAlbum);
    await loadAlbums();
  };

  return (
    <div className="photo-organizer">
      <div className="organizer-header">
        <h2>Photo Albums</h2>
        <Button onClick={handleCreateAlbum}>
          <PlusIcon />
          New Album
        </Button>
      </div>

      <div className="albums-grid">
        {albums.map(album => (
          <div
            key={album.id}
            className={`album-card ${dragOver === album.id ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, album)}
            onClick={() => setSelectedAlbum(album)}
          >
            <div className="album-cover">
              {album.coverPhotoId ? (
                <PhotoThumbnail photoId={album.coverPhotoId} />
              ) : (
                <div className="album-placeholder">
                  <ImageIcon />
                </div>
              )}
            </div>

            <div className="album-info">
              <h3>{album.name}</h3>
              <p>{album.photoIds.length} photos</p>
              {album.isDefault && (
                <Badge variant="secondary">Auto-generated</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Implementation Checklist

### Photo Capture
- [ ] Camera integration with fallback to file input
- [ ] Real-time camera preview with controls
- [ ] Photo capture with automatic optimization
- [ ] Metadata extraction (EXIF, location)
- [ ] Automatic tagging and categorization

### Photo Processing
- [ ] Image compression and format optimization
- [ ] Thumbnail generation
- [ ] End-to-end encryption
- [ ] Secure local storage
- [ ] Duplicate detection and handling

### Photo Management
- [ ] Encrypted photo gallery with thumbnails
- [ ] Photo viewer with full metadata display
- [ ] Album creation and organization
- [ ] Tag-based filtering and search
- [ ] Bulk operations (delete, move, tag)

### User Experience
- [ ] Touch-optimized photo browsing
- [ ] Drag-and-drop organization
- [ ] Keyboard navigation support
- [ ] Loading states and error handling
- [ ] Offline photo access

### Privacy & Security
- [ ] Encrypted photo storage
- [ ] Secure key management
- [ ] Privacy-preserving metadata handling
- [ ] No external photo sharing without consent
- [ ] Secure photo deletion

### Advanced Features
- [ ] Photo editing (crop, rotate, annotate)
- [ ] Facial recognition opt-out
- [ ] Medical image enhancement
- [ ] Pattern recognition for symptom tracking
- [ ] Integration with symptom logs

---

## Related Documents

- [Privacy & Security](../18-privacy-security.md) - Photo encryption and privacy
- [Data Storage Architecture](../16-data-storage.md) - Photo data persistence
- [Symptom Tracking](../02-symptom-tracking.md) - Photo-symptom integration
- [Body Mapping](../04-body-mapping.md) - Location-based photo tagging
- [Data Import/Export](../19-data-import-export.md) - Photo backup and export

---

*Document Version: 1.0 | Last Updated: October 2025*