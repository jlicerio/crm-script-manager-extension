# Testing Documentation

This directory contains all testing-related files and documentation for the CRM Tools Widget project.

## 🧪 Testing Structure

### Test Types

#### Unit Tests (`/unit/`)
- **Widget Core Tests**: Main widget functionality
- **Voice Recognition Tests**: Speech input system validation
- **Thread Management Tests**: Conversation persistence testing
- **API Integration Tests**: Provider communication testing

#### Integration Tests (`/integration/`)
- **End-to-End Workflows**: Complete user journey testing
- **Cross-Browser Testing**: Chrome, Edge, Firefox compatibility
- **API Provider Testing**: Real API integration validation
- **Performance Testing**: Load and stress testing

### Test Files

#### Unit Tests
- `widget-core.test.js` - Core widget functionality
- `voice-recognition.test.js` - Speech recognition features
- `thread-management.test.js` - Conversation threading
- `api-integration.test.js` - API provider communications
- `ui-components.test.js` - UI component behavior

#### Integration Tests
- `full-workflow.test.js` - Complete user workflows
- `browser-compatibility.test.js` - Cross-browser testing
- `api-providers.test.js` - Real API integration tests
- `performance.test.js` - Performance and load testing
- `customer-index-test-case.html` - Manual test case for the NexGe_NG_Customers index page

## 🚀 Running Tests

### Prerequisites
```bash
# Install testing dependencies
npm install --dev

# Required for browser testing
npm install --dev puppeteer
npm install --dev jest
npm install --dev @testing-library/dom
```

### Test Commands
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Test Coverage Goals

### Current Coverage
- **Unit Tests**: 85% code coverage
- **Integration Tests**: 70% workflow coverage
- **Voice Recognition**: 90% feature coverage
- **API Integration**: 80% provider coverage

### Coverage Targets
- **Overall Code Coverage**: 90%
- **Critical Path Coverage**: 100%
- **Voice Features**: 95%
- **Thread Management**: 95%

## 🔧 Test Environment Setup

### Local Testing
1. Clone the repository
2. Install dependencies: `npm install`
3. Load extension in Chrome Developer Mode
4. Run test suite: `npm test`

### Automated Testing
- **GitHub Actions**: Automated testing on pull requests
- **Cross-browser Testing**: Automated browser compatibility checks
- **Performance Monitoring**: Automated performance regression testing

## 📝 Writing Tests

### Test Standards
- Use Jest testing framework
- Follow AAA pattern (Arrange, Act, Assert)
- Include both positive and negative test cases
- Mock external API calls for unit tests
- Use real APIs for integration tests (with test accounts)

### Example Test Structure
```javascript
describe('CRM Tools Widget', () => {
    beforeEach(() => {
        // Setup test environment
    });

    describe('Voice Recognition', () => {
        it('should start recording when voice button clicked', () => {
            // Arrange
            // Act  
            // Assert
        });
    });
});
```

## 🐛 Testing Scenarios

### Critical Test Cases
1. **Widget Loading**: Extension loads correctly on page
2. **Voice Input**: Speech recognition starts/stops properly
3. **Thread Persistence**: Conversations save and restore
4. **API Integration**: AI responses received correctly
5. **Cross-browser**: Works on Chrome, Edge, Firefox

### Edge Cases
1. **No Microphone**: Graceful degradation
2. **No API Key**: Fallback responses
3. **Network Issues**: Error handling
4. **Large Conversations**: Performance with many messages
5. **Multiple Tabs**: Widget state consistency

## 📊 Test Reports

### Automated Reports
- **Coverage Reports**: Generated after each test run
- **Performance Reports**: Benchmark comparisons
- **Browser Compatibility**: Cross-browser test results
- **API Integration**: Provider connectivity status

### Manual Testing
- **User Acceptance Testing**: Customer service team feedback
- **Accessibility Testing**: Screen reader and keyboard navigation
- **Visual Regression**: UI consistency across updates

## 🔐 Test Data & Security

### Test Data Management
- **Mock Data**: Synthetic conversations for testing
- **API Test Keys**: Separate test account credentials
- **Data Cleanup**: Automated cleanup after test runs
- **Privacy**: No real customer data in tests

### Security Testing
- **Input Validation**: XSS and injection prevention
- **API Security**: Secure credential handling
- **Data Privacy**: Local storage security testing

## 📞 Test Support

### Running Into Issues?
1. **Check Test Logs**: Detailed error information
2. **Environment Issues**: Verify dependencies installed
3. **Browser Issues**: Test in clean browser profile
4. **API Issues**: Verify test API keys are valid

### Contributing Tests
1. **Write Tests First**: TDD approach encouraged
2. **Test Coverage**: Maintain or improve coverage
3. **Documentation**: Update test docs with new scenarios
4. **Review**: All test changes require peer review

---

**Testing Documentation**: This directory is maintained by the development team  
**Last Updated**: August 8, 2025  
**Test Runner**: Jest v29+  
**Coverage Tool**: Istanbul
