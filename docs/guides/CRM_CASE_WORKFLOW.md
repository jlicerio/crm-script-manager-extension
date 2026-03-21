# SuiteCRM Customer and Case Workflow

This guide captures the standard customer-service workflow for SuiteCRM and how the CRM Tools Widget can accelerate your work.

## Scope

Use this workflow when you need to:
- Find or create a customer record
- Create a support case linked to that customer
- Document the interaction with quick tools and auto-filled fields
- Track call details with auto-learned field mappings

## Before You Start

- Open SuiteCRM in a Chromium-based browser (Chrome, Edge, Brave, etc.)
- Verify the CRM Tools Widget is installed (look for 🔧 icon in toolbar)
- The widget loads automatically on SuiteCRM pages
- No configuration needed - it works immediately

## 1. Find or Create the Customer

1. Navigate to the **Customers** module in SuiteCRM
2. Search for the customer by name, email, or phone
3. **If customer exists**: Open the customer record
4. **If customer doesn't exist**: Create a new customer record
5. Enter customer details:
   - Full name
   - Phone number
   - Email address  
   - Physical address
   - Company/Business name (if applicable)
   - Industry or product preference (if known)
6. Save the customer record

### Widget Tip
- Use **Copy URL** (🔗) to save a link to the customer record for follow-ups
- The floating 🔧 button has Copy URL ready anytime

## 2. Create/Open the Call Record

1. From the customer record, navigate to **Calls** or create a new call
2. Link the call to the correct customer
3. Enter call details:
   - **Call Type**: Inbound/Outbound
   - **Parent Type**: Link to customer or case
   - **Call Name/Subject**: Brief description of the call
   - **Phone**: Customer's phone number (auto-populates if linked to customer)
   - **Call Date**: Date of the call
   - **Call Reason**: What the customer is calling about (Technical Support, Billing, etc.)
   - **Call Category**: (Will auto-fill based on Call Reason - see Smart Automation below)
   - **Call Action**: (Will auto-fill based on Call Reason - see Smart Automation below)
   - **Notes**: Your detailed notes on the call

### 🤖 Smart Call Automation (NEW!)

The CRM Tools Widget learns from your selections:

**First Time:**
1. You select **Call Reason** = "Technical Support"
2. You manually select **Call Category** = "Troubleshooting"
3. You manually select **Call Action** = "Remote Assistance"
4. The widget *learns* this mapping

**Next Time:**
1. Select the same **Call Reason** = "Technical Support"
2. **Call Category** and **Call Action** auto-fill automatically!
3. Adjust if needed, or accept the suggested values
4. Save time on repetitive form-filling

No configuration needed - the widget learns from your daily workflow.

## 3. Document the Interaction

Before saving the call, add your notes:

**Recommended Note Format:**
```
[Date/Time] - [Agent Name]
---
Customer Issue: [Brief summary of problem]
Actions Taken: [What you did to help]
Next Steps: [Follow-ups needed]
Resolution Status: [Resolved/Pending]

Key Details:
- Product Model: [if applicable]
- Call Duration: [time on call]
- Customer Satisfaction: [satisfied/needs follow-up]
```

### Quick Tools While Documenting
- **Copy Date** (📅): Click to insert today's date in MM/DD/YYYY format into note fields
- **Copy URL** (🔗): Save the SuiteCRM page URL if you need to reference it later
- **Floating Widget**: Click 🔧 in bottom-right anytime to access these tools

## 4. Create a Case (If Needed)

For complex issues requiring follow-up:

1. From the call record, create a linked **Case**
2. Enter case details:
   - **Subject**: Clear description of the issue
   - **Description**: Detailed problem statement
   - **Type**: Bug, Feature Request, Support, etc.
   - **Status**: New/Open/In Progress
   - **Priority**: Based on severity
   - **Product**: Which product/model it affects
3. Link to the customer
4. Save the case

### Widget Tip
- **Copy URL** (🔗) to capture the case URL for customer follow-up communications

## 5. Recommended Working Order

