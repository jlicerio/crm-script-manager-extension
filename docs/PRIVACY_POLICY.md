# Privacy Policy for CRM Tools Widget Extension

**Last updated**: March 19, 2026  
**Extension Version**: 1.1 (Modular)

## Overview
CRM Tools Widget is a productivity extension designed to automate workflows and enhance HTML form interactions on SuiteCRM and similar CRM websites. We are committed to protecting your privacy and maintaining transparency about data practices.

**Core principle: Your data never leaves your browser.**

## Data Collection & Privacy

### ✅ What We DO
- Inject productivity tools (copy date/URL, enhanced search) into CRM pages
- Store learned field mapping **locally on your device only**
- Log tool usage in browser console for debugging (not transmitted)
- Display toast feedback messages for user actions

### ❌ What We DON'T Do
- Collect, store, or analyze personal data
- Send any data to external servers or third-party services
- Track user behavior across websites
- Use analytics, telemetry, or crash reporting
- Request microphone, camera, or location data
- Make any network requests outside your browser

## Learned Field Mapping System

The extension learns from your selections to automate repeated tasks:

**Example Flow:**
1. You select **Call Reason** = "Technical Support"
2. You manually select **Category** = "Troubleshooting" and **Action** = "Remote"
3. The extension **learns** this mapping and stores it locally
4. Next time you pick "Technical Support", these fields auto-fill

**Privacy Details:**
- ✅ Mappings saved to **localStorage** (your browser only)
- ✅ Never transmitted to any server
- ✅ Cleared automatically if you clear browser cache
- ✅ Unique to each browser profile (not synced)
- ✅ Contains only field values, no personal information

## Permissions Explained

### `activeTab`
- **Purpose**: Detect when you visit a CRM page and activate tools
- **What it accesses**: Current page URL and DOM structure
- **What it does**: Injects tool buttons and search enhancement
- **What it doesn't do**: Read sensitive form data unless you use the tool

### `storage`
- **Purpose**: Store learned field mappings on your device
- **Scope**: localStorage and extension settings only
- **Data retained**: Field dependency mappings (e.g., "Reason123 → Category456")
- **Duration**: Until you clear browser cache or uninstall extension

### `scripting`
- **Purpose**: Inject tool buttons and search functionality into web pages
- **What it does**: Adds UI elements to CRM forms
- **What it doesn't do**: Capture, log, or transmit page data

## Data Storage
- **Location**: Browser `localStorage` and browser cache only
- **Type of data**: Field IDs, dropdown values, tool preferences
- **Persistence**: Remains until manually cleared via browser settings
- **Synchronization**: None (not synced to cloud or other devices)
- **Encryption**: Browser's native localStorage protection

## Third-Party Services
**This extension uses ZERO third-party services:**
- ❌ No analytics tools (Google Analytics, Mixpanel, etc.)
- ❌ No crash reporting (Sentry, Bugsnag, etc.)
- ❌ No content delivery networks (CDNs)
- ❌ No API calls to external servers
- ❌ No tracking pixels or cookies
- ❌ No data sharing with any other organization

All functionality is **100% local to your browser**.

## User Control & Transparency

### How to View Your Stored Data
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage**
4. Find your SuiteCRM domain
5. All stored mappings are visible and auditable

### How to Delete Stored Data
**Option 1 - Clear Specific Domain:**
1. Browser Settings → Privacy and Security → Clear Browsing Data
2. Select "Cookies and other site data"
3. Choose your SuiteCRM domain
4. Click Clear

**Option 2 - Clear Everything:**
1. Uninstall the extension
2. Browser Settings → Clear Browsing Data → Select time range
3. All extension data is removed

### How to Disable the Extension
1. Go to `chrome://extensions/`
2. Find "CRM Tools Widget"
3. Click the toggle to disable
4. Extension is inactive but data remains until you clear cache

## Data NOT Collected

We explicitly do not collect:
- ❌ Email addresses or names
- ❌ Phone numbers or personally identifiable information
- ❌ Form field values or CRM record data
- ❌ Login credentials or API keys
- ❌ Browsing history or URL paths
- ❌ IP addresses or device identifiers
- ❌ Usage frequency or behavior patterns
- ❌ Screen recordings or keystroke logs

## Policy Compliance

This extension complies with:
- ✅ **Chrome Web Store Policies** - No data collection, transparent permissions
- ✅ **GDPR** - All data stored locally, no external transmission
- ✅ **CCPA** - Zero data collection from California users
- ✅ **Privacy Best Practices** - Minimal data, local storage, user control

## Changes to Privacy Policy

Any updates to this policy will be:
1. Posted with a new "Last updated" date
2. Made available in this document
3. Highlighted if material changes occur
4. Compliant with Chrome Web Store requirements

For significant changes, we may provide notification through the extension.

## Contact & Questions

For privacy concerns, questions, or to report issues:
- **Chrome Web Store**: Leave a review comment with your question
- **GitHub**: File an issue on the repository
- **Email**: Contact via the extension's support channel

We take privacy seriously and respond to all inquiries promptly.

---

## Summary: Your Privacy With CRM Tools Widget

| Aspect | Status |
|--------|--------|
| Data collection | ❌ None |
| External transmission | ❌ Never |
| Personal information | ❌ Not stored |
| Analytics/tracking | ❌ Not used |
| Third-party services | ❌ None |
| Cloud sync | ❌ No |
| User control | ✅ Yes (clear anytime) |
| Transparency | ✅ Complete (viewable in DevTools) |
| GDPR compliant | ✅ Yes |
| CCPA compliant | ✅ Yes |

**Bottom line: CRM Tools Widget is a privacy-first extension. Your data stays with you, always.**

---
**CRM Tools Extension** - Enhancing productivity while respecting your privacy.
