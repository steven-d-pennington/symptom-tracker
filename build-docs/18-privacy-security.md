# Privacy & Security - Implementation Plan

## Overview

The Pocket Symptom Tracker implements comprehensive privacy and security measures to protect sensitive health data. All data remains on-device with strong encryption, and the system follows privacy-first principles while maintaining usability for managing chronic health conditions.

## Core Security Principles

### Privacy-First Architecture
- **Zero External Data Sharing**: No data leaves the device without explicit user consent
- **Local-Only Storage**: All data stored in device-local databases
- **End-to-End Encryption**: Data encrypted at rest using Web Crypto API
- **User Control**: Complete user control over all data and permissions

### Security Layers
- **Device-Level Security**: Leverages device encryption and security features
- **Application-Level Security**: Custom encryption and access controls
- **Data-Level Security**: Field-level encryption for sensitive information
- **Network Security**: Secure communication when network access is required

## Data Encryption Implementation

### Master Key Management
```typescript
class KeyManager {
  private static readonly KEY_STORAGE_KEY = 'symptom_tracker_master_key';
  private static readonly SALT_KEY = 'symptom_tracker_salt';

  // Generate and store master encryption key
  async initializeMasterKey(): Promise<CryptoKey> {
    // Check if key already exists
    const existingKey = await this.loadMasterKey();
    if (existingKey) {
      return existingKey;
    }

    // Generate new key
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const keyMaterial = await this.deriveKeyFromPassword(this.getDeviceFingerprint(), salt);

    const masterKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Store key and salt securely
    await this.storeMasterKey(masterKey);
    await this.storeSalt(salt);

    return masterKey;
  }

  // Derive key from device fingerprint (not user password for UX reasons)
  private async getDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);

    const fingerprint = canvas.toDataURL();
    return await this.hashString(fingerprint);
  }

  private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
}
```

### Database Encryption
```typescript
class EncryptedDatabase {
  private masterKey: CryptoKey;

  constructor(masterKey: CryptoKey) {
    this.masterKey = masterKey;
  }

  // Encrypt data before storing
  async encryptData(plainData: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainData);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      data
    );

    // Store IV with encrypted data
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    return this.arrayBufferToBase64(combined);
  }

  // Decrypt data when retrieving
  async decryptData(encryptedData: string): Promise<string> {
    const combined = this.base64ToArrayBuffer(encryptedData);
    const combinedArray = new Uint8Array(combined);

    const iv = combinedArray.slice(0, 12);
    const encrypted = combinedArray.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
```

### Photo Encryption
Photos require special handling due to their size and sensitivity:

```typescript
class PhotoEncryption extends EncryptedDatabase {
  private readonly PHOTO_KEY_SUFFIX = '_photo_key';

  // Generate separate key for photos (allows different access controls)
  async initializePhotoKey(): Promise<CryptoKey> {
    const keyId = 'photos' + this.PHOTO_KEY_SUFFIX;
    const existingKey = await this.loadStoredKey(keyId);

    if (existingKey) {
      return existingKey;
    }

    // Derive photo-specific key from master key
    const photoKey = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: crypto.getRandomValues(new Uint8Array(32)),
        info: new TextEncoder().encode('photo-encryption')
      },
      this.masterKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    await this.storeKey(keyId, photoKey);
    return photoKey;
  }

  // Encrypt photo blob
  async encryptPhoto(photoBlob: Blob): Promise<EncryptedPhoto> {
    const photoKey = await this.initializePhotoKey();
    const arrayBuffer = await photoBlob.arrayBuffer();

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      photoKey,
      arrayBuffer
    );

    return {
      data: new Blob([iv, encrypted]),
      iv: this.arrayBufferToBase64(iv),
      keyId: 'photos' + this.PHOTO_KEY_SUFFIX
    };
  }

  // Decrypt photo for display
  async decryptPhoto(encryptedPhoto: EncryptedPhoto): Promise<Blob> {
    const photoKey = await this.initializePhotoKey();

    const encryptedData = await encryptedPhoto.data.arrayBuffer();
    const encryptedArray = new Uint8Array(encryptedData);

    const iv = this.base64ToArrayBuffer(encryptedPhoto.iv);
    const encrypted = encryptedArray.slice(iv.byteLength);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      photoKey,
      encrypted
    );

    return new Blob([decrypted], { type: 'image/jpeg' });
  }
}
```

## Access Control System

