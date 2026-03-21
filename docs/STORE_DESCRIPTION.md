# CRM Tools Extension

Smartly automate your CRM workflow with learned field dependencies, smart search, and time-saving utilities. Built specifically for SuiteCRM productivity.

## Core Features

### 🤖 Smart Call Dependency Automation
- **Learn from your selections** - Pick Call Category/Action once for each Call Reason
- **Auto-fill on next visit** - Field combinations saved to localStorage
- **No configuration needed** - Works automatically, learns from behavior
- **Timeout protection** - Safeguards against CRM form resets

### 🔍 Enhanced Dropdown Search
- Automatically detects and enhances model/product selector dropdowns
- Flexible search with partial matching (handles "DLA-20LTD" and "DLA20LTD")
- Real-time filtering as you type
- Visual highlighting of matched options

### 🔧 Utility Tools
- **Copy Date**: Instantly copy current date in MM/DD/YYYY format
- **Copy URL**: Copy current page URL to clipboard
- **One-click execution** with visual toast feedback

### 🎨 Clean, Modular Design
- Floating widget appears in bottom-right corner
- Minimal interface that stays out of your way
- Expandable tool buttons for quick access
- Visual feedback on all actions

## Installation

1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" 
4. Click "Load unpacked" and select the extension folder

## Usage

### Floating Widget
- Look for the 🔧 tool icon in the bottom-right corner
- Click to expand tools panel
- Select any tool for instant action

### Enhanced Search
- Search boxes automatically appear next to dropdown selectors
- Type to filter options instantly
- Click or press Enter to select

## How Learned Mapping Works

1. **First selection**: You select a Call Reason "Technical Support"
2. **You then pick**: Category "Troubleshooting" and Action "Remote Assist"
3. **Extension learns**: The mapping between these three fields
4. **Next time**: Select "Technical Support" again → Category and Action auto-fill
5. **Completely automatic** - No training, no setup, just use your CRM normally

## Permissions

- **Active Tab**: Access current CRM page to detect forms and inject tools
- **Storage**: Save your learned field mappings (localStorage only)
- **Scripting**: Inject tools and automation into CRM pages

## Privacy & Security

- ✅ **No data collection** - Zero tracking
- ✅ **100% local storage** - All mappings stored in your browser only
- ✅ **Zero external calls** - No data ever leaves your computer
- ✅ **Open source approach** - Code is transparent (if requested)
- ✅ **Instant disable** - Uninstall immediately stops all functionality

## Browser Compatibility

- Chrome 88+
- Edge 88+  
- All Chromium-based browsers (Brave, Vivaldi, etc.)

## Perfect For

- **SuiteCRM support teams** - Auto-fill call management fields
- **High-volume call centers** - Learn your most common field patterns
- **Form-heavy CRM users** - Reduce typing and dropdown scrolling
- **Teams wanting less friction** - Zero setup overhead

## Version History

**v1.1 (March 2026)** - Modular architecture, optimized codebase, focused feature set
**v1.0** - Initial release with core tools and search enhancement
- All functionality works locally
- No external server communication

## Support

For issues or feature requests, contact the development team.

---

**Version**: 1.0  
**Compatible with**: Chrome, Edge, and other Chromium browsers  
**Target Site**: CRM systems and form-heavy websites
