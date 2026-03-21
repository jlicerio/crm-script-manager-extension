# CRM Tools Widget - Project Documentation

## 🔧 Project Overview

The CRM Tools Widget is a comprehensive browser extension designed for JVC Kenwood customer service teams. It provides an intelligent chat assistant with voice input capabilities, conversation threading, and automated helpdesk documentation processing.

### Key Features
- **🔧 Modular Tool Widget** - Floating toolbar with extensible tool buttons
- **📋 Call Dependency Automation** - Auto-fills Call Category and Action based on learned Call Reason mapping
- **🔍 Enhanced Model Selectors** - Smart search on dropdown menus with flexible matching
- **⚙️ Utility Functions** - Copy current date, copy URL for quick access
- **🧠 Learned Mapping System** - localStorage-backed dependency learning that persists across sessions

---

## 📈 Current Development Status

### ✅ Completed Features

#### Core Widget System
- [x] **Floating Toolbar** - Persistent floating button with expandable tool menu
- [x] **Modular Tool Registry** - Easy add/remove of tools via TOOL_REGISTRY constant
- [x] **Tool Action System** - Calls tool methods asynchronously with error handling
- [x] **Z-index Management** - Proper layering for toolbar and overlays

#### Call Dependency Automation
- [x] **Call Reason Mapper** - Learns dependency patterns from user selections
- [x] **Auto-fill Category/Action** - Automatically selects dependent fields based on Call Reason
- [x] **localStorage Persistence** - Saves mapped relationships (`crmCallReasonMappingsV1`)
- [x] **Reason Preservation** - Guards against CRM clearing reason field
- [x] **Silent Auto-run** - Automatic on page load, manual trigger available

#### Enhanced Model Selectors
- [x] **Smart Dropdown Search** - Flexible search on HTML `<select>` elements
- [x] **Text Matching** - Searches by exact match, substring, or case-insensitive patterns
- [x] **Auto-highlighting** - Marks matching options in the dropdown
- [x] **Timeout Handling** - Graceful degradation for slow page loads
- [x] **Silent Mode** - Option to run without user feedback messages

#### Utility Features
- [x] **Copy Current Date** - Copies today's date (MM/DD/YYYY) to clipboard
- [x] **Copy URL** - Copies current page URL to clipboard
- [x] **Toast Feedback** - User-friendly toast messages for all actions
- [x] **Feedback Button Animation** - Visual feedback on tool button clicks

### 🔧 Recent Refactoring & Enhancements

#### Latest Updates (March 2026)
- **NEW: Modular Tool Architecture** - Introduced TOOL_REGISTRY for easy tool management
- **Archived Features** - Moved complex duplicate check and search discovery to archive
  - Duplicate probe detection (search CRM for potential duplicates)
  - Search API route discovery (network analysis + DOM scanning)
  - See `Archive/crm-duplicate-search-feature.js` for restoration instructions
- **Code Cleanup** - Reduced main widget file significantly
- **Constructor Simplification** - Removed archived storage keys

#### Call Reason Automation Improvements
- Added learned mapping with timeout-based safeguards
- Implemented reason preservation against CRM form resets
- Silent auto-run to avoid notification fatigue
- Manual tool button for on-demand execution

#### Widget Pattern Enhancements
- Tool registry pattern enables single-line tool additions/removals
- Async tool action handling with Promise support
- Centralized tool button creation from registry
- No code changes needed to loadTools() when modifying tools

---

## 🏗️ How to Extend the Widget

### Adding a New Tool

1. **Add entry to TOOL_REGISTRY** at the top of `crm-tools-widget.js`:
   ```javascript
   const TOOL_REGISTRY = [
       { id: 'copy-date', name: 'Copy Date', icon: '📅', color: '#f39c12', methodName: 'copyCurrentDate' },
       { id: 'my-new-tool', name: 'My Tool', icon: '🛠️', color: '#3498db', methodName: 'myNewToolMethod' },
   ];
   ```