### Authentication States
```typescript
enum AuthState {
  NOT_SET = 'not_set',           // No authentication configured
  OPTIONAL = 'optional',         // Auth available but not required
  REQUIRED = 'required',         // Auth required for app access
  PHOTO_LOCKED = 'photo_locked'  // Photos require separate auth
}

class AccessController {
  private authState: AuthState = AuthState.NOT_SET;
  private authToken: string | null = null;
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

  async initializeAuth(): Promise<void> {
    const savedState = await this.loadAuthState();
    this.authState = savedState || AuthState.NOT_SET;

    if (this.authState !== AuthState.NOT_SET) {
      await this.setupBiometricAuth();
    }
  }

  async authenticateUser(): Promise<boolean> {
    if (this.authState === AuthState.NOT_SET) {
      return true; // No auth required
    }

    if (this.authState === AuthState.OPTIONAL) {
      // Optional auth - user can skip
      return await this.promptOptionalAuth();
    }

    // Required auth
    return await this.performAuthentication();
  }

  private async performAuthentication(): Promise<boolean> {
    // Try biometric first
    if (await this.isBiometricAvailable()) {
      try {
        const result = await this.authenticateBiometric();
        if (result) {
          this.authToken = this.generateAuthToken();
          return true;
        }
      } catch (error) {
        console.warn('Biometric auth failed, falling back to PIN');
      }
    }

    // Fallback to PIN/password
    return await this.authenticateWithPIN();
  }

  async authenticateForPhotos(): Promise<boolean> {
    if (this.authState !== AuthState.PHOTO_LOCKED) {
      return true; // Photos not locked
    }

    // Require authentication specifically for photos
    return await this.performAuthentication();
  }

  private async setupBiometricAuth(): Promise<void> {
    if ('credentials' in navigator) {
      try {
        // Create credential for future authentication
        await navigator.credentials.create({
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            rp: { name: 'Symptom Tracker' },
            user: {
              id: crypto.getRandomValues(new Uint8Array(32)),
              name: 'user',
              displayName: 'Symptom Tracker User'
            },
            pubKeyCredParams: [{
              type: 'public-key',
              alg: -7 // ES256
            }]
          }
        });
      } catch (error) {
        console.warn('Biometric setup failed:', error);
      }
    }
  }

  private async authenticateBiometric(): Promise<boolean> {
    if (!('credentials' in navigator)) return false;

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [], // Use any registered credential
          userVerification: 'required'
        }
      });

      return !!credential;
    } catch (error) {
      return false;
    }
  }
}
```

## Data Sanitization and Validation

### Input Validation
```typescript
class DataValidator {
  // Validate symptom data
  validateSymptomData(data: SymptomInput): ValidationResult {
    const errors: string[] = [];

    if (!data.name || data.name.length < 2) {
      errors.push('Symptom name must be at least 2 characters');
    }

    if (data.severity < 1 || data.severity > 10) {
      errors.push('Severity must be between 1 and 10');
    }

    if (data.notes && data.notes.length > 2000) {
      errors.push('Notes cannot exceed 2000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    // Remove potentially harmful characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate file uploads
  validateFileUpload(file: File): ValidationResult {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be a JPEG, PNG, or WebP image');
    }

    // Check for malicious file signatures
    if (this.hasMaliciousSignature(file)) {
      errors.push('File appears to be corrupted or malicious');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## Privacy Controls

### Data Export and Deletion
```typescript
class PrivacyManager {
  // Complete data export
  async exportAllData(): Promise<Blob> {
    const allData = await this.gatherAllUserData();

    // Encrypt export with user-provided password
    const password = await this.promptForExportPassword();
    const encryptedData = await this.encryptWithPassword(allData, password);

    return new Blob([encryptedData], {
      type: 'application/octet-stream'
    });
  }

  // Selective data deletion
  async deleteDataRange(dateRange: DateRange): Promise<void> {
    const entriesToDelete = await this.findEntriesInRange(dateRange);

    for (const entry of entriesToDelete) {
      await this.deleteEntryAndRelatedData(entry.id);
    }

    // Clean up orphaned records
    await this.cleanupOrphanedData();
  }

  // Complete account deletion
  async deleteAccount(): Promise<void> {
    // Require authentication
    const authenticated = await this.requireAuthentication();
    if (!authenticated) {
      throw new Error('Authentication required for account deletion');
    }

    // Confirm deletion
    const confirmed = await this.confirmAccountDeletion();
    if (!confirmed) {
      return;
    }

    // Delete all data
    await this.deleteAllUserData();

    // Clear encryption keys
    await this.clearAllKeys();

    // Reset app to initial state
    await this.resetAppState();
  }

