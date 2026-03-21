# SuiteCRM API Reference

## Based on Documentation & Local Source Code

### API Endpoint
```
https://crm.nexgenexpert.com/service/v4/rest.php
```

### Authentication

#### Login
```javascript
POST /service/v4/rest.php
Content-Type: application/json

{
  "method": "login",
  "input_type": "JSON",
  "response_type": "JSON",
  "rest_data": {
    "user_auth": {
      "user_name": "username",
      "password": "password"
    },
    "application": "custom_crm_extension"
  }
}
```

**Response:**
```json
{
  "id": "session_id_here",
  "user_id": "user_id_here",
  "name_value_list": {
    "user_id": "...",
    "user_name": "...",
    "user_language": "en_US",
    "user_default_team_id": "...",
    "user_is_admin": 0,
    "user_default_dateformat": "m/d/Y",
    "user_default_timeformat": "h:ia"
  }
}
```

### Core API Methods

#### get_server_info
```javascript
{
  "method": "get_server_info",
  "input_type": "JSON",
  "response_type": "JSON",
  "rest_data": {}
}
```

#### search_by_module
Search across modules for text.
```javascript
{
  "method": "search_by_module",
  "input_type": "JSON",
  "response_type": "JSON",
  "rest_data": {
    "session": "session_id",
    "search_string": "2085551234",
    "modules": ["NexGe_NG_Customers"],
    "offset": 0,
    "max_results": 20
  }
}
```

#### get_entry_list
Get records with SQL query filter.
```javascript
{
  "method": "get_entry_list",
  "input_type": "JSON",
  "response_type": "JSON",
  "rest_data": {
    "session": "session_id",
    "module_name": "NexGe_NG_Customers",
    "query": "phone_mobile = '2085551234' OR phone_home = '2085551234'",
    "order_by": "",
    "offset": 0,
    "select_fields": ["id", "name", "phone_mobile", "phone_home", "email1"],
    "link_name_to_fields_array": [],
    "max_results": 20,
    "deleted": false
  }
}
```

#### get_entry
Get single record by ID.
```javascript
{
  "method": "get_entry",
  "input_type": "JSON",
  "response_type": "JSON",
  "rest_data": {
    "session": "session_id",
    "module_name": "NexGe_NG_Customers",
    "id": "record_id_here",
    "select_fields": ["id", "name", "phone_mobile", "email1"]
  }
}
```

#### set_entry
Create or update a record.
```javascript
{
  "method": "set_entry",
  "input_type": "JSON",
  "response_type": "JSON",
  "rest_data": {
    "session": "session_id",
    "module_name": "NexGe_NG_Customers",
    "name_value_list": {
      "name": "John Doe",
      "phone_mobile": "2085551234",
      "email1": "john@example.com"
    }
  }
}
```

### Customer Module Fields (NexGe_NG_Customers)

Based on the CRM structure, common fields include:
- `id` - Record ID
- `name` - Full name
- `first_name` - First name
- `last_name` - Last name
- `phone_mobile` - Mobile phone
- `phone_home` - Home phone
- `phone_work` - Work phone
- `phone_other` - Other phone
- `email1` - Primary email
- `email2` - Secondary email
- `account_name` - Company/Account name
- `created_date` - Creation date
- `modified_date` - Last modified date

### Error Responses

#### Invalid Session
```json
{
  "name": "Invalid Session",
  "number": 11,
  "description": "Session ID not found"
}
```

#### Invalid Credentials
```json
{
  "name": "Invalid Login",
  "number": 10,
  "description": "Login attempt failed"
}
```

### Important Notes

1. **Password Encoding**: Some SuiteCRM installations require MD5 hash of password:
   ```javascript
   password: md5(plain_password)
   ```

2. **Session Expiry**: Sessions typically expire after 30-60 minutes of inactivity

3. **CORS Issues**: API calls from browser JavaScript may face CORS restrictions - consider using:
   - Chrome extension's background scripts
   - Server-side proxy
   - JSONP if available

4. **Module Name**: The customer module appears to be `NexGe_NG_Customers` (custom SuiteCRM module)

### Testing Checklist

- [ ] API endpoint is reachable
- [ ] Login with credentials works
- [ ] Session ID is returned
- [ ] search_by_module returns results
- [ ] get_entry_list with phone query works
- [ ] CORS headers are properly set (if needed)

---

**Created**: March 19, 2026