2. **Implement the method** in the `CRMToolsWidget` class:
   ```javascript
   myNewToolMethod() {
       // Sync method
       this.showTemporaryMessage('My tool ran!');
   }
   
   async myAsyncToolMethod() {
       // Async method - tool waits for Promise resolution
       const result = await fetch('/some-endpoint');
       this.showTemporaryMessage('Async done!');
   }
   ```

3. **That's it!** The tool will automatically appear on the widget toolbar.

### Removing a Tool

Simply delete the entry from `TOOL_REGISTRY`. No other changes needed.

### Restoring Archived Tools

See `Archive/crm-duplicate-search-feature.js` for the duplicate probe and search discovery features. To restore:

1. Add entries back to `TOOL_REGISTRY`
2. Paste the 16 methods into the `CRMToolsWidget` class
3. Add the 3 storage keys back to the constructor

---

## 🚀 Future Development Roadmap

### 📅 Short-term Goals (Next 2-4 weeks)

#### Tool Expansion
- [ ] **Add New Tools to Registry** - High-value utilities (e.g., format phone numbers, validate emails)
- [ ] **Tool Tooltips** - Help text on hover for each tool
- [ ] **Tool Keyboard Shortcuts** - Quick access via keyboard combinations
- [ ] **Tool Settings** - Per-tool configuration in a settings modal

#### Call Automation Enhancements
- [ ] **Extended Field Mapping** - Learn patterns for more than just Category/Action
- [ ] **Bulk Mapping Manager** - UI to view/edit learned mappings
- [ ] **Mapping Analytics** - Stats on most common field combinations
- [ ] **Export Mappings** - Save and share mapping configurations

#### CRM Integration Stability
- [ ] **Field ID Auto-discovery** - Scan form structure on load
- [ ] **CRM Compatibility Matrix** - Document support for different CRM versions
- [ ] **Cross-tab Communication** - Sync state across multiple CRM tabs
- [ ] **Error Recovery** - Handle missing or renamed CRM fields gracefully

### 🎯 Medium-term Goals (1-3 months)

#### CRM Integration Tools
- [ ] **Smart Customer Search** - Unified search across CRM with deduplication suggestions
- [ ] **Form Field Auto-complete** - Context-aware suggestions for common fields
- [ ] **Industry-specific Tools** - Tools tailored to JVC Kenwood support workflow
- [ ] **Case Linking** - Quick case/customer association helpers

#### Mapping & Analytics  
- [ ] **Mapping Dashboard** - Visualize all learned field dependencies
- [ ] **Usage Analytics** - Track which tools are most used
- [ ] **Performance Insights** - Time saved by automation features
- [ ] **Audit Trail** - History of all tool executions and mappings

#### Extensibility & Configuration
- [ ] **Settings UI** - Dedicated settings panel for tool configuration
- [ ] **Custom Icons** - Allow users to customize tool buttons
- [ ] **Preset Tool Packs** - Save/load different tool configurations
- [ ] **Per-site Configuration** - Different tool sets for different CRM modules

### 🌟 Long-term Vision (3-6 months)

#### Smart Automation
- [ ] **Conditional Tool Visibility** - Show/hide tools based on page context
- [ ] **Tool Chaining** - Run multiple tools in sequence
- [ ] **Blackbox Rules** - If-then automation for common workflows
- [ ] **Macro Recording** - Record and replay sequences of tool actions

#### Cross-CRM Support
- [ ] **Multi-CRM Adapter** - Support Salesforce, HubSpot, Zendesk alongside SuiteCRM
- [ ] **Field Mapping Profiles** - Save CRM-specific field patterns
- [ ] **Open Protocol** - Standard format for tool definitions
- [ ] **Community Tooling** - Marketplace for community-built tools

#### Enterprise Features
- [ ] **Team Configuration** - Share tool sets across team members
- [ ] **Usage Reporting** - Organization-level productivity metrics
- [ ] **Data Retention Policies** - Control localStorage cleanup
- [ ] **Compliance Modes** - GDPR/SOC2 compliance features