  private async confirmAccountDeletion(): Promise<boolean> {
    const message = `
      This will permanently delete all your symptom data, photos, and settings.
      This action cannot be undone.

      Type "DELETE" to confirm:
    `;

    const confirmation = await this.promptUser(message);
    return confirmation === 'DELETE';
  }
}
```

## Audit Logging

### Security Event Tracking
```typescript
interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: SecurityEventType;
  details: Record<string, any>;
  ipAddress?: string; // If applicable
  userAgent?: string;
}

enum SecurityEventType {
  APP_OPENED = 'app_opened',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',
  DATA_EXPORTED = 'data_exported',
  DATA_DELETED = 'data_deleted',
  PHOTO_ACCESSED = 'photo_accessed',
  SETTINGS_CHANGED = 'settings_changed',
  ENCRYPTION_KEY_ROTATED = 'encryption_key_rotated'
}

class SecurityAuditor {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;

  async logEvent(eventType: SecurityEventType, details: Record<string, any>): Promise<void> {
    const event: SecurityEvent = {
      id: generateId(),
      timestamp: new Date(),
      eventType,
      details,
      userAgent: navigator.userAgent
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Persist to encrypted storage
    await this.persistEvents();
  }

  async getAuditLog(dateRange?: DateRange): Promise<SecurityEvent[]> {
    let events = this.events;

    if (dateRange) {
      events = events.filter(event =>
        event.timestamp >= dateRange.start && event.timestamp <= dateRange.end
      );
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private async persistEvents(): Promise<void> {
    const encryptedEvents = await this.encryptData(JSON.stringify(this.events));
    await this.storeEncryptedData('audit_log', encryptedEvents);
  }
}
```

## Network Security

### Secure Communication
```typescript
class NetworkSecurity {
  // Validate HTTPS for any external requests
  async validateSecureConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.url.startsWith('https://');
    } catch {
      return false;
    }
  }

  // Content Security Policy
  getContentSecurityPolicy(): string {
    return `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self';
      connect-src 'self';
      media-src 'self' blob:;
      object-src 'none';
      frame-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim();
  }

  // Prevent data exfiltration
  setupDataExfiltrationProtection(): void {
    // Disable clipboard access for sensitive data
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: () => Promise.reject(new Error('Clipboard access disabled')),
        writeText: () => Promise.reject(new Error('Clipboard access disabled'))
      }
    });

    // Prevent drag and drop of sensitive data
    document.addEventListener('dragstart', (event) => {
      if (this.isSensitiveElement(event.target)) {
        event.preventDefault();
      }
    });
  }
}
```

## Testing Strategy

### Security Testing
- **Encryption Tests**: Verify data is properly encrypted/decrypted
- **Access Control Tests**: Test authentication and authorization
- **Input Validation Tests**: Ensure malicious input is rejected
- **Privacy Tests**: Confirm no data leakage

### Penetration Testing
- **XSS Prevention**: Test for cross-site scripting vulnerabilities
- **CSRF Protection**: Verify cross-site request forgery protection
- **Data Exposure**: Check for accidental data exposure
- **Key Management**: Test encryption key security

### Compliance Testing
- **Data Minimization**: Verify only necessary data is collected
- **Retention Limits**: Test data deletion functionality
- **User Consent**: Validate consent mechanisms
- **Audit Logging**: Ensure security events are logged

## Implementation Checklist

### Core Security
- [ ] Master key generation and management
- [ ] Database encryption implementation
- [ ] Photo encryption system
- [ ] Access control system
- [ ] Input validation and sanitization

### Privacy Features
- [ ] Data export functionality
- [ ] Selective data deletion
- [ ] Account deletion process
- [ ] Privacy settings management
- [ ] Audit logging system

### Network Security
- [ ] HTTPS validation
- [ ] Content Security Policy
- [ ] Data exfiltration protection
- [ ] Secure communication protocols

### Testing & Validation
- [ ] Security unit tests >95% coverage
- [ ] Penetration testing completed
- [ ] Privacy audit passed
- [ ] Compliance requirements met
- [ ] Performance impact assessed

---

## Related Documents

- [Data Storage Architecture](../16-data-storage.md) - Encryption integration
- [PWA Infrastructure](../17-pwa-infrastructure.md) - Offline security
- [Settings & Customization](../14-settings-customization.md) - Privacy controls
- [Data Import/Export](../19-data-import-export.md) - Secure data portability

---

*Document Version: 1.0 | Last Updated: October 2025*