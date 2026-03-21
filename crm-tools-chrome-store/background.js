// CRM Tools Background Script - Handles API calls to SuiteCRM
// This runs in the extension's background context and bypasses CORS restrictions

(function() {
    'use strict';

    const API_BASE_URL = 'https://crm.nexgenexpert.com/service/v4/rest.php';
    
    // Session cache
    let sessionId = null;
    let sessionExpiry = null;
    const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

    // ─── Message Handler ────────────────────────────────────────────────────────
    // Listens for messages from content scripts (crm-tools-widget.js)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('[CRM Background] Received message:', request.action);
        
        switch (request.action) {
            case 'checkAPIAccess':
                handleCheckAPIAccess(sendResponse);
                return true; // Keep channel open for async response

            case 'apiLogin':
                handleAPILogin(request.credentials, sendResponse);
                return true;

            case 'searchCustomerByPhone':
                handleSearchCustomerByPhone(request.phone, sendResponse);
                return true;

            case 'getSessionInfo':
                handleGetSessionInfo(sendResponse);
                return true;

            case 'clearSession':
                handleClearSession(sendResponse);
                return true;

            case 'refreshBrightpattern':
                handleRefreshBrightpattern(sendResponse);
                return true;

            case 'callSuiteCRMApi':
                handleGenericAPICall(request.method, request.params, sendResponse);
                return true;

            case 'reExtractPhoneFromBP':
                handleReExtractPhoneFromBP(sendResponse);
                return true;

            case 'openAKBS':
                chrome.tabs.create({ url: request.url, active: true }, (tab) => {
                    // Wait for page to load, then send model search info
                    const onUpdated = (tabId, changeInfo) => {
                        if (tabId === tab.id && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(onUpdated);
                            chrome.tabs.sendMessage(tab.id, {
                                type: 'AKBS_MODEL_SEARCH',
                                model: request.model,
                                isKenwood: request.isKenwood
                            }).catch(err => {
                                console.error('[CRM Background] Failed to send AKBS search message:', err);
                            });
                        }
                    };
                    chrome.tabs.onUpdated.addListener(onUpdated);
                    sendResponse({ success: true, tabId: tab.id });
                });
                return true;

            case 'logAnalytics':
                // Send analytics to Google Form
                const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdCDrZT_u8zPRGt9sTZXmI2b9cKlnCVGB-CbqLC8remD3zRdw/formResponse';
                const formData = new URLSearchParams();
                formData.append('entry.409927787', request.timestamp || new Date().toISOString());
                formData.append('entry.383450844', request.userId || 'anonymous');
                formData.append('entry.2146895847', request.actionType || 'feature_used');
                formData.append('entry.1534049148', request.actionName || '');
                formData.append('entry.1880680461', request.pageUrl || '');
                formData.append('entry.1955587205', request.details || '');
                
                fetch(formUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                }).then(() => {
                    sendResponse({ success: true });
                }).catch(err => {
                    console.error('[CRM Background] Analytics error:', err);
                    sendResponse({ success: false, error: err.message });
                });
                return true;

            default:
                console.warn('[CRM Background] Unknown action:', request.action);
                sendResponse({ success: false, error: 'Unknown action' });
                return false;
        }
    });

    // ─── API Call Handlers ─────────────────────────────────────────────────────

    async function handleCheckAPIAccess(sendResponse) {
        try {
            const response = await callAPI('get_server_info', {});
            sendResponse(response);
        } catch (error) {
            sendResponse({ 
                success: false, 
                error: error.message,
                type: 'network'
            });
        }
    }

    async function handleAPILogin(credentials, sendResponse) {
        try {
            // First check API access
            const accessCheck = await callAPI('get_server_info', {});
            if (!accessCheck.success) {
                sendResponse({ success: false, error: 'API not accessible', detail: accessCheck.error });
                return;
            }

            // Attempt login
            const loginResult = await callAPI('login', {
                user_auth: {
                    user_name: credentials.username,
                    password: credentials.password,
                    version: '1'
                }
            });

            if (loginResult.success && loginResult.data && loginResult.data.id) {
                sessionId = loginResult.data.id;
                sessionExpiry = Date.now() + SESSION_DURATION;
                
                // Store session in extension storage
                await chrome.storage.local.set({
                    crmSessionId: sessionId,
                    crmSessionExpiry: sessionExpiry,
                    crmSessionTimestamp: Date.now()
                });

                sendResponse({ 
                    success: true, 
                    sessionId: sessionId,
                    expiresAt: sessionExpiry
                });
            } else {
                sendResponse({ 
                    success: false, 
                    error: 'Login failed',
                    detail: loginResult.error || 'Invalid credentials'
                });
            }
        } catch (error) {
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async function handleSearchCustomerByPhone(phone, sendResponse) {
        try {
            // Ensure we have a valid session
            await ensureValidSession();

            if (!sessionId) {
                sendResponse({ 
                    success: false, 
                    error: 'Not logged in',
                    requiresAuth: true
                });
                return;
            }

            // Search for contacts by phone using SuiteCRM REST API
            const searchResult = await callAPI('get_entry_list', {
                session: sessionId,
                module_name: 'Contacts',
                filter: [{
                    phone_home: { '$equals': phone },
                    phone_mobile: { '$equals': phone },
                    phone_work: { '$equals': phone },
                    phone_other: { '$equals': phone }
                }],
                order_by: 'date_modified DESC',
                offset: 0,
                select_fields: ['id', 'first_name', 'last_name', 'email1', 'phone_home', 'phone_mobile', 'phone_work'],
                max_results: 10
            });

            if (searchResult.success) {
                sendResponse({
                    success: true,
                    data: searchResult.data,
                    count: searchResult.count || 0
                });
            } else {
                sendResponse({
                    success: false,
                    error: searchResult.error || 'Search failed'
                });
            }
        } catch (error) {
            console.error('[CRM Background] Search error:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async function handleGetSessionInfo(sendResponse) {
        const stored = await chrome.storage.local.get(['crmSessionId', 'crmSessionExpiry']);
        
        if (stored.crmSessionId && stored.crmSessionExpiry && Date.now() < stored.crmSessionExpiry) {
            sessionId = stored.crmSessionId;
            sessionExpiry = stored.crmSessionExpiry;
            
            sendResponse({
                success: true,
                authenticated: true,
                expiresAt: sessionExpiry,
                timeRemaining: sessionExpiry - Date.now()
            });
        } else {
            sessionId = null;
            sessionExpiry = null;
            sendResponse({
                success: true,
                authenticated: false
            });
        }
    }

    async function handleClearSession(sendResponse) {
        sessionId = null;
        sessionExpiry = null;
        await chrome.storage.local.remove(['crmSessionId', 'crmSessionExpiry', 'crmSessionTimestamp']);
        sendResponse({ success: true });
    }

    async function handleRefreshBrightpattern(sendResponse) {
        try {
            // Find Brightpattern tab
            const tabs = await chrome.tabs.query({ url: '*://nexgen.brightpattern.com/agentdesktop/*' });
            if (tabs && tabs.length > 0) {
                // Refresh the Brightpattern tab
                await chrome.tabs.reload(tabs[0].id);
                sendResponse({ success: true, refreshed: true, tabId: tabs[0].id });
            } else {
                sendResponse({ success: false, refreshed: false, reason: 'No Brightpattern tab found' });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    async function handleReExtractPhoneFromBP(sendResponse) {
        try {
            // Find Brightpattern tab
            const tabs = await chrome.tabs.query({ url: '*://nexgen.brightpattern.com/agentdesktop/*' });
            if (!tabs || tabs.length === 0) {
                sendResponse({ success: false, reason: 'No Brightpattern tab found' });
                return;
            }

            const bpTabId = tabs[0].id;

            // Extract phone from BP tab using the specific div selector
            const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
            const script = `
                (function() {
                    // Try the specific div that contains the phone during calls
                    const phoneDiv = document.querySelector('div.b-flex-fit.M5AYWMB-Eb-h.ellipsis');
                    if (phoneDiv) {
                        const text = phoneDiv.textContent.trim();
                        const match = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                        if (match) {
                            return { phone: match[0], source: 'call-div' };
                        }
                    }
                    // Fallback: check SVG call indicator presence
                    const svgOnCall = document.querySelector('svg[data-testid="icCallMade"]') ||
                                      document.querySelector('svg[class*="icCallMade"]');
                    if (!svgOnCall) {
                        return { phone: null, onCall: false, reason: 'Not on a call' };
                    }
                    // Try other common phone selectors
                    const allText = document.body.innerText;
                    const phoneMatch = allText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    return { phone: phoneMatch ? phoneMatch[0] : null, onCall: true, source: 'body-scan' };
                })();
            `;

            const results = await chrome.tabs.executeScript(bpTabId, { code: script });
            
            if (results && results[0]) {
                const { phone, onCall, source } = results[0];
                
                if (phone) {
                    // Store the phone number with current timestamp
                    await chrome.storage.local.set({
                        crmPendingPhone: phone,
                        crmPendingPhoneSource: 'bp-re-extract',
                        crmPendingPhoneTimestamp: Date.now()
                    });
                    sendResponse({
                        success: true,
                        phone: phone,
                        source: source,
                        message: 'Phone re-extracted from Brightpattern'
                    });
                } else {
                    sendResponse({
                        success: false,
                        onCall: onCall !== false,
                        reason: onCall === false ? 'Not currently on a call' : 'No phone number found on page'
                    });
                }
            } else {
                sendResponse({ success: false, reason: 'Could not execute extraction script' });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    async function handleGenericAPICall(method, params, sendResponse) {
        try {
            const result = await callAPI(method, params);
            sendResponse(result);
        } catch (error) {
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // ─── Core API Function ─────────────────────────────────────────────────────

    async function callAPI(method, params) {
        try {
            const body = JSON.stringify({
                method: method,
                input_type: 'JSON',
                response_type: 'JSON',
                rest_data: params
            });

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    type: 'http'
                };
            }

            const text = await response.text();
            
            // Check if response is JSON
            if (!text.startsWith('{') && !text.startsWith('[')) {
                return {
                    success: false,
                    error: 'Non-JSON response received',
                    type: 'parse',
                    raw: text.substring(0, 200)
                };
            }

            const data = JSON.parse(text);

            // Check for SuiteCRM error responses
            if (data.name === 'SpaceError') {
                return {
                    success: false,
                    error: 'Authentication required or session expired',
                    type: 'auth'
                };
            }

            if (data.error) {
                return {
                    success: false,
                    error: data.error.message || data.error,
                    type: 'api'
                };
            }

            return {
                success: true,
                data: data
            };

        } catch (error) {
            console.error('[CRM Background] API call failed:', error);
            return {
                success: false,
                error: error.message,
                type: 'network'
            };
        }
    }

    // ─── Session Management ────────────────────────────────────────────────────

    async function ensureValidSession() {
        const stored = await chrome.storage.local.get(['crmSessionId', 'crmSessionExpiry']);
        
        if (stored.crmSessionId && stored.crmSessionExpiry) {
            if (Date.now() < stored.crmSessionExpiry) {
                sessionId = stored.crmSessionId;
                sessionExpiry = stored.crmSessionExpiry;
                return true;
            }
        }
        
        sessionId = null;
        sessionExpiry = null;
        return false;
    }

    // ─── Initialization ──────────────────────────────────────────────────────

    console.log('[CRM Background] Script loaded and listening for messages...');

})();
