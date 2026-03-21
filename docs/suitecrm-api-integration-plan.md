# SuiteCRM REST API Integration Plan

## Overview

Revamp the CRM Tools Widget extension to use SuiteCRM's REST API for direct database access, replacing UI-scraping approaches with robust API calls.

## Why API Integration?

### Current Limitations:
- UI scraping is fragile (DOM changes break functionality)
- Slow (requires page loads and form submissions)
- Limited to visible UI elements
- Cannot access hidden or related data

### API Benefits:
- Direct database access
- Fast (milliseconds vs seconds)
- Structured data responses
- Access to related records (calls, cases, history)
- More reliable and maintainable

---

## SuiteCRM REST API Overview

### API Endpoint
```
https://crm.nexgenexpert.com/service/v4/rest.php
```

### Authentication Flow
1. **Login Request** → Get session ID
2. **Authenticated Requests** → Use session ID
3. **Logout** → End session (optional)

### Key Methods
| Method | Purpose |
|--------|---------|
| `login` | Authenticate user, get session |
| `get_entry` | Get single record by ID |
| `get_entries` | Get multiple records |
| `set_entry` | Create/Update record |
| `search_by_module` | Search across modules |
| `get_module_fields` | Get module field definitions |
| `logout` | End session |

---

## Architecture Design

### Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                    CRM Tools Widget                      │
├─────────────────────────────────────────────────────────┤
│  UI Layer                                               │
│  ├── Tool Registry (buttons)                           │
│  ├── Results Panel (popup/modal)                      │
│  └── Status/Feedback Display                          │
├─────────────────────────────────────────────────────────┤
│  API Service Layer                                      │
│  ├── SuiteCRMConnection (auth, session)               │
│  ├── CustomerAPI (search, get, create)               │
│  └── PhoneSearchService (phone-specific logic)        │
├─────────────────────────────────────────────────────────┤
│  Storage Layer                                          │
│  ├── chrome.storage.local (extension state)           │
│  └── Session Cache (api session, expiry)             │
└─────────────────────────────────────────────────────────┘
```

### Class Design

```javascript
// API Connection Manager
class SuiteCRMConnection {
    - apiUrl: string
    - sessionId: string
    - sessionExpiry: Date
    + login(username, password): Promise<boolean>
    + logout(): Promise<void>
    + isAuthenticated(): boolean
    + request(method, data): Promise<Response>
}

// Customer API Service  
class CustomerAPIService {
    - connection: SuiteCRMConnection
    + searchByPhone(phone): Promise<Customer[]>
    + getCustomer(id): Promise<Customer>
    + createCustomer(data): Promise<string>
    + updateCustomer(id, data): Promise<boolean>
}

// Phone Search Tool
class PhoneSearchTool {
    - api: CustomerAPIService
    - ui: ResultsPanel
    + search(phone): Promise<void>
    + displayResults(customers): void
    + selectCustomer(customer): void
}
```

---

## Data Flow

### Phone Search Flow

```
Brightpattern Call Arrives
         │
         ▼
┌─────────────────┐
│ Auto-extract    │──► chrome.storage.local
│ phone number    │
└─────────────────┘
         │
         ▼ (User clicks "Search Customer")
┌─────────────────┐
│ Extension UI    │
└─────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ SuiteCRM REST API              │
│ POST /service/v4/rest.php       │
│ {                              │
│   method: "search_by_module",  │
│   rest_data: {                 │
│     search_string: "2087134321"│
│     modules: ["NexGe_NG_Customers"]│
│   }                            │
│ }                              │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ API Response                    │
│ {                              │
│   result_count: 1,            │
│   entries: [{                 │
│     id: "abc-123",            │
│     name_value_list: {        │
│       first_name: "John",     │
│       last_name: "Doe",       │
│       phone_mobile: "208...",  │
│       // ...                   │
│     }                          │
│   }]                           │
│ }                              │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Results Display                 │
│ ┌───────────────────────────┐  │
│ │ 👤 John Doe               │  │
│ │ 📞 (208) 713-4321        │  │
│ │ 📧 john@email.com        │  │
│ │ [Open Customer] [New Call]│  │
│ └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## API Implementation Details

### 1. Login Method
```javascript
async function login(username, password) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'login',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: {
                user_auth: {
                    user_name: username,
                    password: md5(password) // or raw depending on config
                }
            }
        })
    });
    const data = await response.json();
    return {
        sessionId: data.id,
        userId: data.name_value_list.id
    };
}
```

### 2. Search by Phone
```javascript
async function searchByPhone(phone) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'search_by_module',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: {
                session: SESSION_ID,
                search_string: phone,
                modules: ['NexGe_NG_Customers'],
                offset: 0,
                limit: 20
            }
        })
    });
    const data = await response.json();
    return data.entry_list; // Array of matching customers
}
```

### 3. Get Customer Details
```javascript
async function getCustomer(id) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'get_entry',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: {
                session: SESSION_ID,
                module_name: 'NexGe_NG_Customers',
                id: id,
                select_fields: ['id', 'name', 'phone_mobile', 'email1', 'account_name', ...]
            }
        })
    });
    return (await response.json()).entry_list[0];
}
```

