# CRM Tools Widget Extension

A comprehensive browser extension for JVC Kenwood customer service teams that provides an intelligent chat assistant with voice input capabilities, conversation threading, automated helpdesk documentation, and SuiteCRM integration.

## 🚀 Features

### Core Features
- **💬 Chat Assistant** - AI-powered chat interface with multiple provider support (OpenAI, Claude, Gemini)
- **🎤 Voice Input** - Speech-to-text using Web Speech API for hands-free operation
- **🧠 Thread Memory** - Conversation persistence across sessions
- **📋 Call Dependency Automation** - Auto-fills Call Category and Action based on learned patterns

### Widget Tools
- **Copy Current Date** - Quick date copy in MM/DD/YYYY format
- **Copy URL** - Copy current page URL for quick access
- **Model Selectors** - Enhanced dropdown search with flexible matching
- **Learned Mapping** - localStorage-backed dependency learning

### CRM Integration
- **SuiteCRM REST API v4** - Full customer and case management
- **Customer Creation** - Automated customer record creation
- **Case Management** - Create and track support cases
- **Duplicate Detection** - Prevent duplicate customer records

## 📁 Project Structure

```
crm-script-manager-extension/
├── crm-tools-chrome-store/     # Chrome Web Store package
│   ├── manifest.json           # Extension configuration
│   ├── popup.html/js           # Extension popup UI
│   ├── crm-tools-widget.js     # Main widget implementation
│   ├── background.js           # Service worker
│   ├── extract-form-entries.js # Form extraction utility
│   └── icons/                  # Extension icons
├── crm.nexgenexpert/          # SuiteCRM API reference files
│   └── service/v4/rest.php     # REST API documentation
├── docs/                      # Documentation
│   ├── guides/                 # User and developer guides
│   ├── api/                   # API references
│   ├── CHANGELOG.md            # Version history
│   └── PRIVACY_POLICY.md       # Privacy information
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── icons/                     # Root-level icons
└── .gitignore                 # Git ignore patterns
```

## 🛠️ Installation

### From Source (Developer Mode)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm-script-manager-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer Mode** (toggle in top-right)

4. Click **Load unpacked** and select the `crm-tools-chrome-store/` directory

5. The extension icon will appear in your browser toolbar

### From Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store for easy installation.

## ⚙️ Configuration

### API Provider Setup

1. Click the extension icon in your browser toolbar
2. Navigate to **Settings**
3. Select your preferred AI provider:
   - **OpenAI** - Requires API key
   - **Anthropic Claude** - Requires API key
   - **Google Gemini** - Requires API key
4. Enter your API key and save

### CRM Connection

1. Open your SuiteCRM instance
2. Navigate to the extension popup
3. Enter your CRM credentials and API endpoint
4. Test the connection

## 📖 Documentation

- **[Installation Guide](docs/guides/INSTALLATION.md)** - Detailed installation instructions
- **[CRM Case Workflow](docs/guides/CRM_CASE_WORKFLOW.md)** - Customer and case creation process
- **[Project Documentation](docs/PROJECT_DOCUMENTATION.md)** - Complete project overview and roadmap
- **[SuiteCRM API Reference](docs/SUITECRM_API_REFERENCE.md)** - API documentation
- **[Chrome Store Listing](docs/CHROME_STORE_LISTING.md)** - Store submission guide

## 🧪 Testing

```bash
# Open test files in browser for manual testing
open tests/integration-test.html
open tests/suitecrm-api-test.html
open tests/test-widget.html
```

## 📝 Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for version history and updates.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/guides/CONTRIBUTING.md) for guidelines.

## 🔗 Repository

- **GitHub**: https://github.com/jlicerio/crm-script-manager-extension

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🔧 Development

### Architecture

The widget uses a modular tool registry pattern for easy extensibility:

```javascript
const TOOL_REGISTRY = [
    { id: 'copy-date', name: 'Copy Date', icon: '📅', color: '#f39c12', methodName: 'copyCurrentDate' },
    { id: 'copy-url', name: 'Copy URL', icon: '🔗', color: '#3498db', methodName: 'copyCurrentUrl' },
    // Add new tools here...
];
```

### Adding New Tools

1. Add an entry to `TOOL_REGISTRY` in `crm-tools-widget.js`
2. Implement the corresponding method in the `CRMToolsWidget` class
3. The tool will automatically appear in the widget toolbar

---

**Version**: 1.1 (Modular Architecture)  
**Last Updated**: March 2026
