# Installation Guide

This guide walks you through installing and using the CRM Tools Widget browser extension.

## 📋 Prerequisites

### System Requirements
- **Browser**: Chrome 88+ or Edge 88+ (Chromium-based browsers like Brave, Vivaldi)
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **CRM Access**: SuiteCRM instance (tested with SuiteCRM 7.x+)
- **Storage**: ~1MB for extension (minimal footprint)

## 🚀 Installation Methods

### Method 1: Chrome Web Store (Recommended)
*Available soon on the Chrome Web Store*

1. Visit the Chrome Web Store
2. Search for "CRM Tools Widget" 
3. Click "Add to Chrome"
4. Grant required permissions when prompted
5. Pin the extension to your toolbar for easy access

### Method 2: Developer Mode Installation (For Testing)

#### Step 1: Download Extension Files
1. Clone or download the extension repository
2. Extract to a local folder (e.g., `C:\crm-tools-widget\`)

#### Step 2: Enable Developer Mode
1. Open Chrome and go to `chrome://extensions/`
2. Toggle **"Developer mode"** (top-right corner)
3. Click **"Load unpacked"**
4. Select the `crm-tools-chrome-store` folder from your downloaded files
5. The 🔧 extension icon should appear in your toolbar

#### Step 3: Verify Installation
1. Navigate to your SuiteCRM instance
2. Look for the floating 🔧 button in the bottom-right corner
3. Click it to see the available tools (should show Copy Date, Copy URL, Enhanced Search)

## ⚠️ Granting Permissions

Chrome will ask for permissions. The extension needs:
- **Active Tab**: To access your current webpage
- **Storage**: To save learned field mappings (all local to your browser)
- **Scripting**: To inject tools into CRM pages

Click **"Allow"** to proceed.

## ✨ First-Time Use

### 1. Locate the Widget
- Look for the 🔧 icon in your browser toolbar
- On SuiteCRM pages, you'll also see the floating tool button in the bottom-right corner

### 2. Explore the Tools
Click the floating button to expand and see:
- 📅 **Copy Date** - Copies today's date (MM/DD/YYYY)
- 🔗 **Copy URL** - Copies current page URL
- 🔍 **Enhanced Search** - Activates on model/product dropdowns

### 3. Try Copy Date
1. Click the floating 🔧 button
2. Click "Copy Date" (📅)
3. A toast notification confirms the date was copied
4. Paste (Ctrl+V) into any CRM field

### 4. Try Copy URL
1. Click the floating 🔧 button
2. Click "Copy URL" (🔗)
3. The current page URL is copied to clipboard
4. Use for quick linking in case notes or emails

### 5. Try Enhanced Search
1. Navigate to a CRM form with model/product dropdowns
2. The Enhanced Search tool automatically activates
3. Type in the dropdown to filter results instantly
4. Use partial matches like "DLA20" to find "DLA-20LTD"

## 🤖 Smart Call Dependency Automation

This feature learns from your behavior automatically:

1. On a Call record, select a **Call Reason** (e.g., "Technical Support")
2. Manually select a **Call Category** and **Call Action** to match
3. The widget learns this combination
4. Next time you select the same **Call Reason**, the Category and Action auto-fill!

**No configuration needed** - Just use the form normally and it learns.

## 🔧 No Setup Required

Unlike some extensions, this widget works immediately:
- ✅ No API keys to configure
- ✅ No account setup needed
- ✅ No complex settings
- ✅ All functionality works instantly after installation

## 🧪 Verification Checklist

- [ ] Extension icon appears in toolbar
- [ ] Floating 🔧 button appears on CRM pages
- [ ] Can click to expand/collapse tools
- [ ] Copy Date button works and shows toast feedback
- [ ] Copy URL button works and shows toast feedback
- [ ] Model/product dropdowns have search enhancement
- [ ] Call form auto-fills Category/Action after learning

## ❌ Troubleshooting

### Widget doesn't appear on CRM page
- **Solution**: Refresh the page (F5) and wait 2-3 seconds
- **Alternative**: Close and reopen the CRM tab

### Copy functions show error
- **Solution**: Make sure you have text selected or cursor in a form field
- **Check**: Toast message should appear confirming action

### Search enhancement not working on dropdowns
- **Solution**: The dropdown might use a different format; standard HTML `<select>` dropdowns are supported
- **Check**: Try scrolling the dropdown manually to confirm it's a native dropdown

### Learned mappings not saving
- **Solution**: Check that localStorage is enabled in your browser
  - Go to Chrome Settings → Privacy and security → Cookies and other site data
  - Make sure "Allow all cookies" is enabled or whitelist your CRM domain

## 📚 Next Steps

- Read [CRM_CASE_WORKFLOW.md](CRM_CASE_WORKFLOW.md) for your standard CRM workflow
- Check the main [README.md](../README.md) for architecture details
- See [PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md) to understand the modular tool system

### Voice Testing
- [ ] Microphone permissions granted
- [ ] Speech recognition starts/stops correctly
- [ ] Continuous recording accumulates multiple phrases
- [ ] Speech buffer displays in input field
- [ ] Voice input works after chat reopening

## 🐛 Common Installation Issues

### Extension Won't Load
**Symptoms**: Extension icon doesn't appear, or shows as disabled
**Solutions**:
1. Ensure you're using a supported browser version
2. Check that Developer Mode is enabled
3. Reload the extension from chrome://extensions/
4. Clear browser cache and restart browser

### Microphone Not Working
**Symptoms**: Voice button doesn't respond, no speech recognition
**Solutions**:
1. Check browser microphone permissions in Settings
2. Ensure microphone is not used by other applications
3. Test microphone with other websites/applications
4. Reload the page and try again

### API Integration Issues
**Symptoms**: No AI responses, error messages in chat
**Solutions**:
1. Verify API key is correct and active
2. Check API provider account credits/usage limits
3. Test API key with provider's documentation
4. Use browser developer tools to check for network errors

### Chat Interface Problems
**Symptoms**: Chat doesn't open, layout issues, buttons not working
**Solutions**:
1. Clear browser cache and local storage
2. Disable other extensions temporarily
3. Check browser console for JavaScript errors
4. Reload the page and try again

## 🔐 Security & Privacy

### Data Storage
- **Local Only**: All conversation data stored in browser local storage
- **API Keys**: Stored locally, never transmitted except to chosen AI providers
- **No Tracking**: Extension doesn't send data to third-party analytics

### Permissions Explained
- **Microphone**: Required for voice input functionality
- **Active Tab**: Needed to inject widget into current page
- **Storage**: For saving conversations and settings locally

## 📞 Support & Help

### Getting Help
1. **Check Troubleshooting Guide**: Most common issues are documented
2. **Browser Console**: Check for error messages (F12 → Console)
3. **Extension Logs**: Useful for debugging specific issues
4. **Repository Issues**: Report bugs and request features

### Useful Resources
- [User Manual](./USER_MANUAL.md) - Complete usage guide
- [API Integration Guide](../api/API_INTEGRATION.md) - API setup details
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common problems and solutions

---

**Installation Support**: For installation-specific issues, please include:
- Browser version and operating system
- Extension version
- Error messages from browser console
- Steps to reproduce the issue

**Last Updated**: August 8, 2025