---

## 🛠 Technical Architecture

### Current Technology Stack
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Storage**: Browser LocalStorage for persistence
- **APIs**: REST integration with SuiteCRM v4
- **Speech**: Web Speech API for voice recognition
- **Deployment**: Browser extension (Chrome/Edge compatible)

### Code Organization
```
crm-script-manager-extension/
├── crm-tools-chrome-store/      # Chrome extension package
│   ├── manifest.json            # Extension configuration
│   ├── popup.html/js            # Extension popup interface
│   ├── background.js            # Service worker
│   ├── crm-tools-widget.js      # Main widget implementation
│   ├── extract-form-entries.js  # Form extraction utility
│   └── icons/                   # Extension icons
├── crm.nexgenexpert/           # SuiteCRM API reference
│   └── service/v4/rest.php      # REST API documentation
├── docs/                       # Documentation files
│   ├── guides/                  # User and developer guides
│   ├── api/                     # API references
│   ├── CHANGELOG.md             # Version history
│   └── PRIVACY_POLICY.md        # Privacy information
├── tests/                      # Test files
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── *.html                   # Manual test pages
└── icons/                      # Root-level icons
```

### Key Classes & Methods
- `CRMToolsWidget` - Main widget class
- `createChatBubble()` - Chat interface initialization
- `setupSpeechRecognition()` - Voice input configuration
- `threadMemorySystem()` - Conversation persistence
- `reinitializeChatBubble()` - State restoration

---

## 🔒 Security & Privacy

### Current Implementation
- All API keys stored locally in browser storage
- No data transmitted to third-party services beyond chosen AI providers
- Conversation data remains in local browser storage
- HTTPS-only API communications

### Future Security Enhancements
- Implement client-side encryption for conversation storage
- Add data retention policies and automatic cleanup
- Support for corporate VPN and proxy configurations
- Enhanced audit logging for compliance requirements

---

## 🧪 Testing & Quality Assurance

### Testing Strategy
- **Unit Testing**: Core functionality validation
- **Integration Testing**: API provider compatibility
- **User Acceptance Testing**: Customer service team feedback
- **Cross-browser Testing**: Chrome, Edge, Firefox compatibility

### Test Files
- `tests/test-widget.html` - Widget functionality tests
- `tests/suitecrm-api-test.html` - API integration tests
- `tests/integration-test.html` - End-to-end integration tests
- `tests/test-chat-settings.html` - Chat configuration tests
- `tests/unit/` - Automated unit tests

---

## 📚 Documentation Structure

```
docs/
├── README.md                    # Documentation index
├── PROJECT_DOCUMENTATION.md     # This file
├── CHANGELOG.md                 # Version history
├── CHROME_STORE_LISTING.md      # Store listing guide
├── CHROME_WEB_STORE_SUBMISSION.md # Submission process
├── PRIVACY_POLICY.md            # Privacy information
├── SUITECRM_API_REFERENCE.md    # API documentation
├── guides/
│   ├── INSTALLATION.md          # Installation guide
│   ├── CRM_CASE_WORKFLOW.md     # Customer/case workflow
│   ├── CONTRIBUTING.md          # Contribution guidelines
│   └── USER_MANUAL.md           # User guide (planned)
└── api/
    └── API_INTEGRATION.md       # API integration guide (planned)
```

---

## 🤝 Contributing & Development

### Development Setup
1. Clone the repository
2. Load extension in Chrome Developer Mode
3. Test with provided sample data
4. Follow coding standards and commit guidelines

### Contribution Guidelines
- All new features require documentation updates
- Voice recognition changes need cross-browser testing
- UI modifications should maintain accessibility standards
- Performance impact assessment for all major changes

See [CONTRIBUTING.md](./guides/CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](../LICENSE) for details.

---

**Last Updated**: March 21, 2026  
**Version**: 1.1 (Modular Architecture)  
**Maintainer**: Development Team