---

## User Interface Design

### Search Results Panel

```
┌────────────────────────────────────────┐
│ 🔍 Customer Search                     │
├────────────────────────────────────────┤
│ Phone: (208) 713-4321                  │
├────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │ 👤 John Doe                      │   │
│ │ 📞 (208) 713-4321 (mobile)      │   │
│ │ 📧 john.doe@email.com            │   │
│ │ 🏢 Acme Corp                     │   │
│ │ ─────────────────────────────────│   │
│ │ [Open CRM]  [New Case]  [Call]   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 👤 Jane Smith                    │   │
│ │ 📞 (208) 713-4321 (home)        │   │
│ │ 📧 jane@email.com                │   │
│ │ 🏢 Smith Industries              │   │
│ │ ─────────────────────────────────│   │
│ │ [Open CRM]  [New Case]  [Call]   │   │
│ └──────────────────────────────────┘   │
├────────────────────────────────────────┤
│ [Create New Customer with this Phone]  │
└────────────────────────────────────────┘
```

### Settings Panel (API Credentials)

```
┌────────────────────────────────────────┐
│ ⚙️ API Settings                        │
├────────────────────────────────────────┤
│                                        │
│ CRM URL:                               │
│ [https://crm.nexgenexpert.com      ]   │
│                                        │
│ Username:                              │
│ [john.doe                          ]   │
│                                        │
│ Password:                              │
│ [••••••••••••                      ]   │
│                                        │
│ [ ] Remember credentials               │
│                                        │
│ [Test Connection]  [Save Settings]    │
│                                        │
└────────────────────────────────────────┘
```

---

## Error Handling

### Error Types & Responses

| Error | Cause | User Message | Action |
|-------|-------|--------------|--------|
| `invalid_session` | Session expired | "Session expired. Please re-login." | Trigger re-login |
| `invalid_credentials` | Wrong username/password | "Invalid credentials" | Prompt for credentials |
| `network_error` | No internet/CRM down | "Cannot connect to CRM" | Retry with backoff |
| `no_results` | No customer found | "No customer found" | Offer create new |
| `rate_limit` | Too many requests | "Too many requests" | Delay & retry |

### Retry Logic
```
Attempt 1 ──► Fail ──► Wait 1s ──► Attempt 2
                                    │
                              Fail ◄──┘
                                    │
                              Wait 2s ──► Attempt 3
                                              │
                                        Fail ◄──┘
                                        Show error
```

---

## Security Considerations

### Credential Storage
- **Never** store passwords in plain text
- Use `chrome.storage.local` with encryption OR
- Use `chrome.storage.session` (session only, not persisted)
- Consider OAuth if available

### Session Management
- Store session ID, not credentials
- Check session expiry before each request
- Implement session refresh before expiry
- Clear session on logout

### API Key/Token Rotation
- If API keys are used, implement rotation
- Store encrypted in extension storage
- Never commit credentials to code

---

## Implementation Phases

### Phase 1: Core API Integration
- [ ] SuiteCRMConnection class (login/logout)
- [ ] Basic API request method
- [ ] Error handling foundation
- [ ] Settings UI for credentials

### Phase 2: Customer Search
- [ ] Search by phone method
- [ ] Results parsing
- [ ] Results panel UI
- [ ] Customer selection action

### Phase 3: Enhanced Features
- [ ] Customer detail view
- [ ] Recent searches history
- [ ] Quick actions (call, case, email)
- [ ] Auto-fill form data

### Phase 4: Polish
- [ ] Loading states
- [ ] Error messages
- [ ] Performance optimization
- [ ] Documentation

---

## Files to Create/Modify

### New Files
- `crm-tools-chrome-store/api/suitecrm-connection.js` - API connection manager
- `crm-tools-chrome-store/api/customer-service.js` - Customer API methods
- `crm-tools-chrome-store/ui/results-panel.js` - Search results UI
- `crm-tools-chrome-store/ui/settings-panel.js` - Credentials settings

### Modified Files
- `crm-tools-chrome-store/manifest.json` - Add host permissions if needed
- `crm-tools-chrome-store/crm-tools-widget.js` - Integrate new services
- `crm-tools-chrome-store/popup.html` - Add settings UI
- `crm-tools-chrome-store/popup.js` - Add settings logic

---

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Search by phone → get results
- [ ] Search by phone → no results
- [ ] Open customer from results
- [ ] Create new customer option
- [ ] Session expiry handling
- [ ] Network error handling
- [ ] Extension reload persistence

---

## Dependencies

### Required
- None (vanilla JS)

### Optional
- `md5.js` for password hashing (or use built-in)

---

## Next Steps

1. **Get API Credentials** - User needs to provide their CRM username/password
2. **Test API Access** - Verify the API endpoint is accessible
3. **Implement Core Classes** - Build the connection manager
4. **Build UI** - Create settings and results panels
5. **Test End-to-End** - Full workflow testing

---

**Created**: March 19, 2026  
**Status**: Ready for Implementation