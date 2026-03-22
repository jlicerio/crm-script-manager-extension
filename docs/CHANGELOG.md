# CRM Tools Chrome Extension - Changelog

All notable changes to the CRM Tools Chrome Extension are documented here.

## [1.0.4] - 2026-03-22

### Added
- **KB Article Preview**: Click "👁️ Preview" button on any article to open full article content in a floating panel. Article content is scraped in background without leaving CRM. Positioned to the right of KB Chat window. Purple gradient header with × close button. (Positioning may need slight adjustment)

### Changed
- **Article Links Open in New Tab**: Links within the article preview window now open in a new browser tab instead of overriding the current content
- **Chat Bubble Alignment**: Chat bubble is now aligned on the same Y axis (bottom: 20px) as the widget button, ensuring consistent positioning
- **Position Memory**: Both the chat bubble and article preview window now remember their positions when moved. Positions are saved to chrome.storage.local when the user releases the drag

### Fixed
- **Malformed Article URLs**: Fixed issue where malformed HTML in scraped articles (like unquoted href attributes) caused broken URLs. The scraper now properly cleans and quotes URLs, and the click handler extracts correct URLs from text content as fallback

## [1.0.3] - 2026-03-21

### Added
- **KB Chat Tool**: New floating chat interface for searching AKBS knowledge base articles
- **Instructions Link**: KB Chat now displays a "View Instructions" link when available on the AKBS product page (scrapes `a#ctl00_ContentPlaceHolder1_hlInstructions`). Positioned before KB articles.
- **Model Dropdown in Chat**: KB Chat now uses a searchable input with autocomplete suggestions populated from the CRM's `model_c` select, making it easier to pick models.
- **Model Name Cleanup**: Strips prefixes like "Ken_", "JVC_" from model names when searching AKBS to improve search accuracy.
- **Search Engine Buttons**: Added Google and Bing search buttons to KB Chat results for fallback searching when products aren't on AKBS.
- **Background Scraping**: AKBS pages are scraped in a hidden background tab without leaving the CRM
- **Auto-Detection from CRM**: Automatically detects model from `model_c` dropdown and account type from `account_type_c`
- **Kenwood/JVC Toggle**: Radio button selector to switch between Kenwood and JVC product divisions
- **Model Caching**: Successful model+division combinations are saved to `chrome.storage.local` for future reference
- **Persistent Bubble**: Chat bubble auto-creates when a model is detected, stays visible until explicitly closed
- **Minimize to Bubble**: Close button minimizes chat to bubble instead of removing completely

### Changed
- **Improved Radio Button Styling**: Kenwood/JVC selectors now have better visual feedback with accent color, bold text, and hover effects
- **Account Type Re-Detection**: Chat now re-detects account type at click time (not creation time) for accurate division selection

### Fixed
- **Account Type Pre-Selection**: Radio buttons now correctly pre-select based on current `account_type_c` value
- **Scraping Returns Empty**: Fixed AKBS scraping to use correct selector `a[id*="hlIssue"]` for article links
- **JVC vs Kenwood Classification**: Fixed `jvcKenwood` being incorrectly classified as Kenwood (now correctly identifies as JVC)

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