1. **Search/Open Customer** → Use Customers module
2. **Create Call Record** → Link to customer
3. **Select Call Reason** → Automation learns your pattern
4. **Verify Auto-filled Fields** → Category and Action populate
5. **Add Call Notes** → Use **Copy Date** (📅) to timestamp entries
6. **Create Case (if needed)** → For longer-term tracking
7. **Save Everything** → Call, Case, and Customer records
8. **Copy URL** (🔗) → Save SuiteCRM links for follow-ups

## 6. Enhanced Search Features

When filling in dropdowns for models, products, or other fields:
- **Enhanced Model Search** activates automatically
- Type **any part** of the model name (e.g., "DLA20" finds "DLA-20LTD")
- Handles **dashes, spaces, and variants**
- Real-time filtering as you type
- Visual highlighting of matches

**No activation needed** - The widget automatically detects and enhances applicable dropdowns.

## 7. Field Mapping Learning

The widget remembers field combinations:
- **Call Reason** ↔ **Call Category** + **Call Action**
- After selecting a reason-category-action combo once, it auto-fills next time
- Each reason gets its own learned mapping
- localStorage persists mappings across browser sessions
- Mappings are **local to your browser** (never sent to servers)

**Example Mappings:**
- Technical Support → Troubleshooting, Remote Assist
- Billing Question → Finance, Account Review
- Feature Request → Product, Feature Planning

## 8. Verification Checklist

- [ ] Customer record exists and is complete
- [ ] Call is linked to correct customer
- [ ] Call Reason selected (triggers auto-fill)
- [ ] Call Category and Action auto-filled or manually selected
- [ ] Call date and time are accurate
- [ ] (Optional) Case created for follow-up items
- [ ] Notes are clear and detailed
- [ ] All records saved successfully

## 9. Using the Floating Widget Effectively

**To Access Tools:**
1. Look for the 🔧 button in **bottom-right corner** of SuiteCRM pages
2. Click to expand the tool menu
3. Select the tool you need:
   - 📅 **Copy Date** - Puts today's date on clipboard
   - 🔗 **Copy URL** - Puts page URL on clipboard
   - 🔍 **Enhanced Search** - Works automatically on model dropdowns

**Toast Feedback:**
- Each tool shows a quick notification (toast) confirming action
- "Date copied to clipboard" or "URL copied to clipboard"

**Keyboard Shortcuts:**
- Standard keyboard shortcuts work in all SuiteCRM forms
- Tab to navigate between fields
- Enter to submit forms

## 10. Troubleshooting Common Issues

### "Auto-fill didn't work"
- **First time**: Auto-fill only works *after* you've selected a reason and manually filled the dependent fields once
- **Second time+**: Auto-fill should work - refresh page if needed

### "Search enhancement missing on dropdown"
- The extension works on standard HTML `<select>` dropdowns
- Some custom SuiteCRM dropdowns might use different components
- Fallback: Use standard dropdown scrolling and manual selection

### "Widget button not appearing"
- Refresh the SuiteCRM page (F5)
- Wait 2-3 seconds for the page to fully load
- Check browser console (F12) for any errors

### "Mappings disappeared"
- localStorage might have been cleared
- Clear as you use the form again (the widget will learn new mappings)
- Chrome settings: Privacy → Cookies → Make sure SuiteCRM domain allows cookies

## 11. Best Practices

✅ **DO:**
- Use consistent Call Reason selections so the widget can learn patterns
- Timestamp notes with **Copy Date** (📅) for documentation
- Use **Copy URL** (🔗) for linking between cases
- Let the widget auto-fill fields when available
- Save frequently (especially between calls)

❌ **DON'T:**
- Force different Category/Action combinations than you usually use (confuses learning)
- Ignore auto-filled fields without reviewing them first
- Rely solely on auto-fill for critical fields (always verify)
- Clear browser localStorage without exporting important data first

## 12. Integration with Other CRM Modules

This workflow works across all SuiteCRM modules where the widget activates:
- **Customers** - Find/create customer records
- **Calls** - Log calls with smart field automation
- **Cases** - Create linked case records
- **Leads** - Convert leads with learned field patterns
- **Accounts** - Track business account interactions
- **Opportunities** - Sales-focused field learning

---

**Last Updated**: March 19, 2026  
**Extension Version**: 1.1 (Modular)  
**For Questions**: See [PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md) or [INSTALLATION.md](INSTALLATION.md)
