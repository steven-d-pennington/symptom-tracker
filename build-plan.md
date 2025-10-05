# Autoimmune Symptom Tracker - Product Requirements Document

## Product Vision

A privacy-first, comprehensive symptom tracking application designed for people managing autoimmune diseases, with specific focus on Hidradenitis Suppurativa (HS) and related comorbidities. The application enables users to track symptoms, identify triggers, document progress, and generate meaningful insights for personal understanding and medical consultations.

## Core Principles

- **Privacy First**: All data stored locally on user's device with optional future cloud sync
- **Accessibility**: Easy to use during flare-ups, brain fog, or high pain days
- **Flexibility**: Customizable to accommodate various autoimmune conditions
- **Offline Capable**: Full functionality without internet connection
- **Photo-Friendly**: Safe, private storage for sensitive medical documentation

## Target Users

**Primary**: People with Hidradenitis Suppurativa (HS)  
**Secondary**: People with other autoimmune conditions (lupus, rheumatoid arthritis, psoriasis, Crohn's disease, etc.)  
**Tertiary**: Caregivers tracking symptoms for loved ones

---

## Feature Set

### 1. Daily Entry System

**Purpose**: Central logging mechanism for daily health status

**Core Requirements**:
- Create one or more entries per day
- Each entry timestamped automatically
- Quick entry mode for minimal logging on difficult days
- Detailed entry mode for comprehensive tracking
- Ability to backdate entries if user forgets
- Edit and delete capabilities for existing entries
- Option to duplicate previous day's entry as starting template

**Data Captured Per Entry**:
- Date and time
- Overall wellness rating (1-10 scale)
- Overall pain level (1-10 scale)
- Energy level (1-10 scale)
- Mood/mental state (1-10 scale or emoji selection)
- Free-form notes field
- Tagged symptoms
- Tagged triggers
- Medications taken
- Activities performed

**User Stories**:
- As a user having a bad pain day, I want to quickly log my status with minimal typing
- As a user on a good day, I want to document details that might help identify patterns
- As a user who forgot to log yesterday, I want to add an entry for a previous date

---

### 2. Symptom Tracking

**Purpose**: Record and monitor specific symptoms with flexible, customizable categories

**Core Requirements**:
- Pre-defined common symptom types with ability to add custom symptoms
- Each symptom can be logged with:
  - Severity/intensity (1-10 scale)
  - Body location(s) affected
  - Duration (how long it's lasted)
  - Quality descriptors (sharp, dull, burning, throbbing, etc.)
  - Free-form notes
  - Associated photos
- Ability to mark symptoms as new vs. recurring
- Track whether symptom interferes with daily activities
- Functional impact notes (e.g., "can't button shirt" vs. just pain numbers)

**Pre-defined HS-Specific Symptoms**:
- New lesion/nodule
- Active abscess
- Drainage (with quality notes: amount, color)
- Pain
- Itching
- Burning sensation
- Swelling
- Redness/inflammation
- Scarring/skin changes
- Foul odor

**Extensible for Other Conditions**:
- Joint pain/stiffness
- Fatigue
- Brain fog
- Rash
- Fever
- Nausea
- Headache/migraine
- Digestive issues
- Any custom symptom user defines

**User Stories**:
- As an HS patient, I want to log a new lesion with its exact location and pain level
- As a user with multiple conditions, I want to track both HS symptoms and joint pain separately
- As a user, I want to describe how my pain feels, not just rate it numerically

---

### 3. Body Mapping System

**Purpose**: Visual tracking of symptom locations on the body

**Core Requirements**:
- Interactive body diagram (front and back views)
- Ability to tap/click specific areas to log symptoms at that location
- Visual indicators showing:
  - Currently active symptoms at each location
  - Severity (color-coded or sized markers)
  - Symptom type (different icons or shapes)
- Zoom capability for detailed areas
- Location-specific history (see past flares at same spot)
- Track recurring issues at specific sites

**Body Regions to Support**:
- HS-priority zones: armpits, groin, buttocks, under breasts, inner thighs, back of neck
- Full body coverage for other conditions
- Allow custom region naming

**Per-Location Tracking**:
- Currently active: yes/no
- Number of times this location has been affected
- Last flare date at this location
- Average severity at this location
- Associated photos for this location
- Treatment notes specific to this location

**User Stories**:
- As a user, I want to quickly tap my left armpit to log a new flare there
- As a user, I want to see which locations have recurring issues
- As a user, I want to show my doctor exactly where my symptoms occur visually

---

### 4. Photo Documentation

**Purpose**: Visual tracking of lesions, rashes, swelling, and physical symptoms over time

**Core Requirements**:
- Capture photos directly in-app using device camera
- Import existing photos from device gallery
- Store photos encrypted on local device
- Each photo tagged with:
  - Date and time
  - Associated body location
  - Associated symptom entry
  - Optional caption/notes
- Photo gallery view organized by:
  - Date (timeline view)
  - Body location
  - Associated entry
- Side-by-side comparison tool (compare two photos)
- Progress timeline for specific locations
- Zoom and pan on photos
- Delete individual photos
- Exclude photos from reports (for privacy)

**Privacy Controls**:
- Photos never leave device unless user explicitly enables cloud sync
- Option to require authentication before viewing photos
- Ability to quickly hide/lock photo section
- Warning before taking photos in public settings

**User Stories**:
- As a user, I want to photograph a lesion to track its healing over time
- As a user, I want to compare today's photo with one from two weeks ago
- As a user, I want to show my doctor visual progress without giving them access to all my photos
- As a user, I want to ensure my medical photos are completely private and secure

---

### 5. Trigger and Correlation Tracking

**Purpose**: Identify potential triggers and environmental factors affecting symptoms

**Core Requirements**:
- Flexible trigger categories that users can customize
- Log multiple triggers per day
- Each trigger includes:
  - Trigger type/category
  - Specific trigger value
  - Time of exposure
  - Notes

**Pre-defined Trigger Categories**:

**Diet/Food**:
- Specific foods consumed
- Meal timing
- Alcohol consumption
- Caffeine intake
- Sugar intake
- Common trigger foods (dairy, gluten, nightshades, etc.)

**Products/Hygiene**:
- Soaps and body washes
- Deodorants (type and location)
- Laundry detergents
- Lotions/creams
- Cosmetics
- Wound care products

**Environmental**:
- Weather conditions
- Temperature
- Humidity
- Barometric pressure
- Seasonal changes
- Air quality

**Activity**:
- Exercise type and intensity
- Physical exertion
- Heat exposure
- Sweating amount
- Specific movements or positions

**Clothing**:
- Tight vs. loose clothing
- Fabric types
- Bras/undergarments
- Compression garments
- Areas of friction

**Hormonal**:
- Menstrual cycle phase
- Period start/end
- PMS symptoms
- Hormonal medication changes

**Stress/Mental Health**:
- Stress level (1-10)
- Anxiety level
- Sleep quality
- Sleep duration
- Major life events
- Mental health status

**Medical**:
- Medication changes
- Missed doses
- New treatments
- Medical procedures
- Infections/illness

**User Stories**:
- As a user, I want to log that I ate dairy today to see if it correlates with flares
- As a user, I want to track which deodorant I used each day
- As a user, I want to note when I'm stressed to understand its impact on my symptoms
- As a user, I want to track my menstrual cycle alongside my HS flares

---

### 6. Medication Management

**Purpose**: Track medication adherence, effectiveness, and side effects

**Core Requirements**:
- Medication database (user's current and past medications)
- Each medication includes:
  - Name
  - Dosage and strength
  - Schedule/frequency
  - Prescribing doctor
  - Purpose
  - Start date
  - End date (if discontinued)
  - Cost/insurance information (optional)

**Daily Medication Logging**:
- Mark medications as taken (with timestamp)
- Log missed doses
- Note side effects experienced
- Rate effectiveness (1-10)
- Add notes about medication experience

**Medication History**:
- View all past medications tried
- Notes on why discontinued
- Effectiveness rating
- Side effects experienced
- Duration used

**Reminders** (Future Feature Consideration):
- Set reminder times for each medication
- Notification when dose is due
- Track adherence percentage

**User Stories**:
- As a user on biologics, I want to track when I take my weekly injection
- As a user, I want to note that a medication gave me side effects
- As a user, I want to tell my doctor which medications I've tried and their effectiveness
- As a user, I want to see if my symptoms improved after starting a new medication

---

### 7. Active Flare Dashboard

**Purpose**: Quick overview of current active symptoms requiring attention

**Core Requirements**:
- Dashboard view showing all currently active symptoms
- For each active symptom/flare:
  - Location(s)
  - Days active (duration)
  - Current severity
  - Treatment applied
  - Last updated date
  - Quick link to add update
- Ability to mark symptoms as resolved
- Sort and filter by severity, duration, or location
- Quick actions: add photo, add note, update severity, mark resolved

**HS-Specific Flare Tracking**:
- Lesion stage (nodule, abscess, draining, healing)
- Drainage status
- Wound care applied
- Bandaging/dressing status
- Infection concerns (flag for medical attention)
- Functional impact (e.g., "limiting arm movement")

**User Stories**:
- As a user, I want to see at a glance which lesions are currently active
- As a user, I want to quickly update the status of a healing lesion
- As a user, I want to know how long each flare has been active
- As a user managing multiple active sites, I want an organized view of what needs attention

---

### 8. Custom Trackables System

**Purpose**: Allow users to track anything relevant to their specific condition

**Core Requirements**:
- Users can create custom trackable items
- Each trackable has:
  - Name
  - Category (symptom, trigger, activity, measurement, etc.)
  - Input type (scale 1-10, yes/no, text, multiple choice, number)
  - Unit of measurement (if applicable)
  - Options (for multiple choice)
  - Icon or color
- Custom trackables appear in daily entry form
- Historical data for custom trackables
- Can edit or archive custom trackables

**Example Custom Trackables**:
- Water intake (number of glasses)
- Supplement taken (yes/no)
- Weight (number with unit)
- Smoking (yes/no or number of cigarettes)
- Specific activity (yoga, swimming, etc.)
- Environmental exposure (air conditioning, heating, etc.)

**User Stories**:
- As a user, I want to track my daily water intake to see if it affects my symptoms
- As a user with multiple conditions, I want to track items specific to each condition
- As a user, I want to experiment with tracking different factors to identify patterns

---

### 9. Calendar and Timeline Views

**Purpose**: Navigate and visualize historical entries

**Core Requirements**:

**Calendar View**:
- Monthly calendar display
- Days with entries marked/highlighted
- Color-coding by overall wellness (green=good, yellow=moderate, red=bad)
- Tap any day to view that day's entry
- Quick visual scan of good vs. bad periods
- Navigate between months

**Timeline/List View**:
- Chronological list of all entries (newest first)
- Each entry shows summary: date, overall rating, key symptoms
- Filter by date range
- Search entries by keyword
- Infinite scroll or pagination
- Tap entry to view full details

**User Stories**:
- As a user, I want to quickly see which days last month were bad
- As a user, I want to scroll through my entries to find when a specific symptom started
- As a user, I want to visually identify patterns in my good and bad days

---

### 10. Data Analysis and Insights

**Purpose**: Help users identify patterns and correlations in their data

**Core Requirements**:

**Symptom Frequency Analysis**:
- Show frequency of each symptom type over time
- Chart showing symptom occurrence by week/month
- Identify most common symptoms
- Track symptom trends (increasing, decreasing, stable)

**Trigger Correlation Analysis**:
- Identify potential correlations between triggers and symptoms
- Show when symptoms typically follow specific triggers
- Time lag analysis (e.g., "symptoms appear 2-3 days after eating dairy")
- Confidence indicators (how often correlation occurs)

**Location Analysis**:
- Which body locations are most frequently affected
- Average healing time per location
- Identify problem areas

**Medication Effectiveness**:
- Symptom severity before vs. after starting medication
- Side effect frequency
- Adherence rate

**Charts and Visualizations**:
- Line graphs for trends over time
- Bar charts for frequency
- Heat maps for location tracking
- Comparison views (this month vs. last month)

**Insights Dashboard**:
- Automatic pattern detection
- Notable observations (e.g., "Pain tends to be worse on Mondays")
- Reminders of correlations to investigate
- Suggestions based on data

**User Stories**:
- As a user, I want to see if my pain levels have improved since starting new medication
- As a user, I want to identify which foods might be triggering my flares
- As a user, I want to understand which body locations heal fastest
- As a user, I want to see visual proof that I'm getting better (or worse) over time

---

### 11. Report Generation for Medical Appointments

**Purpose**: Create comprehensive, shareable reports for healthcare providers

**Core Requirements**:

**Report Builder**:
- Select date range for report
- Choose which data to include:
  - Summary statistics
  - Symptom frequency
  - Active flares
  - Medication list and adherence
  - Trigger exposures
  - Photos (optional)
  - Charts and graphs
  - Notes and observations
- Generate as PDF
- Generate as printer-friendly format
- Option to exclude sensitive information

**Pre-built Report Templates**:
- Initial consultation report (comprehensive overview)
- Follow-up visit report (changes since last visit)
- Medication review report (focused on medications)
- Symptom-specific report (focused on one symptom type)
- Photo progress report (visual timeline)

**Report Contents**:
- Patient name (optional)
- Date range covered
- Executive summary
- Overall wellness trend
- Most significant symptoms
- Medication adherence and effectiveness
- Notable patterns or concerns
- Questions for doctor (user-added)
- Supporting data and charts

**Sharing Options**:
- Download to device
- Email to self
- Print
- (Future) Secure send to healthcare provider
- (Future) Integration with patient portals

**User Stories**:
- As a user preparing for a doctor visit, I want to generate a report showing my symptoms for the past 3 months
- As a user, I want to create a photo timeline showing how a lesion has healed
- As a user, I want to share my medication adherence data with my doctor
- As a user, I want to exclude photos from my report but include all other data

---

### 12. Search and Filter

**Purpose**: Quickly find specific entries, symptoms, or patterns

**Core Requirements**:

**Global Search**:
- Search across all entries by keyword
- Search by symptom type
- Search by trigger type
- Search by medication name
- Search in notes fields
- Display results with context

**Advanced Filters**:
- Filter entries by date range
- Filter by severity level
- Filter by specific body location
- Filter by presence of specific symptom
- Filter by presence of specific trigger
- Filter by medication taken
- Combine multiple filters (AND/OR logic)

**Saved Searches**:
- Save commonly used filter combinations
- Quick access to saved searches
- Name and organize saved searches

**User Stories**:
- As a user, I want to find all entries where I logged a specific food trigger
- As a user, I want to see all entries where I had drainage at a specific location
- As a user, I want to filter to only high-pain days to identify patterns

---

### 13. Data Import and Export

**Purpose**: Backup data and enable portability

**Core Requirements**:

**Export Functionality**:
- Export entire database to file
- Export specific date ranges
- Export specific data types (symptoms only, medications only, etc.)
- Export formats: JSON, CSV, PDF report
- Include or exclude photos in export
- Encrypted export option

**Import Functionality** (Future):
- Import from previous backup
- Merge imported data with existing data
- Conflict resolution (if overlapping dates)
- Preview before import

**Data Backup**:
- Manual backup trigger (export all data)
- Clear indication of last backup date
- Instructions for storing backups securely
- Restoration instructions

**User Stories**:
- As a user, I want to export my data regularly as a backup
- As a user switching devices, I want to move all my data to a new device
- As a user, I want to share my raw data with a researcher studying HS
- As a user concerned about losing data, I want clear backup and restore processes

---

### 14. Settings and Customization

**Purpose**: Personalize the app experience and manage preferences

**Core Requirements**:

**Personal Information**:
- Name (optional)
- Date of birth
- Primary condition(s)
- Start date of condition diagnosis
- Healthcare provider information (optional)

**Display Preferences**:
- Dark mode / light mode / auto
- Color scheme options
- Font size adjustment
- Language selection (future)
- Date and time format

**Data Management**:
- View storage usage
- Clear cached data
- Delete specific entry types
- Archive old data
- Delete account and all data

**Privacy Settings**:
- Require passcode/biometric to open app
- Require authentication to view photos
- Auto-lock timer
- Hide app from recent apps list (if possible)

**Notification Preferences** (Future):
- Enable/disable medication reminders
- Enable/disable entry reminders
- Reminder times
- Quiet hours

**Default Settings**:
- Which trackables appear in quick entry by default
- Default scales and rating systems
- Default categories

**About Section**:
- App version
- Privacy policy
- Terms of use
- Contact/support information
- Acknowledgments

**User Stories**:
- As a user with vision issues, I want to increase the font size
- As a user concerned about privacy, I want to require Face ID to open the app
- As a user, I want to switch to dark mode for use at night
- As a user, I want to clear out very old data to save space

---

### 15. Onboarding and Setup

**Purpose**: Help new users get started effectively

**Core Requirements**:

**Welcome Flow**:
- Introduction to app purpose and features
- Privacy explanation (data stays on device)
- Optional tour of main features
- Skip option for each step

**Initial Setup**:
- Select primary condition(s) or "custom"
- Choose pre-configured trackables for that condition
- Option to add custom trackables immediately
- Create first entry (guided)

**Condition-Specific Setup**:
- If HS selected: emphasize location tracking, photos, triggers
- If other condition selected: customize relevant features
- Always allow full customization

**Tutorial Mode**:
- Contextual tips on first use of each feature
- "What to track" suggestions
- Best practices for consistent tracking
- Option to revisit tutorial later

**Sample Data** (Optional):
- Show example entries (clearly marked as examples)
- Demonstrate what tracking looks like
- Easy to clear sample data

**User Stories**:
- As a new user, I want guidance on what I should be tracking
- As a new user with HS, I want the app pre-configured for HS-relevant tracking
- As a new user, I want to understand how location tracking works before I start
- As a new user, I want to skip the tutorial and start using the app immediately

---

### 16. Accessibility Features

**Purpose**: Ensure app is usable by people with various accessibility needs

**Core Requirements**:

**Visual Accessibility**:
- High contrast mode
- Large text options
- Screen reader compatibility
- Clear visual hierarchies
- Sufficient color contrast ratios
- Alternative text for all icons and images
- Scalable vector graphics

**Motor Accessibility**:
- Large touch targets (minimum 44x44 pixels)
- One-handed use optimization
- Minimal required precision
- Keyboard navigation support (for desktop PWA)
- Voice input option for text fields
- Minimize need for multiple taps

**Cognitive Accessibility**:
- Simple, clear language
- Consistent navigation patterns
- Minimalist interface options
- Step-by-step processes
- Clear error messages with solutions
- Undo functionality for important actions
- Confirmation dialogs for destructive actions

**Pain-Day Optimizations**:
- Quick-tap interfaces requiring minimal interaction
- Voice input for notes
- Copy previous entry function
- Streamlined "bad day" mode with only essential fields
- Large, easy-to-hit buttons
- Reduced visual clutter

**User Stories**:
- As a user with limited hand mobility, I want to be able to log entries with minimal tapping
- As a user with visual impairment, I want to use my screen reader with the app
- As a user in severe pain, I want to log my status with 2-3 taps maximum
- As a user with brain fog, I want clear, simple instructions for every action

---

## Data Storage Specifications

### Local Storage Requirements

**Storage Architecture**:
- All data stored locally on user's device
- Encrypted at rest
- Structured database format (SQLite or IndexedDB)
- Separate encrypted storage for photos
- No data sent to external servers without explicit user action

**Data Retention**:
- Indefinite storage (user controls deletion)
- No automatic data purging
- Clear indicators of storage usage
- Options to archive or export old data

**Performance Requirements**:
- App loads in under 3 seconds
- Instant response to user interactions
- Photo loading optimized (thumbnails, lazy loading)
- Smooth scrolling through large datasets
- Efficient querying for reports and analysis

### Future Cloud Sync Considerations

**Design Principles** (to keep in mind during development):
- Local-first architecture (app works fully offline)
- Sync as optional feature users can enable
- End-to-end encryption for synced data
- Conflict resolution strategy for multi-device edits
- Incremental sync (don't re-upload everything)
- User controls what syncs (option to exclude photos)
- Clear sync status indicators

**Sync Strategy** (for future implementation):
- Last-write-wins for simple conflicts
- User review for complex conflicts
- Background sync when online
- Manual sync trigger available
- Sync only over WiFi option
- Bandwidth-conscious photo sync

---

## User Experience Principles

### Design Guidelines

**Simplicity**:
- Minimize cognitive load on difficult health days
- Progressive disclosure (show advanced features only when needed)
- Clear primary actions on each screen
- Avoid overwhelming users with options

**Consistency**:
- Consistent navigation patterns throughout app
- Consistent terminology
- Consistent visual language (buttons, colors, spacing)
- Predictable interactions

**Feedback**:
- Clear confirmation of actions
- Loading states for any delayed operations
- Error messages that help users recover
- Success messages for important actions

**Efficiency**:
- Quick entry paths for common actions
- Shortcuts for power users
- Templates and duplication to reduce repetitive entry
- Smart defaults based on user patterns

**Empathy**:
- Acknowledge the difficulty of chronic illness
- Non-judgmental tone (especially for missed entries)
- Celebrate progress and improvements
- Gentle reminders rather than nagging
- Positive reinforcement

### Key User Flows

**New Entry Flow**:
1. Tap "New Entry" button
2. Choose quick entry or detailed entry
3. Add overall ratings (pain, wellness, energy)
4. Add symptoms (optional)
5. Add triggers (optional)
6. Add medications taken (optional)
7. Add photos (optional)
8. Add notes (optional)
9. Save entry
10. Return to home/dashboard

**View Past Entry Flow**:
1. Navigate to calendar or timeline view
2. Select date or entry
3. View entry details
4. Option to edit, delete, or add photos
5. Option to compare with other entries

**Generate Report Flow**:
1. Go to Reports section
2. Select date range
3. Choose report template or custom
4. Select data to include
5. Preview report
6. Generate PDF
7. Download or share

**Track Active Flare Flow**:
1. Open Active Flare dashboard
2. View all currently active symptoms
3. Select specific flare to update
4. Add photo, update severity, or add note
5. Save changes
6. Return to dashboard

---

## Success Metrics

**User Engagement**:
- Percentage of days with at least one entry
- Average entries per week
- Feature usage rates
- Time to create entry (should be minimal)

**User Value**:
- Number of reports generated
- Number of photos documented
- Number of patterns identified by correlation analysis
- Time between app download and first use of reports feature

**User Satisfaction**:
- User feedback and ratings
- Feature requests
- Bug reports and resolution
- User retention (continued use over time)

**Personal Goals** (for your wife's use case):
- Consistent daily logging
- Identification of at least 3 potential triggers within first month
- Successful use in doctor appointment (report generation)
- Reduction in symptom severity or frequency (ultimate health goal)

---

## Privacy and Security Considerations

**Data Protection**:
- All data encrypted at rest
- No analytics or tracking without explicit consent
- No data sharing with third parties
- Clear privacy policy
- User controls all data
- Option to delete all data permanently

**Authentication**:
- Optional passcode or biometric lock
- Device-level encryption
- Session timeout for sensitive sections
- No account required (local-only operation)

**Photo Security**:
- Photos encrypted separately
- Photos not stored in device photo gallery (unless user chooses)
- Additional authentication layer for photo viewing (optional)
- Clear photo deletion process

**Future Considerations**:
- HIPAA compliance requirements (if expanding to healthcare integration)
- Compliance with health data regulations (GDPR, etc.)
- Security audits for cloud sync feature
- Two-factor authentication for cloud accounts

---

## Out of Scope (Future Considerations)

Features NOT included in initial version but worth considering later:

**Community Features**:
- Forums or discussion boards
- Peer support groups
- Sharing anonymized data with research

**Healthcare Integration**:
- Direct sharing with healthcare providers
- Integration with patient portals
- Integration with EHR systems
- Telemedicine appointment scheduling

**Advanced AI/ML Features**:
- Predictive modeling for flare-ups
- Image analysis for lesion tracking
- Natural language processing for note analysis
- Automated trigger detection

**Wearable Integration**:
- Import data from fitness trackers
- Heart rate correlation
- Sleep tracking from devices
- Activity tracking from devices

**Social Features**:
- Support accountability partners
- Shared tracking for caregivers
- Family access

**Advanced Notifications**:
- Medication reminders
- Entry reminders
- Pattern alerts ("similar triggers to last flare detected")

**Multiple User Profiles**:
- Support for tracking multiple people
- Caregiver mode
- Data separation by profile

---

## Development Phases

### Phase 1: Core MVP (Priority)
- Daily entry system
- Basic symptom tracking with customization
- Pain and wellness ratings
- Local data storage
- Calendar and list views
- Basic export functionality

**Goal**: Usable tracking app with essential features

### Phase 2: HS-Specific Features
- Body mapping system
- Photo documentation
- Active flare dashboard
- Location-specific tracking
- Enhanced trigger tracking

**Goal**: Fully featured for HS management

### Phase 3: Intelligence and Insights
- Data analysis and correlation detection
- Charts and visualizations
- Pattern identification
- Report generation
- Advanced filtering

**Goal**: Help users understand their data

### Phase 4: Polish and Expansion
- Medication management with reminders
- Enhanced accessibility features
- Advanced export/import
- Performance optimizations
- Extended customization options

**Goal**: Refined, professional-grade application

### Phase 5: Cloud and Collaboration (Future)
- Optional cloud sync
- Multi-device support
- Backup and restore
- Enhanced sharing features

**Goal**: Expanded capability while maintaining privacy

---

## Technical Considerations (Non-Prescriptive)

**Requirements for Implementation**:
- Must work offline completely
- Must work as Progressive Web App (PWA)
- Must be responsive (mobile, tablet, desktop)
- Must support device camera access
- Must support local file storage
- Must be performant with large datasets (years of entries)
- Must handle photos efficiently (storage and display)
- Must be secure (encryption at rest)
- Must be installable on home screen
- Must persist data reliably

**Performance Targets**:
- Initial load: under 3 seconds
- Entry creation: under 2 seconds
- Photo capture/upload: under 5 seconds
- Report generation: under 10 seconds for 1 year of data
- Calendar view render: under 1 second for 1 year of data

**Browser/Device Support**:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS devices (iPhone, iPad)
- Android devices
- Desktop browsers (for larger screen experience)

---

## Glossary

**Entry**: A single log/record for a specific date and time containing symptoms, triggers, ratings, and notes

**Flare**: An active occurrence of symptoms, particularly used for HS lesions/abscesses

**Trackable**: Any item a user wants to monitor (symptom, trigger, activity, etc.)

**Body Location**: A specific area of the body where symptoms occur

**Trigger**: A potential cause or contributing factor to symptoms

**Correlation**: Statistical relationship between a trigger and subsequent symptoms

**Active Symptom**: A symptom currently being experienced (not resolved)

**Lesion**: An abnormal change in tissue, particularly referring to HS nodules/abscesses

**PWA**: Progressive Web App - a web application that can be installed and works offline

**Local Storage**: Data storage on the user's device (not in the cloud)

---

## Appendix: HS-Specific Context

### About Hidradenitis Suppurativa

HS is a chronic skin condition characterized by painful lumps under the skin, typically in areas where skin rubs together. It's often misdiagnosed and can significantly impact quality of life.

**Common Characteristics**:
- Recurrent painful nodules and abscesses
- Often occurs in armpits, groin, buttocks, under breasts
- Can result in tunneling under the skin and scarring
- Triggered by friction, sweat, hormones, stress, certain foods
- Varies greatly in severity between individuals
- Often has periods of flare-ups and remission

**Why Tracking Matters for HS**:
- Difficult to identify triggers due to variable flare timing
- Visual documentation helps show doctors severity and patterns
- Location tracking reveals problem areas
- Pattern recognition can help avoid triggers
- Documentation supports proper diagnosis and treatment
- Helps communicate with healthcare providers who may be unfamiliar with HS

**Common Comorbidities**:
- Depression and anxiety
- Inflammatory bowel disease
- Metabolic syndrome
- Other autoimmune conditions

This app should be designed with deep empathy for the pain, frustration, and privacy concerns of people living with HS while being flexible enough to support others with different conditions.

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**Status**: Initial Planning Document
