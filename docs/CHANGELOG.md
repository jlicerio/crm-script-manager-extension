# CRM Tools Chrome Extension - Changelog

All notable changes to the CRM Tools Chrome Extension are documented here.

## [1.0.2] - 2026-03-20

### Added
- **Google Forms Analytics Integration**: Added analytics tracking that sends user behavior data to a Google Sheet via Google Forms
- **Batch Analytics Mode**: Analytics events are queued and sent in batches of 10 (or on page unload)
- **Analytics Queue Persistence**: Analytics queue persists in chrome.storage.local so events aren't lost on crash
- **Flush Analytics Button**: New dev-mode button to manually trigger sending analytics batch
- **Extract Form IDs Tool**: Dev-mode utility to extract Google Form entry IDs from any form page
- **Google Forms Content Script Support**: Extension now runs on docs.google.com/forms for form extraction

### Changed
- **AKBS Model Search Removed from Hamburger Menu**: Removed "AKBS Model Search" tool from the widget TOOL_REGISTRY (hamburger menu)
- **AKBS Button Retained on Model Dropdown**: AKBS search button still available when enhancing model_c dropdown in CRM UI

### Fixed
- **Analytics Batch Sending**: Fixed analytics to send each event separately via background script

## [1.0.1] - 2026-03-20

### Added
- **Persistent Call Status Indicator**: Widget now displays current call status on the LEFT side showing "📞 (XXX) XXX-XXXX" format
- **Blinking Animation**: 5-second green/red blinking animation when calls come in/go on hold
- **Dev Mode Toggle in Popup**: Dev Mode can now be enabled/disabled via a toggle switch in the extension popup
- **Collapsible Developer Tools**: Developer tools section in popup expands when Dev Mode is enabled
- **Scan Page Diagnostic**: Added page scanning diagnostic tool accessible from popup dev tools

### Changed
- **Dev Mode Controls Moved**: Dev Mode toggle moved from widget to popup for better user experience (hidden from regular users)
- **Message Passing Architecture**: Widget now listens for `DEV_MODE_TOGGLE` and `SCAN_PAGE` messages from popup

### Fixed
- **Page Refresh Call Status**: Call status now persists and restores correctly after page refresh
- **Pending Phone Search**: Fixed timing issue where storage was cleared before phone was filled in search - now triggers `checkAndFillPendingPhone()` after restoring from storage
- **Demo Call Status**: Fixed `demoCallStatus()` to properly trigger customer search after filling phone number

### Removed
- **Unused Script Manager**: Completely removed the standalone Script Manager feature (`script-manager.html`, `script-manager.js`) as it was never integrated with the main widget and stored scripts that were never used

## [1.0.0] - 2026-03-19

### Added
- Initial release of CRM Tools Chrome Extension
- Brightpattern call detection with CRM customer lookup
- Floating widget interface
- SuiteCRM API integration for customer search
- Domain-based tool filtering (tools only appear on appropriate domains)
- Dev-only tools with `devOnly: true` flag
