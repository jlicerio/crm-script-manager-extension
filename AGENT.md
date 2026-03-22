# CRM Tools Extension - Development Guide

## Overview

This is a Chrome Extension (Manifest V3) that provides productivity tools for SuiteCRM and Brightpattern agent desktop.

## Project Structure

```
crm-script-manager-extension/
├── crm-tools-chrome-store/     # Extension source (upload this to Chrome Web Store)
│   ├── manifest.json           # Extension manifest (version, permissions)
│   ├── background.js           # Service worker (handles external messages)
│   ├── crm-tools-widget.js     # Main content script (UI and features)
│   ├── popup.html              # Extension popup UI
│   ├── popup.js                # Popup logic
│   ├── extract-form-entries.js # Form field extraction utility
│   ├── icon.svg                # Extension icon
│   └── icons/                  # Additional icon sizes
├── docs/                       # Documentation
├── tests/                      # Test files
└── AGENT.md                    # This file
```

## Quick Start

### Load Extension in Chrome (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `crm-tools-chrome-store/` folder
5. The extension icon appears in your toolbar

### Refresh After Changes

1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click the **refresh** icon on your extension card
4. Reload the target page (CRM or Brightpattern)

## Development Workflow

### 1. Making Code Changes

Edit files in `crm-tools-chrome-store/`:
- `crm-tools-widget.js` - Main UI and feature logic
- `background.js` - Service worker for cross-tab communication
- `popup.html/js` - Toolbar popup interface

### 2. Testing Changes

```bash
# Test on CRM page
1. Navigate to https://crm.nexgenexpert.com
2. Open Chrome DevTools (F12)
3. Check Console for logs with prefix [CRM Tools]
4. Test your changes
```

### 3. Building for Release

```bash
# Create production zip (run from project root)
cd crm-tools-chrome-store
powershell Compress-Archive -Path * -DestinationPath ../CRM-Tools-Extension-vX.X.zip -Force
```

### 4. Version Bumping

Update version in `crm-tools-chrome-store/manifest.json`:
```json
{
  "version": "X.X"
}
```

Update `docs/CHANGELOG.md` with new version and changes.

### 5. Publishing to Chrome Web Store

1. Go to https://chrome.google.com/webstore/devconsole
2. Select your extension
3. Click **Update package**
4. Upload the new zip file
5. Submit for review

## Key Features

### Phone Number Auto-Fill
- Automatically fills phone from Brightpattern to CRM
- **Does NOT override** existing phone values in fields
- 5-minute expiration on stored phone data

### Smart Call Dependency
- Learns Category/Action based on Call Reason selection
- Stores mappings in `chrome.storage.local`
- Auto-fills on next visit

### Enhanced Dropdown Search
- Adds search box to model/product dropdowns
- Partial matching (handles "DLA20LTD" → "DLA-20LTD")
- Real-time filtering

### Copy Functions
- Copy Date: Copies current date in MM/DD/YYYY format
- Copy URL: Copies current page URL

## Adding New Tools

1. Add tool definition to `TOOL_REGISTRY` in `crm-tools-widget.js`:
```javascript
{
  id: 'tool-id',
  name: 'Tool Name',
  icon: '🔧',
  methodName: 'methodName',
  domains: ['crm', 'brightpattern']
}
```

2. Implement the method in the class:
```javascript
methodName() {
  console.log('Tool executed');
  this.showTemporaryMessage('Tool done!');
}
```

## Debugging

### Logs
All features log with prefix `[CRM Tools]`:
```javascript
console.log('[CRM Tools] Feature description');
```

### Storage
Check stored data:
1. Open extension popup
2. Click "🧪 Debug Tools"
3. View stored mappings and phone data

### Clear Data
```javascript
chrome.storage.local.clear();
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add -A
git commit -m "Description of changes"

# Push and create PR
git push -u origin feature/your-feature
```

## File Size Limits

Chrome Web Store limits:
- **Total uncompressed**: 244 KB max
- **Downloadable**: 50 MB max (not applicable for this extension)

Current sizes:
- `crm-tools-widget.js`: ~40 KB
- `background.js`: ~8 KB
- Total extension: ~50 KB

## Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access CRM/Brightpattern pages |
| `storage` | Store learned mappings locally |
| `scripting` | Inject tools into pages |

## Browser Support

- Chrome 88+
- Edge 88+
- Other Chromium browsers

## Common Tasks

### Fix Phone Override Issue
If phone auto-fill is overwriting existing values, check `checkAndFillPendingPhone()` function in `crm-tools-widget.js`. The field value check should prevent overwriting.

### Add New CRM Domain
1. Update `manifest.json` `host_permissions`
2. Add domain check in tool methods if needed

### Modify Auto-Fill Behavior
See functions:
- `checkAndFillPendingPhone()` - Phone auto-fill logic
- `checkAndPerformCustomerSearch()` - Search auto-fill
- `pastePhoneNumber()` - Manual paste function

## External Resources

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Web Store Developer Guide](https://developer.chrome.com/docs/webstore/)
