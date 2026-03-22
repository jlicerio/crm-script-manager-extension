// CRM Tools Widget - User-facing utility panel
(function() {
    'use strict';

    // ─── Tool Registry ─────────────────────────────────────────────────────────
    // Add or remove one line here to add or remove a tool button from the widget.
    // Each entry must have a corresponding method name on CRMToolsWidget.
    const TOOL_REGISTRY = [
        { id: 'copy-date',       name: 'Copy Date',        icon: '📅', color: '#f39c12', methodName: 'copyCurrentDate',       domains: ['crm']         },
        { id: 'copy-url',        name: 'Copy URL',          icon: '🔗', color: '#e74c3c', methodName: 'copyCurrentURL',        domains: ['crm']         },
        { id: 'copy-phone',      name: 'Copy Phone',        icon: '📞', color: '#27ae60', methodName: 'copyPhoneNumber',      domains: ['brightpattern'] },
        { id: 'paste-phone',     name: 'Paste Phone',       icon: '📋', color: '#e67e22', methodName: 'pastePhoneNumber',     domains: ['crm']         },
        { id: 'search-customer', name: 'Search Customer',   icon: '👤', color: '#3498db', methodName: 'searchCustomerByPhone', domains: ['crm', 'brightpattern'] },
        { id: 'new-customer',    name: 'New Customer',      icon: '➕', color: '#2ecc71', methodName: 'createNewCustomer',      domains: ['crm', 'brightpattern'] },
        { id: 'enhance-models',  name: 'Enhanced Search',   icon: '🔍', color: '#8e44ad', methodName: 'enhanceModelSelectors', domains: ['crm']         },
        { id: 'kb-chat',         name: 'KB Chat',           icon: '💬', color: '#5D5CDE', methodName: 'openKBChat',           domains: ['crm']         },
        { id: 'check-tools',     name: 'Check Tools',      icon: '🔧', color: '#16a085', methodName: 'checkTools',          domains: ['any'],       devOnly: true },
        { id: 'scan-page',       name: 'Scan Page',         icon: '🔍', color: '#9b59b6', methodName: 'scanPage',            domains: ['any'],       devOnly: true },
        { id: 'extract-form',    name: 'Extract Form IDs',  icon: '📋', color: '#4285f4', methodName: 'extractFormEntryIds',  domains: ['any'],       devOnly: true },
        { id: 'flush-analytics', name: 'Flush Analytics',  icon: '📤', color: '#f39c12', methodName: 'flushAnalytics',      domains: ['any'],       devOnly: true },
        { id: 'pick-element',    name: 'Pick Element',      icon: '🎯', color: '#e74c3c', methodName: 'startElementPicker',   domains: ['any'],       devOnly: true },
        { id: 'dev-mode',        name: 'Dev Mode',          icon: '⚙️', color: '#e74c3c', methodName: 'toggleDevMode',       domains: ['any'],       devOnly: true },
        { id: 'demo-call',       name: 'Demo Call Toast',   icon: '📞', color: '#e91e63', methodName: 'demoCallStatus',      domains: ['any'],       devOnly: true },
        // To restore archived tools, add entries here and paste the methods back.
        // See Archive/crm-duplicate-search-feature.js for the removed tools.
    ];

    // CRM Tools Widget Class
    class CRMToolsWidget {
        constructor() {
            this.isOpen = false;
            this.tools = [];
            this.devMode = false; // Developer mode off by default
            this.callMappingStorageKey = 'crmCallReasonMappingsV1';
            this.isApplyingCallMapping = false;
            this.lastChosenReason = null;
            this.analyticsQueue = [];
            this.analyticsBatchSize = 10;
            this.loadTools();
            this.createWidget();
            
            // Load queued analytics from storage
            chrome.storage.local.get(['crmAnalyticsQueue'], (result) => {
                if (result.crmAnalyticsQueue) {
                    this.analyticsQueue = result.crmAnalyticsQueue;
                }
            });
            
            // Flush analytics on page unload
            window.addEventListener('beforeunload', () => {
                if (this.analyticsQueue.length > 0) {
                    this.flushAnalytics();
                }
            });
            
            // Log page view analytics
            this.logAnalytics('page_view', 'page_load', '', window.location.href);
            
            // Listen for messages from popup or background
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'DEV_MODE_TOGGLE') {
                    this.devMode = message.enabled;
                    this.loadTools();
                    this.toolsContainer.innerHTML = '';
                    this.createToolButtons();
                } else if (message.type === 'SCAN_PAGE') {
                    this.scanPage();
                } else if (message.type === 'AKBS_MODEL_SEARCH') {
                    this.handleAKBSModelSearch(message.model, message.isKenwood);
                } else if (message.type === 'SCRAPE_AKBS_ISSUES') {
                    // Scrape KB issues from AKBS product page
                    const issues = this.scrapeIssuesFromAKBSPage();
                    const instructionsLink = this.scrapeInstructionsLink();
                    sendResponse({ issues: issues, instructionsUrl: instructionsLink });
                    return true; // Keep channel open for async response
                } else if (message.type === 'SCRAPE_KB_ARTICLE') {
                    // Scrape article content from KB page
                    const content = this.scrapeArticleContent();
                    sendResponse({ content: content });
                    return true;
                }
            });
            
            // Load dev mode from storage if previously enabled
            chrome.storage.local.get(['devModeEnabled'], (result) => {
                if (result.devModeEnabled) {
                    this.devMode = true;
                    this.loadTools();
                    this.toolsContainer.innerHTML = '';
                    this.createToolButtons();
                }
            });
        }

        loadTools() {
            // Build tool list from the registry defined at the top of this file.
            // To add or remove a tool, edit TOOL_REGISTRY — no changes needed here.
            const currentUrl = window.location.href;
            const isBrightpattern = currentUrl.includes('brightpattern');
            const isCRM = currentUrl.includes('nexgenexpert.com');
            
            // Filter tools based on current domain and dev mode
            this.tools = TOOL_REGISTRY
                .filter(tool => {
                    // Filter out dev-only tools if dev mode is off
                    if (tool.devOnly && !this.devMode) return false;
                    // If no domains specified, show on all
                    if (!tool.domains) return true;
                    // Check if current domain matches allowed domains
                    return tool.domains.some(domain => {
                        if (domain === 'brightpattern') return isBrightpattern;
                        if (domain === 'crm') return isCRM;
                        if (domain === 'any') return true;
                        return currentUrl.includes(domain);
                    });
                })
                .map((t) => ({ ...t, action: this[t.methodName] }));

            // Auto-enhance model selectors when page loads
            setTimeout(() => {
                console.log('Auto-enhancing model selectors...');
                this.enhanceModelSelectors({ silent: true });
            }, 1000);
            
            // Also try again after a longer delay in case content loads later
            setTimeout(() => {
                console.log('Second attempt at enhancing model selectors...');
                this.enhanceModelSelectors({ silent: true });
            }, 3000);

            // Initialize learned call dependency automation once the CRM form is present
            setTimeout(() => {
                this.setupCallDependencyAutomation();
            }, 1200);

            setTimeout(() => {
                this.setupCallDependencyAutomation();
            }, 3200);
            
            // Check for pending phone number from Brightpattern to auto-fill
            setTimeout(() => {
                this.checkAndFillPendingPhone();
            }, 1500);
            
            // Check if we're on a ListView page for customer search
            setTimeout(() => {
                this.checkAndPerformCustomerSearch();
            }, 2000);
            
            // Setup auto-detection of phone number changes on Brightpattern
            if (window.location.hostname.includes('brightpattern')) {
                this.setupPhoneAutoExtract();
            }
            
            // Set up listener for call status from storage (works on both domains)
            this.setupCallStatusFromStorage();
        }

        createWidget() {
            // Call status toast - appears on LEFT side of main button like a popup
            // Static - only disappears when call ends or times out
            this.callStatus = document.createElement('div');
            this.callStatus.style.cssText = `
                position: fixed;
                right: 85px;
                bottom: 20px;
                background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                color: white;
                padding: 12px 18px;
                border-radius: 25px;
                font-size: 14px;
                font-family: Arial, sans-serif;
                display: none;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                animation: slideInFromLeft 0.3s ease;
                max-width: 200px;
            `;
            this.callStatus.innerHTML = '📞 <span id="crm-call-phone">No Active Call</span>';
            document.body.appendChild(this.callStatus);
            
            // Main floating button
            this.mainButton = document.createElement('div');
            this.mainButton.style.cssText = `
                position: fixed;
                right: 20px;
                bottom: 20px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                z-index: 10001;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
                font-family: Arial, sans-serif;
                user-select: none;
            `;
            this.mainButton.innerHTML = '🔧';
            this.mainButton.title = 'CRM Tools';

            // Tools container
            this.toolsContainer = document.createElement('div');
            this.toolsContainer.style.cssText = `
                position: fixed;
                right: 85px;
                bottom: 20px;
                display: none;
                flex-direction: column;
                gap: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;

            this.createToolButtons();
            this.setupEventListeners();

            document.body.appendChild(this.mainButton);
            document.body.appendChild(this.toolsContainer);
        }

        createToolButtons() {
            this.tools.forEach(tool => {
                const button = document.createElement('button');
                button.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 15px;
                    background: ${tool.color};
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    transition: all 0.2s ease;
                    font-family: Arial, sans-serif;
                    min-width: 140px;
                `;
                
                button.innerHTML = `
                    <span style="font-size: 16px;">${tool.icon}</span>
                    <span>${tool.name}</span>
                `;

                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Log analytics
                    this.logAnalytics('button_click', tool.id || tool.name, `Tool: ${tool.name}`);
                    
                    const maybePromise = tool.action.call(this);

                    if (maybePromise && typeof maybePromise.then === 'function') {
                        maybePromise
                            .then(() => this.showFeedback(button, tool.name))
                            .catch((err) => {
                                console.error(`${tool.name} failed:`, err);
                                this.showTemporaryMessage(`${tool.name} failed. See console.`);
                            });
                    } else {
                        this.showFeedback(button, tool.name);
                    }
                });

                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateX(-3px) scale(1.02)';
                    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                });

                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateX(0) scale(1)';
                    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                });

                this.toolsContainer.appendChild(button);
            });
        }

        setupEventListeners() {
            this.mainButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTools();
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.mainButton.contains(e.target) && !this.toolsContainer.contains(e.target)) {
                    this.closeTools();
                }
            });

            // Hover effects for main button
            this.mainButton.addEventListener('mouseenter', () => {
                this.mainButton.style.transform = 'scale(1.1)';
                this.mainButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
            });

            this.mainButton.addEventListener('mouseleave', () => {
                this.mainButton.style.transform = 'scale(1)';
                this.mainButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            });
        }

        toggleTools() {
            this.isOpen = !this.isOpen;
            this.toolsContainer.style.display = this.isOpen ? 'flex' : 'none';
            this.mainButton.innerHTML = this.isOpen ? '×' : '🔧';
            this.mainButton.style.background = this.isOpen 
                ? 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }

        closeTools() {
            this.isOpen = false;
            this.toolsContainer.style.display = 'none';
            this.mainButton.innerHTML = '🔧';
            this.mainButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }

        showFeedback(button, toolName) {
            const originalContent = button.innerHTML;
            button.innerHTML = `<span style="font-size: 16px;">✅</span><span>Done!</span>`;
            button.style.background = '#27ae60';
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = button.dataset.originalColor || '#3498db';
            }, 1500);
        }

        // Tool Functions
        copyCurrentDate() {
            const today = new Date();
            const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
            navigator.clipboard.writeText(formattedDate).then(() => {
                console.log('Date copied:', formattedDate);
            });
        }

        copyCurrentTime() {
            const time = new Date().toLocaleTimeString();
            navigator.clipboard.writeText(time).then(() => {
                console.log('Time copied:', time);
            });
        }

        quickSave() {
            // Look for common save buttons and click them
            const saveSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Save")',
                '.save-btn',
                '#save',
                '[data-action="save"]'
            ];

            for (const selector of saveSelectors) {
                const saveBtn = document.querySelector(selector);
                if (saveBtn && saveBtn.offsetParent !== null) { // visible element
                    saveBtn.click();
                    console.log('Quick save triggered');
                    return;
                }
            }
            
            // Fallback: try Ctrl+S
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 's',
                ctrlKey: true,
                bubbles: true
            }));
        }

        smartRefresh() {
            // Save form data before refresh if possible
            const forms = document.querySelectorAll('form');
            if (forms.length > 0) {
                const formData = {};
                forms.forEach((form, index) => {
                    const inputs = form.querySelectorAll('input, textarea, select');
                    inputs.forEach(input => {
                        if (input.name || input.id) {
                            formData[input.name || input.id] = input.value;
                        }
                    });
                });
                
                // Store in session storage
                sessionStorage.setItem('crmFormBackup', JSON.stringify(formData));
                console.log('Form data backed up before refresh');
            }
            
            location.reload();
        }

        copyCurrentURL() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                console.log('URL copied:', window.location.href);
            });
        }

        copyPhoneNumber() {
            // Find the phone number element on Brightpattern agent desktop
            // The element structure is: <span anonymous="0" style="margin-left:5px;">(208) 713-4321</span>
            let phoneNumber = '';
            
            // Try the specific span with anonymous="0" and phone-like content
            const spans = document.querySelectorAll('span[anonymous="0"]');
            for (const span of spans) {
                const text = span.textContent.trim();
                // Check if this span contains a phone number pattern
                if (text && /\(\d{3}\)\s*\d{3}-\d{4}/.test(text)) {
                    phoneNumber = text;
                    break;
                }
            }
            
            // Fallback: try to find any phone-like pattern in any span
            if (!phoneNumber) {
                const allSpans = document.querySelectorAll('span');
                for (const span of allSpans) {
                    const text = span.textContent.trim();
                    // Look for US phone number patterns
                    const phoneMatch = text.match(/\(\d{3}\)\s*\d{3}-\d{4}/) || text.match(/\d{3}-\d{3}-\d{4}/);
                    if (phoneMatch) {
                        phoneNumber = phoneMatch[0];
                        break;
                    }
                }
            }
            
            if (phoneNumber) {
                // Strip all symbols and spaces - keep only digits
                const digitsOnly = phoneNumber.replace(/\D/g, '');
                console.log('Phone extracted (digits only):', digitsOnly);
                
                // Store using chrome.storage.local (shared across all domains in extension)
                chrome.storage.local.set({
                    crmPendingPhone: digitsOnly,
                    crmPendingPhoneTimestamp: Date.now()
                }, () => {
                    // Verify storage was set
                    chrome.storage.local.get(['crmPendingPhone', 'crmPendingPhoneTimestamp'], (result) => {
                        console.log('[CRM Tools] Storage verified:', {
                            stored: result.crmPendingPhone,
                            timestamp: result.crmPendingPhoneTimestamp
                        });
                    });
                });
                
                // Also copy to clipboard
                navigator.clipboard.writeText(digitsOnly).then(() => {
                    console.log('Phone copied to clipboard:', digitsOnly);
                });
                
                // Notify user
                this.showTemporaryMessage(`Phone: ${digitsOnly} copied & ready to paste`);
            } else {
                console.log('No phone number found');
                this.showTemporaryMessage('No phone number found');
            }
        }
        
        pastePhoneNumber() {
            // Paste the stored phone number into a phone field on CRM
            chrome.storage.local.get(['crmPendingPhone', 'crmPendingPhoneTimestamp'], (result) => {
                const phone = result.crmPendingPhone;
                const timestamp = result.crmPendingPhoneTimestamp;
                
                // Debug: Log storage state
                console.log('[CRM Tools] Storage check:', {
                    phone: phone,
                    timestamp: timestamp,
                    age: timestamp ? Date.now() - timestamp : null,
                    now: Date.now()
                });
                
                if (!phone) {
                    // Only show detailed debug popup in dev mode
                    if (this.devMode) {
                        // Show detailed diagnostic with option to test storage
                        const diagDiv = document.createElement('div');
                        diagDiv.style.cssText = `
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: white;
                            padding: 25px;
                            border-radius: 12px;
                            box-shadow: 0 4px 30px rgba(0,0,0,0.3);
                            z-index: 10003;
                            max-width: 450px;
                            font-family: Arial, sans-serif;
                        `;
                        diagDiv.innerHTML = `
                            <h3 style="margin:0 0 15px 0;color:#e74c3c;">❌ No Phone in Storage</h3>
                            <div style="font-size:14px;color:#666;line-height:1.6;margin-bottom:15px;">
                                <b>Current storage state:</b><br>
                                • crmPendingPhone: <code>${result.crmPendingPhone || 'empty'}</code><br>
                                • crmPendingPhoneTimestamp: <code>${result.crmPendingPhoneTimestamp || 'empty'}</code><br>
                                • Current time: <code>${Date.now()}</code><br><br>
                                <b>Possible reasons:</b><br>
                                • Phone was never copied from Brightpattern<br>
                                • Phone expired (older than 5 minutes)<br>
                                • Extension was reloaded, clearing storage<br><br>
                                <b>To test cross-domain storage:</b><br>
                                1. Go to Brightpattern agent desktop<br>
                                2. Start a test call (phone should appear)<br>
                                3. Click "Copy Phone" button<br>
                                4. Come back to CRM and try again
                            </div>
                            <button id="test-storage-btn" style="
                                width:100%;
                                padding:12px;
                                background:#27ae60;
                                color:white;
                                border:none;
                                border-radius:6px;
                                cursor:pointer;
                                font-size:14px;
                                margin-bottom:8px;
                            ">🧪 Test Storage Write</button>
                            <button id="toggle-dev-btn" style="
                                width:100%;
                                padding:10px;
                                background:#9b59b6;
                                color:white;
                                border:none;
                                border-radius:6px;
                                cursor:pointer;
                                font-size:14px;
                                margin-bottom:8px;
                            ">🔧 Toggle Dev Mode OFF</button>
                            <button id="diag-close-btn" style="
                                width:100%;
                                padding:10px;
                                background:#95a5a6;
                                color:white;
                                border:none;
                                border-radius:6px;
                                cursor:pointer;
                                font-size:14px;
                            ">Close</button>
                        `;
                        document.body.appendChild(diagDiv);
                        
                        document.getElementById('diag-close-btn').addEventListener('click', () => diagDiv.remove());
                        document.getElementById('test-storage-btn').addEventListener('click', () => {
                            // Test writing to storage
                            const testPhone = '5551234567';
                            chrome.storage.local.set({
                                crmPendingPhone: testPhone,
                                crmPendingPhoneTimestamp: Date.now()
                            }, () => {
                                chrome.storage.local.get(['crmPendingPhone'], (r) => {
                                    if (r.crmPendingPhone === testPhone) {
                                        alert('✅ Storage test PASSED!\n\nPhone ' + testPhone + ' was stored and retrieved successfully.\nThis confirms cross-domain storage is working.');
                                    } else {
                                        alert('❌ Storage test FAILED!\n\nPhone was stored but could not be retrieved.');
                                    }
                                    diagDiv.remove();
                                });
                            });
                        });
                        document.getElementById('toggle-dev-btn').addEventListener('click', () => {
                            // Toggle dev mode off
                            this.devMode = false;
                            chrome.storage.local.set({ devModeEnabled: false });
                            alert('Dev Mode turned OFF. Debug popups will no longer appear.');
                            diagDiv.remove();
                        });
                    } else {
                        // Production mode: Try to re-extract phone from Brightpattern first (without refreshing)
                        chrome.runtime.sendMessage({ action: 'reExtractPhoneFromBP' }, (response) => {
                            if (response && response.success) {
                                // Phone was found and re-extracted - now try to paste it
                                this.showTemporaryMessage(`Phone re-extracted: ${response.phone}. Click Paste Phone again.`);
                                // Auto-retry paste after a brief delay
                                setTimeout(() => {
                                    chrome.storage.local.get(['crmPendingPhone'], (r) => {
                                        if (r.crmPendingPhone) {
                                            this.pastePhoneNumber();
                                        }
                                    });
                                }, 500);
                            } else {
                                // Could not re-extract - offer to refresh Brightpattern
                                const reason = response?.reason || 'Unknown';
                                const onCall = response?.onCall !== false;
                                const refresh = confirm(`No phone found${onCall ? ' - you appear to be on a call' : ''}.\n\nReason: ${reason}\n\nClick OK to refresh Brightpattern, or Cancel to continue manually.`);
                                if (refresh) {
                                    chrome.runtime.sendMessage({ action: 'refreshBrightpattern' }, (r) => {
                                        if (r && r.success) {
                                            this.showTemporaryMessage('Refreshing Brightpattern...');
                                        } else {
                                            this.showTemporaryMessage('No Brightpattern tab found. Please open it manually.');
                                        }
                                    });
                                } else {
                                    this.showTemporaryMessage('No phone found. Copy from Brightpattern when ready.');
                                }
                            }
                        });
                    }
                    return;
                }
                
                // Check if phone is still fresh (within 5 minutes)
                if (timestamp && (Date.now() - timestamp) > 300000) {
                    if (this.devMode) {
                        this.showDiagnosticMessage('⚠️ Phone expired',
                            'Phone number is older than 5 minutes.<br>' +
                            'Age: ' + Math.round((Date.now() - timestamp) / 1000) + ' seconds<br><br>' +
                            'Please copy a fresh phone number from Brightpattern.');
                    } else {
                        // Production mode: Try to re-extract phone from Brightpattern first (without refreshing)
                        chrome.runtime.sendMessage({ action: 'reExtractPhoneFromBP' }, (response) => {
                            if (response && response.success) {
                                this.showTemporaryMessage(`Phone re-extracted: ${response.phone}. Click Paste Phone again.`);
                                setTimeout(() => {
                                    chrome.storage.local.get(['crmPendingPhone'], (r) => {
                                        if (r.crmPendingPhone) {
                                            this.pastePhoneNumber();
                                        }
                                    });
                                }, 500);
                            } else {
                                const refresh = confirm('Phone expired. Refresh Brightpattern?\n\nClick OK to refresh, or Cancel to continue manually.');
                                if (refresh) {
                                    chrome.runtime.sendMessage({ action: 'refreshBrightpattern' }, (r) => {
                                        if (r && r.success) {
                                            this.showTemporaryMessage('Refreshing Brightpattern...');
                                        } else {
                                            this.showTemporaryMessage('No Brightpattern tab found.');
                                        }
                                    });
                                } else {
                                    this.showTemporaryMessage('Phone expired. Copy fresh phone when ready.');
                                }
                            }
                        });
                    }
                    return;
                }
                
                // Find phone field on CRM page - common selectors
                const phoneFieldSelectors = [
                    'input[name*="phone"]',
                    'input[name*="tel"]',
                    'input[name*="mobile"]',
                    'input[id*="phone"]',
                    'input[id*="tel"]',
                    'input[id*="mobile"]',
                    'input[placeholder*="phone"]',
                    'input[placeholder*="Phone"]',
                    'input[placeholder*="tel"]',
                    'input[placeholder*="Tel"]',
                    '#phone',
                    '#telephone',
                    '#mobile',
                    'textarea[name*="phone"]',
                    'textarea[name*="tel"]'
                ];
                
                let phoneField = null;
                for (const selector of phoneFieldSelectors) {
                    const field = document.querySelector(selector);
                    if (field && field.offsetParent !== null) { // visible
                        phoneField = field;
                        break;
                    }
                }
                
                if (phoneField) {
                    phoneField.focus();
                    phoneField.value = phone;
                    phoneField.dispatchEvent(new Event('input', { bubbles: true }));
                    phoneField.dispatchEvent(new Event('change', { bubbles: true }));
                    phoneField.blur();
                    console.log('Phone pasted:', phone);
                    this.showTemporaryMessage(`Phone pasted: ${phone}`);
                } else {
                    // Fallback: try to click first focusable input
                    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
                    for (const input of inputs) {
                        if (input.offsetParent !== null && !input.disabled) {
                            input.focus();
                            input.value = phone;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            input.blur();
                            console.log('Phone pasted to:', input.name || input.id || input.placeholder);
                            this.showTemporaryMessage(`Phone pasted to field`);
                            return;
                        }
                    }
                    console.log('No phone field found');
                    this.showTemporaryMessage('No phone field found on page');
                }
            });
        }
        
        checkTools() {
            // Diagnostic tool to check extension status
            const checks = [];
            let passed = 0;
            let failed = 0;
            
            // Check 1: Page URL
            const currentUrl = window.location.href;
            const isBrightpattern = currentUrl.includes('brightpattern');
            const isCRM = currentUrl.includes('nexgenexpert.com');
            checks.push({
                name: 'Page Detection',
                status: isBrightpattern || isCRM ? 'pass' : 'warn',
                detail: isBrightpattern ? 'Brightpattern' : (isCRM ? 'CRM' : 'Unknown')
            });
            if (isBrightpattern || isCRM) passed++; else failed++;
            
            // Check 2: Phone storage
            chrome.storage.local.get(['crmPendingPhone', 'crmPendingPhoneTimestamp'], (result) => {
                const hasPhone = !!result.crmPendingPhone;
                const age = result.crmPendingPhoneTimestamp ? Date.now() - result.crmPendingPhoneTimestamp : null;
                const ageStr = age ? ` (${Math.round(age/1000)}s ago)` : '';
                checks.push({
                    name: 'Phone Storage',
                    status: hasPhone ? 'pass' : 'warn',
                    detail: hasPhone ? `Has ${result.crmPendingPhone}${ageStr}` : 'Empty'
                });
                if (hasPhone) passed++; else failed++;
                
                // Check 3: Search storage
                chrome.storage.local.get(['crmSearchPhone', 'crmSearchPhoneTimestamp'], (searchResult) => {
                    const hasSearch = !!searchResult.crmSearchPhone;
                    checks.push({
                        name: 'Search Storage',
                        status: hasSearch ? 'pass' : 'warn',
                        detail: hasSearch ? `Has ${searchResult.crmSearchPhone}` : 'Empty'
                    });
                    if (hasSearch) passed++; else failed++;
                    
                    // Check 4: DOM elements
                    const phoneSpans = document.querySelectorAll('span[anonymous="0"]').length;
                    checks.push({
                        name: 'Phone Spans',
                        status: phoneSpans > 0 ? 'pass' : 'warn',
                        detail: `Found ${phoneSpans} phone element(s)`
                    });
                    if (phoneSpans > 0) passed++; else failed++;
                    
                    // Check 5: Widget state
                    checks.push({
                        name: 'Widget State',
                        status: 'pass',
                        detail: `Open: ${this.isOpen}, Tools: ${this.tools.length}`
                    });
                    passed++;
                    
                    // Check 6: Cross-Domain Storage
                    const hasStorage = !!result.crmPendingPhone;
                    const age = result.crmPendingPhoneTimestamp ? Date.now() - result.crmPendingPhoneTimestamp : null;
                    const ageStr = age ? ` (${Math.round(age/1000)}s old)` : '';
                    checks.push({
                        name: 'Cross-Domain Storage',
                        status: hasStorage ? 'pass' : 'warn',
                        detail: hasStorage ? `Working - ${result.crmPendingPhone}${ageStr}` : 'Empty - copy from Brightpattern first'
                    });
                    if (hasStorage) passed++; else failed++;
                    
                    // Check 7: API Access (via background script)
                    this.checkAPIAccess().then((apiResult) => {
                        checks.push({
                            name: 'API Access',
                            status: apiResult.status,
                            detail: apiResult.detail
                        });
                        if (apiResult.status === 'pass') passed++; else failed++;
                        
                        // Create diagnostic panel
                        const diagPanel = document.createElement('div');
                        diagPanel.style.cssText = `
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: white;
                            padding: 20px;
                            border-radius: 12px;
                            box-shadow: 0 4px 30px rgba(0,0,0,0.3);
                            z-index: 10002;
                            min-width: 350px;
                            max-width: 450px;
                            font-family: Arial, sans-serif;
                        `;
                        diagPanel.innerHTML = `
                            <h3 style="margin:0 0 15px 0;color:#333;">🔧 Tool Diagnostics</h3>
                            <div style="margin-bottom:12px;font-size:14px;color:#666;">Results: ${passed} passed, ${failed} failed</div>
                            ${checks.map(c => {
                                const color = c.status === 'pass' ? '#27ae60' : (c.status === 'warn' ? '#f39c12' : '#e74c3c');
                                return `<div style="margin:6px 0;padding:10px;background:#f8f9fa;border-radius:4px;border-left:3px solid ${color};">
                                    <strong>${c.status === 'pass' ? '✅' : '⚠️'} ${c.name}</strong><br>
                                    <span style="font-size:12px;color:#666;">${c.detail}</span>
                                </div>`;
                            }).join('')}
                            <button onclick="this.parentElement.remove()" style="margin-top:15px;width:100%;padding:10px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer;">Close</button>
                        `;
                        document.body.appendChild(diagPanel);
                        
                        let msg = `🔧 Diagnostics (${passed}/${passed+failed} passed):\n`;
                        checks.forEach(c => {
                            const icon = c.status === 'pass' ? '✅' : (c.status === 'warn' ? '⚠️' : '❌');
                            msg += `${icon} ${c.name}: ${c.detail}\n`;
                        });
                        console.log(msg);
                        this.showTemporaryMessage(`Diagnostics: ${passed}/${passed+failed} passed`);
                    });
                });
            });
        }
        
        async checkAPIAccess() {
            // Use background script to check API access (bypasses CORS)
            return new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { action: 'checkAPIAccess' },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            resolve({
                                name: 'API Access',
                                status: 'fail',
                                detail: 'Background script error: ' + chrome.runtime.lastError.message
                            });
                            return;
                        }

                        if (response && response.success) {
                            resolve({
                                name: 'API Access',
                                status: 'pass',
                                detail: `SuiteCRM v${response.data?.version || 'unknown'}`
                            });
                        } else {
                            resolve({
                                name: 'API Access',
                                status: 'fail',
                                detail: response?.error || 'API Error'
                            });
                        }
                    }
                );
            });
        }
        
        checkAndFillPendingPhone() {
            // Check for pending phone number from Brightpattern using chrome.storage.local
            chrome.storage.local.get(['crmPendingPhone', 'crmPendingPhoneTimestamp'], (result) => {
                const pendingPhone = result.crmPendingPhone;
                const timestamp = result.crmPendingPhoneTimestamp;
                
                if (!pendingPhone || !timestamp) {
                    return;
                }
                
                // Check if phone is still fresh (within 5 minutes - same as search)
                const age = Date.now() - timestamp;
                if (age > 300000) {
                    console.log('Pending phone expired');
                    chrome.storage.local.remove(['crmPendingPhone', 'crmPendingPhoneTimestamp']);
                    return;
                }
                
                // Find phone field on CRM page - specific selectors for SuiteCRM
                const phoneFieldSelectors = [
                    'input#phone_basic',          // SuiteCRM customer search
                    'input[name="phone_mobile"]', // Common CRM phone field
                    'input[name*="phone"]',
                    'input[name*="tel"]',
                    'input[name*="mobile"]',
                    'input[id*="phone"]',
                    'input[id*="tel"]',
                    'input[id*="mobile"]',
                    'input[placeholder*="phone"]',
                    'input[placeholder*="Phone"]',
                    'input[placeholder*="tel"]',
                    '#phone',
                    '#telephone',
                    '#mobile'
                ];
                
                let phoneField = null;
                for (const selector of phoneFieldSelectors) {
                    phoneField = document.querySelector(selector);
                    if (phoneField && phoneField.offsetParent !== null) { // visible
                        console.log('[CRM Tools] Found phone field with selector:', selector);
                        break;
                    }
                    phoneField = null;
                }
                
                if (phoneField) {
                    // Check if phone field already has a value - don't override existing data
                    const existingValue = phoneField.value.trim();
                    if (existingValue && existingValue.length > 0) {
                        console.log('[CRM Tools] Phone field already has value, skipping auto-fill:', existingValue);
                        return;
                    }
                    
                    phoneField.value = pendingPhone;
                    phoneField.dispatchEvent(new Event('input', { bubbles: true }));
                    phoneField.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('Phone auto-filled:', pendingPhone);
                    this.showTemporaryMessage(`Phone auto-filled: ${pendingPhone}`);
                    
                    // Keep the pending phone - don't clear it (available for search too)
                    // Only clear if user explicitly copies new phone
                } else {
                    console.log('Phone field not found on this page, will retry...');
                    // Retry after 2 seconds if not found
                    setTimeout(() => {
                        this.checkAndFillPendingPhone();
                    }, 2000);
                }
            });
        }
        
        checkAndPerformCustomerSearch() {
            // Check if we're on the ListView page with pending search
            if (!window.location.href.includes('NexGe_NG_Customers')) {
                return;
            }
            
            // Check both crmPendingPhone (auto-detected from Brightpattern) and crmSearchPhone
            chrome.storage.local.get(['crmPendingPhone', 'crmPendingPhoneTimestamp', 'crmSearchPhone', 'crmSearchPhoneTimestamp'], (result) => {
                // Prefer the more recent phone
                let searchPhone = result.crmSearchPhone;
                let timestamp = result.crmSearchPhoneTimestamp;
                
                // If no search phone, check pending phone
                if (!searchPhone && result.crmPendingPhone) {
                    searchPhone = result.crmPendingPhone;
                    timestamp = result.crmPendingPhoneTimestamp;
                }
                
                if (!searchPhone || !timestamp) {
                    return;
                }
                
                // Check if phone is still fresh (within 5 minutes)
                if (Date.now() - timestamp > 300000) {
                    chrome.storage.local.remove(['crmSearchPhone', 'crmSearchPhoneTimestamp']);
                    return;
                }
                
                console.log('[CRM Tools] Auto-searching for phone:', searchPhone);
                
                // Find the phone_basic input field
                let phoneInput = document.querySelector('input#phone_basic');
                
                // If phone_basic not found, try to open the search filter first
                if (!phoneInput) {
                    console.log('[CRM Tools] Opening search filter...');
                    // Try clicking the basic search tab or search button
                    const basicSearchTab = document.querySelector('a[data-tab="basic_search"]') || 
                                           document.querySelector('button[data-target="#basic_search"]') ||
                                           document.querySelector('a[href*="basic_search"]');
                    if (basicSearchTab) {
                        basicSearchTab.click();
                    } else {
                        // Try any button that might open search
                        const searchToggle = document.querySelector('[data-toggle*="search"]') ||
                                           document.querySelector('.search-wrapper > button') ||
                                           document.querySelector('#search_button');
                        if (searchToggle) {
                            searchToggle.click();
                        }
                    }
                    
                    // Wait for dialog to open then fill
                    setTimeout(() => {
                        phoneInput = document.querySelector('input#phone_basic');
                        if (phoneInput) {
                            phoneInput.value = searchPhone;
                            phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                            phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
                            
                            // Auto-submit the search
                            setTimeout(() => {
                                const searchBtn = document.querySelector('input#search_form_submit');
                                if (searchBtn) {
                                    searchBtn.click();
                                    // Clear storage AFTER successful search trigger
                                    chrome.storage.local.remove(['crmPendingPhone', 'crmPendingPhoneTimestamp', 'crmSearchPhone', 'crmSearchPhoneTimestamp']);
                                    this.showTemporaryMessage(`Searching for: ${searchPhone}`);
                                }
                            }, 300);
                        }
                    }, 500);
                } else {
                    // Phone input found, fill it
                    phoneInput.value = searchPhone;
                    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                    phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Auto-submit the search
                    setTimeout(() => {
                        const searchBtn = document.querySelector('input#search_form_submit');
                        if (searchBtn) {
                            searchBtn.click();
                            // Clear storage AFTER successful search trigger
                            chrome.storage.local.remove(['crmPendingPhone', 'crmPendingPhoneTimestamp', 'crmSearchPhone', 'crmSearchPhoneTimestamp']);
                            this.showTemporaryMessage(`Searching for: ${searchPhone}`);
                        }
                    }, 300);
                }
                
                // Keep crmPendingPhone for Paste Phone button
                chrome.storage.local.remove(['crmSearchPhone', 'crmSearchPhoneTimestamp']);
            });
        }
        
        setupPhoneAutoExtract() {
            // Watch for phone number changes on Brightpattern
            let lastPhone = '';
            let observer = null;
            
            const extractPhone = () => {
                const spans = document.querySelectorAll('span[anonymous="0"]');
                for (const span of spans) {
                    const text = span.textContent.trim();
                    if (text && /\(\d{3}\)\s*\d{3}-\d{4}/.test(text)) {
                        const digitsOnly = text.replace(/\D/g, '');
                        if (digitsOnly !== lastPhone && digitsOnly.length === 10) {
                            lastPhone = digitsOnly;
                            console.log('Auto-detected new phone:', digitsOnly);
                            
                            // Store in chrome.storage.local
                            chrome.storage.local.set({
                                crmPendingPhone: digitsOnly,
                                crmPendingPhoneTimestamp: Date.now()
                            });
                            
                            // Update call status indicator
                            this.updateCallStatus(digitsOnly, true);
                            
                            // Stop blinking after 5 seconds
                            setTimeout(() => {
                                this.updateCallStatus(digitsOnly, false);
                            }, 5000);
                            
                            // Also copy to clipboard
                            navigator.clipboard.writeText(digitsOnly);
                            
                            this.showTemporaryMessage(`Phone: ${digitsOnly} ready`);
                        }
                        break;
                    }
                }
            };
            
            // Initial extract
            setTimeout(extractPhone, 1000);
            
            // Set up MutationObserver to detect DOM changes (new calls)
            observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        setTimeout(extractPhone, 100);
                        break;
                    }
                }
            });
            
            // Observe the body for changes
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
            
            console.log('Phone auto-extract enabled on Brightpattern');
        }

        searchCustomerByPhone() {
            // Check if we're already on the CRM customers list page
            const isOnCustomersPage = window.location.href.includes('NexGe_NG_Customers');
            
            if (isOnCustomersPage) {
                // Already on the page - just trigger the auto-search
                console.log('[CRM Tools] Already on CRM page, triggering search');
                this.checkAndPerformCustomerSearch();
            } else {
                // Go to CRM search page - the auto-detected phone will be used
                const searchUrl = `https://crm.nexgenexpert.com/index.php?action=index&module=NexGe_NG_Customers`;
                
                console.log('[CRM Tools] Opening CRM search in new tab');
                
                // Open in new tab
                window.open(searchUrl, '_blank');
            }
        }
        
        createNewCustomer() {
            // Open CRM new customer form in new tab
            // The auto-detected phone will be filled by checkAndFillPendingPhone
            const newCustomerUrl = `https://crm.nexgenexpert.com/index.php?action=EditView&module=NexGe_NG_Customers`;
            
            console.log('[CRM Tools] Opening new customer form');
            
            // Open in new tab
            window.open(newCustomerUrl, '_blank');
        }

        getFieldValueByCandidates(candidates) {
            for (const key of candidates) {
                const byId = document.getElementById(key);
                if (byId && String(byId.value || '').trim()) {
                    return String(byId.value || '').trim();
                }

                const byName = document.querySelector(`[name="${key}"]`);
                if (byName && String(byName.value || '').trim()) {
                    return String(byName.value || '').trim();
                }
            }
            return '';
        }

        normalizePhone(value) {
            return String(value || '').replace(/\D/g, '');
        }

        normalizeEmail(value) {
            return String(value || '').trim().toLowerCase();
        }

        highlightRequiredFields() {
            // Find and highlight required fields
            const requiredSelectors = [
                'input[required]',
                'textarea[required]',
                'select[required]',
                '.required input',
                '.required textarea',
                '.required select',
                '[data-required="true"]'
            ];

            let highlightedCount = 0;
            requiredSelectors.forEach(selector => {
                const fields = document.querySelectorAll(selector);
                fields.forEach(field => {
                    if (!field.value.trim()) {
                        field.style.border = '3px solid #e74c3c';
                        field.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.5)';
                        highlightedCount++;
                        
                        // Remove highlight after 5 seconds
                        setTimeout(() => {
                            field.style.border = '';
                            field.style.boxShadow = '';
                        }, 5000);
                    }
                });
            });

            console.log(`Highlighted ${highlightedCount} required fields`);
            
            if (highlightedCount === 0) {
                // Show a temporary message
                this.showTemporaryMessage('All required fields are filled! ✅');
            }
        }

        showTemporaryMessage(message) {
            const msgDiv = document.createElement('div');
            msgDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10001;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideInFromTop 0.3s ease;
            `;
            msgDiv.textContent = message;
            
            document.body.appendChild(msgDiv);
            
            setTimeout(() => {
                msgDiv.style.animation = 'slideOutToTop 0.3s ease';
                setTimeout(() => msgDiv.remove(), 300);
            }, 3000);
        }

        logAnalytics(actionType, actionName, details, pageUrl) {
            // Add to queue
            this.analyticsQueue.push({
                timestamp: new Date().toISOString(),
                actionType: actionType,
                actionName: actionName,
                pageUrl: pageUrl || window.location.href,
                details: details || ''
            });
            
            // Save to storage for persistence
            chrome.storage.local.set({ crmAnalyticsQueue: this.analyticsQueue });
            
            // If queue reaches batch size, send all
            if (this.analyticsQueue.length >= this.analyticsBatchSize) {
                this.flushAnalytics();
            }
        }
        
        flushAnalytics() {
            if (this.analyticsQueue.length === 0) {
                this.showTemporaryMessage('No analytics to flush');
                return;
            }
            
            const queueToSend = [...this.analyticsQueue];
            this.analyticsQueue = [];
            chrome.storage.local.set({ crmAnalyticsQueue: [] });
            
            // Send each event
            queueToSend.forEach(event => {
                chrome.runtime.sendMessage({
                    action: 'logAnalytics',
                    timestamp: event.timestamp,
                    actionType: event.actionType,
                    actionName: event.actionName,
                    pageUrl: event.pageUrl,
                    details: event.details
                });
            });
            
            this.showTemporaryMessage(`Flushed ${queueToSend.length} analytics events`);
        }

        updateCallStatus(phone, blink = false) {
            // Update the call status indicator with the current phone
            if (phone && this.callStatus) {
                // Format phone as (XXX) XXX-XXXX
                const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                this.callStatus.style.display = 'block';
                this.callStatus.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
                this.callStatus.innerHTML = `📞 <span id="crm-call-phone">${formatted}</span>`;
                
                // Add or remove blink class
                if (blink) {
                    this.callStatus.classList.add('call-blinking');
                } else {
                    this.callStatus.classList.remove('call-blinking');
                }
                
                console.log('[CRM Tools] Call status updated:', formatted);
            }
        }

        clearCallStatus() {
            // Clear the call status indicator
            if (this.callStatus) {
                this.callStatus.style.display = 'none';
                this.callStatus.innerHTML = '📞 <span id="crm-call-phone">No Active Call</span>';
            }
        }

        setupCallStatusFromStorage() {
            // Check for existing phone in storage and listen for updates
            // This works on both Brightpattern and CRM domains
            
            const updateFromStorage = () => {
                chrome.storage.local.get(['crmPendingPhone', 'crmPendingPhoneTimestamp'], (result) => {
                    if (result.crmPendingPhone) {
                        const timestamp = result.crmPendingPhoneTimestamp || 0;
                        const age = Date.now() - timestamp;
                        // Only show if phone is less than 5 minutes old (5 min = 300000ms)
                        if (age < 300000) {
                            this.updateCallStatus(result.crmPendingPhone);
                            // Also trigger phone fill on CRM pages
                            this.checkAndFillPendingPhone();
                        } else {
                            this.clearCallStatus();
                        }
                    } else {
                        this.clearCallStatus();
                    }
                });
            };
            
            // Initial check
            updateFromStorage();
            
            // Listen for changes to crmPendingPhone
            chrome.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === 'local' && changes.crmPendingPhone) {
                    const newPhone = changes.crmPendingPhone.newValue;
                    if (newPhone) {
                        this.updateCallStatus(newPhone, true);
                        // Also trigger phone fill
                        this.checkAndFillPendingPhone();
                        // Stop blinking after 5 seconds
                        setTimeout(() => {
                            this.updateCallStatus(newPhone, false);
                        }, 5000);
                    } else {
                        this.clearCallStatus();
                    }
                }
            });
        }

        hideTemporaryMessage(msgDiv) {
            
            document.body.appendChild(msgDiv);
            
            setTimeout(() => {
                msgDiv.style.animation = 'slideOutToTop 0.3s ease';
                setTimeout(() => msgDiv.remove(), 300);
            }, 3000);
        }

        toggleDevMode() {
            // Toggle developer mode on/off
            this.devMode = !this.devMode;
            
            // Reload tools to show/hide dev-only tools
            this.loadTools();
            
            // Clear and rebuild the tool buttons
            this.toolsContainer.innerHTML = '';
            this.createToolButtons();
            
            if (this.devMode) {
                this.showTemporaryMessage('Dev Mode: ON - Developer tools visible');
            } else {
                this.showTemporaryMessage('Dev Mode: OFF');
            }
        }

        demoCallStatus() {
            // Demo the call status toast - simulates an incoming call
            const demoPhones = [
                '3125551234',
                '7735559876',
                '8475554321',
                '3125558769'
            ];
            const randomPhone = demoPhones[Math.floor(Math.random() * demoPhones.length)];
            
            // Store in chrome.storage.local so Search/New Customer tools can use it
            chrome.storage.local.set({
                crmPendingPhone: randomPhone,
                crmPendingPhoneTimestamp: Date.now()
            });
            
            // Show the toast with blinking animation for 5 seconds
            this.updateCallStatus(randomPhone, true); // true = show blinking
            
            // Show confirmation message
            this.showTemporaryMessage(`Demo call ready: ${randomPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')} | Try Search/New Customer`);
        }

        showDiagnosticMessage(title, message) {
            // Create a modal dialog for detailed diagnostic information
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10002;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                font-family: Arial, sans-serif;
            `;
            
            dialog.innerHTML = `
                <h3 style="margin:0 0 15px 0;color:#333;">${title}</h3>
                <div style="font-size:14px;color:#666;line-height:1.6;margin-bottom:15px;">${message}</div>
                <button class="diag-close-btn" style="
                    width:100%;
                    padding:10px;
                    background:#667eea;
                    color:white;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                    font-size:14px;
                ">Close</button>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // Close on button click or overlay click
            dialog.querySelector('.diag-close-btn').addEventListener('click', () => overlay.remove());
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
        }

        scanPage() {
            // Scan the page and show available data elements - useful for discovering new data to extract
            const results = {
                url: window.location.href,
                title: document.title,
                timestamp: new Date().toISOString(),
                elements: {
                    spans: document.querySelectorAll('span').length,
                    divs: document.querySelectorAll('div').length,
                    inputs: document.querySelectorAll('input').length,
                    textareas: document.querySelectorAll('textarea').length,
                    buttons: document.querySelectorAll('button').length,
                    links: document.querySelectorAll('a').length,
                    tables: document.querySelectorAll('table').length,
                    iframes: document.querySelectorAll('iframe').length
                },
                phoneNumbers: [],
                emails: [],
                inputs: [],
                searchBars: [],
                fillableFields: []
            };
            
            // Find phone numbers and emails
            const phoneRegex = /\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10,11}/g;
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent.trim();
                if (text && text.length < 200) {
                    const phones = text.match(phoneRegex);
                    if (phones) {
                        results.phoneNumbers.push(...phones);
                    }
                    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
                    const emails = text.match(emailRegex);
                    if (emails) {
                        results.emails.push(...emails);
                    }
                }
            }
            
            // Scan all inputs and categorize them
            const allInputs = document.querySelectorAll('input, textarea, select');
            allInputs.forEach(el => {
                const info = {
                    tag: el.tagName.toLowerCase(),
                    type: el.type || 'text',
                    name: el.name || '',
                    id: el.id || '',
                    placeholder: el.placeholder || '',
                    value: el.value || '',
                    visible: el.offsetParent !== null,
                    disabled: el.disabled
                };
                
                // Check if searchable
                if (info.type === 'search' || info.name.toLowerCase().includes('search')) {
                    results.searchBars.push(info);
                }
                
                // Check if fillable
                if (info.visible && !info.disabled && !['hidden', 'submit', 'button', 'reset', 'file', 'image'].includes(info.type)) {
                    results.fillableFields.push(info);
                }
                
                results.inputs.push(info);
            });
            
            console.log('[CRM Tools] Page Scan:', results);
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: white; padding: 20px; border-radius: 12px;
                box-shadow: 0 4px 30px rgba(0,0,0,0.3); z-index: 10003;
                max-width: 600px; max-height: 80vh; overflow-y: auto; font-family: Arial, sans-serif;
            `;
            
            const inputList = results.inputs.slice(0, 20).map(i => 
                `• ${i.tag}[${i.type}] name="${i.name}" id="${i.id}" placeholder="${i.placeholder}" ${i.visible ? '✓' : '✗'}`
            ).join('<br>');
            
            const fillableList = results.fillableFields.slice(0, 15).map(i => 
                `• ${i.tag}[${i.type}] name="${i.name}" id="${i.id}" placeholder="${i.placeholder}"`
            ).join('<br>');
            
            const searchList = results.searchBars.length ? results.searchBars.map(i => 
                `• ${i.tag}[${i.type}] name="${i.name}" id="${i.id}"`
            ).join('<br>') : 'None found';
            
            modal.innerHTML = `
                <h3 style="margin:0 0 15px 0;color:#333;">🔍 Page Scan Results</h3>
                <div style="font-size:12px;color:#666;margin-bottom:10px;">
                    <b>URL:</b> ${results.url}<br>
                    <b>Title:</b> ${results.title}
                </div>
                
                <h4 style="margin:10px 0 5px 0;color:#555;">📊 Element Counts</h4>
                <div style="font-size:12px;color:#666;margin-bottom:10px;">
                    Spans:${results.elements.spans} Divs:${results.elements.divs} Inputs:${results.elements.inputs}<br>
                    Textareas:${results.elements.textareas} Buttons:${results.elements.buttons}<br>
                    Links:${results.elements.links} Tables:${results.elements.tables} Iframes:${results.elements.iframes}
                </div>
                
                <h4 style="margin:10px 0 5px 0;color:#555;">📞 Found Data</h4>
                <div style="font-size:12px;color:#666;">
                    <b>Phones (${results.phoneNumbers.length}):</b> ${results.phoneNumbers.length ? results.phoneNumbers.slice(0, 5).join(', ') : 'None'}<br>
                    <b>Emails (${results.emails.length}):</b> ${results.emails.length ? results.emails.slice(0, 5).join(', ') : 'None'}
                </div>
                
                <h4 style="margin:10px 0 5px 0;color:#555;">🔎 Search Bars (${results.searchBars.length})</h4>
                <div style="font-size:11px;color:#666;max-height:80px;overflow-y:auto;margin-bottom:10px;">
                    ${searchList}
                </div>
                
                <h4 style="margin:10px 0 5px 0;color:#555;">📝 Fillable Fields (${results.fillableFields.length})</h4>
                <div style="font-size:11px;color:#666;max-height:120px;overflow-y:auto;margin-bottom:10px;">
                    ${fillableList || 'None found'}
                </div>
                
                <h4 style="margin:10px 0 5px 0;color:#555;">📋 All Inputs (${results.inputs.length})</h4>
                <div style="font-size:10px;color:#999;max-height:100px;overflow-y:auto;margin-bottom:10px;">
                    ${inputList || 'None'}
                </div>
                
                <div style="font-size:11px;color:#999;margin-top:10px;">Full results in browser console (F12)</div>
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <button id="scan-copy-btn" style="flex:1;padding:10px;background:#27ae60;color:white;border:none;border-radius:6px;cursor:pointer;">📋 Copy Results</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="flex:1;padding:10px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer;">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add copy functionality with fallback
            document.getElementById('scan-copy-btn').addEventListener('click', () => {
                const copyText = JSON.stringify(results, null, 2);
                
                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(copyText).then(() => {
                        this.showTemporaryMessage('Scan results copied!');
                    }).catch(err => {
                        console.error('Clipboard API failed:', err);
                        this.fallbackCopy(copyText);
                    });
                } else {
                    this.fallbackCopy(copyText);
                }
            });
        }
        
        fallbackCopy(text) {
            // Fallback for older browsers or restricted contexts
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                this.showTemporaryMessage('Scan results copied!');
            } catch (err) {
                console.error('Fallback copy failed:', err);
                this.showTemporaryMessage('Copy failed - check console (F12)');
            }
            document.body.removeChild(textarea);
            
            this.showTemporaryMessage(`Found ${results.phoneNumbers.length} phones, ${results.fillableFields.length} fillable fields`);
        }
        
        startElementPicker() {
            // Element picker tool like Chrome DevTools - hover to highlight, click to select
            this.showTemporaryMessage('🎯 Element picker active - hover and click to select (Esc to cancel)');
            
            // Store original cursor
            const originalCursor = document.body.style.cursor;
            document.body.style.cursor = 'crosshair';
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.id = 'crm-element-picker-overlay';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 123, 255, 0.1);
                z-index: 2147483640;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.id = 'crm-element-picker-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-family: monospace;
                z-index: 2147483647;
                pointer-events: none;
                max-width: 400px;
                display: none;
            `;
            document.body.appendChild(tooltip);
            
            let hoveredElement = null;
            let cleanup = null;
            
            const highlightElement = (el) => {
                if (hoveredElement && hoveredElement !== el) {
                    hoveredElement.style.outline = '';
                    hoveredElement.style.boxShadow = '';
                }
                if (el) {
                    el.style.outline = '2px solid #007bff';
                    el.style.boxShadow = '0 0 0 4px rgba(0, 123, 255, 0.3)';
                }
                hoveredElement = el;
            };
            
            const getElementInfo = (el) => {
                const tag = el.tagName.toLowerCase();
                const id = el.id ? `#${el.id}` : '';
                const name = el.name ? `[name="${el.name}"]` : '';
                const type = el.type ? `[type="${el.type}"]` : '';
                const classes = el.className && typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
                
                return {
                    tag,
                    id: el.id || '',
                    name: el.name || '',
                    type: el.type || '',
                    className: el.className || '',
                    placeholder: el.placeholder || '',
                    value: el.value || '',
                    text: el.innerText ? el.innerText.substring(0, 50) : '',
                    selector: `${tag}${id}${name}${type}`.substring(0, 100),
                    fullSelector: `${tag}${id}${name}${type}${classes}`.substring(0, 100)
                };
            };
            
            const showTooltip = (el, x, y) => {
                const info = getElementInfo(el);
                tooltip.innerHTML = `
                    <strong>${info.tag}</strong> ${info.id ? `id="${info.id}"` : ''} ${info.name ? `name="${info.name}"` : ''} ${info.type ? `type="${info.type}"` : ''}<br>
                    ${info.placeholder ? `placeholder="${info.placeholder}"` : ''}<br>
                    <span style="color:#aaa;">Selector:</span> ${info.selector}
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = `${x + 15}px`;
                tooltip.style.top = `${y + 15}px`;
            };
            
            const handleMouseOver = (e) => {
                if (e.target === overlay || e.target === tooltip) return;
                highlightElement(e.target);
                showTooltip(e.target, e.clientX, e.clientY);
            };
            
            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const info = getElementInfo(e.target);
                const copyText = JSON.stringify(info, null, 2);
                
                // Copy to clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(copyText).then(() => {
                        this.showTemporaryMessage(`✅ Copied: ${info.selector}`);
                    }).catch(() => {
                        this.fallbackCopy(copyText);
                        this.showTemporaryMessage(`✅ Copied: ${info.selector}`);
                    });
                } else {
                    this.fallbackCopy(copyText);
                    this.showTemporaryMessage(`✅ Copied: ${info.selector}`);
                }
                
                cleanup();
            };
            
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    this.showTemporaryMessage('Element picker cancelled');
                }
            };
            
            cleanup = () => {
                document.body.style.cursor = originalCursor;
                document.body.removeEventListener('mouseover', handleMouseOver);
                document.body.removeEventListener('click', handleClick);
                document.removeEventListener('keydown', handleKeyDown);
                if (overlay.parentNode) overlay.remove();
                if (tooltip.parentNode) tooltip.remove();
                if (hoveredElement) {
                    hoveredElement.style.outline = '';
                    hoveredElement.style.boxShadow = '';
                }
            };
            
            document.body.addEventListener('mouseover', handleMouseOver);
            document.body.addEventListener('click', handleClick, true);
            document.addEventListener('keydown', handleKeyDown);
            
            // Auto-cleanup after 60 seconds
            setTimeout(() => {
                if (document.getElementById('crm-element-picker-overlay')) {
                    cleanup();
                    this.showTemporaryMessage('Element picker timed out');
                }
            }, 60000);
        }

        enhanceModelSelectors(options = {}) {
            const { silent = false } = options;

            // Find all potential model dropdowns
            const modelSelectors = [
                '#model_c',
                'select[name*="model"]',
                'select[id*="model"]',
                'select[class*="model"]'
            ];

            let enhancedCount = 0;
            
            // First, try to find ANY select elements on the page
            const allSelects = document.querySelectorAll('select');
            console.log(`Found ${allSelects.length} select elements on page`);
            
            allSelects.forEach((dropdown, index) => {
                console.log(`Select ${index}: id="${dropdown.id}", name="${dropdown.name}", options=${dropdown.options.length}`);

                // Never enhance call action selector with search UI.
                if (dropdown.id === 'call_action_c' || dropdown.name === 'call_action_c') {
                    return;
                }
                
                // Skip if already enhanced
                if (dropdown.dataset.enhanced === 'true') return;
                
                // Check if this actually contains model-like options
                const options = Array.from(dropdown.options);
                const sampleOptions = options.slice(0, 5).map(opt => `"${opt.text}" (${opt.value})`);
                console.log(`Sample options:`, sampleOptions);
                
                const hasModelOptions = options.some(opt => 
                    opt.text.match(/[A-Z]{3}\d{4}[A-Z]{2}/) || // Pattern like DNR1007XR
                    opt.value.match(/[A-Z]{3}\d{4}[A-Z]{2}/) ||
                    opt.text.includes('DNR') || opt.text.includes('DRT') || opt.text.includes('DXR') ||
                    opt.text.toLowerCase().includes('model')
                );
                
                console.log(`Has model options: ${hasModelOptions}`);
                
                // Enhance model_c dropdown with search + AKBS button
                if (dropdown.id === 'model_c') {
                    console.log(`Enhancing dropdown: ${dropdown.id || 'unnamed'}`);
                    this.createModelSearchInterface(dropdown, true); // true = add AKBS button
                    enhancedCount++;
                }
                // Enhance call_reason dropdowns with just search
                else if (dropdown.id && dropdown.id.includes('call_reason')) {
                    console.log(`Enhancing call reason dropdown: ${dropdown.id}`);
                    this.createModelSearchInterface(dropdown);
                    enhancedCount++;
                }
            });

            if (enhancedCount > 0) {
                if (!silent) {
                    this.showTemporaryMessage(`Search enhancers on. Enhanced ${enhancedCount} model selector(s).`);
                }
                console.log(`CRM Tools: Enhanced ${enhancedCount} model selectors`);
            } else {
                console.log('No model selectors found to enhance');
                if (!silent) {
                    this.showTemporaryMessage('Search enhancers on.');
                }
            }
        }
        
        extractFormEntryIds() {
            // Extract Google Form entry IDs from the current page
            if (!window.location.href.includes('docs.google.com/forms')) {
                this.showTemporaryMessage('Not a Google Form page');
                return;
            }
            
            const entries = {};
            let index = 1;
            
            document.querySelectorAll('input[name^="entry."], textarea[name^="entry."], select[name^="entry."]').forEach(el => {
                const name = el.getAttribute('name');
                const match = name.match(/entry\.(\d+)/);
                if (match && !entries[match[1]]) {
                    // Try to find label
                    let label = `Field_${index}`;
                    const container = el.closest('.freebirdFormViewerViewItem') || el.closest('[data-item-id]');
                    if (container) {
                        const titleEl = container.querySelector('.freebirdFormViewerViewItemTitle, h1, [aria-label]');
                        if (titleEl) label = titleEl.textContent.trim().substring(0, 30);
                    }
                    entries[match[1]] = label;
                    index++;
                }
            });
            
            const postUrl = window.location.href.replace('/viewform', '/formResponse');
            
            console.log('=== Google Form Entry IDs ===');
            console.log('POST URL:', postUrl);
            console.log('Entry IDs:');
            for (const [id, label] of Object.entries(entries)) {
                console.log(`  ${label}: entry.${id}`);
            }
            
            // Copy to clipboard
            const output = `POST_URL=${postUrl}\n` + Object.entries(entries).map(([id, label]) => `${label}=entry.${id}`).join('\n');
            navigator.clipboard.writeText(output).then(() => {
                this.showTemporaryMessage(`Found ${Object.keys(entries).length} entries - copied to clipboard!`);
            }).catch(() => {
                this.showTemporaryMessage(`Found ${Object.keys(entries).length} entries - check console`);
            });
        }
        
        openAKBSModelSearch(modelNumber, isKenwood = false) {
            // Opens AKBS and searches for a product model
            // isKenwood: true = Kenwood search, false = JVC search
            const akbsBaseUrl = 'http://akbs.eastus2.cloudapp.azure.com';
            
            if (!modelNumber) {
                const input = prompt('Enter model number to search on AKBS:');
                if (!input || !input.trim()) return;
                modelNumber = input.trim();
            }
            
            const targetUrl = `${akbsBaseUrl}/Default.aspx`;
            
            // Use background script to open tab (content scripts can't use chrome.tabs.create)
            chrome.runtime.sendMessage({
                action: 'openAKBS',
                url: targetUrl,
                model: modelNumber,
                isKenwood: isKenwood
            }, (response) => {
                if (!response || !response.success) {
                    console.error('Failed to open AKBS:', response);
                    this.showTemporaryMessage('Failed to open AKBS');
                }
            });
        }
        
        handleAKBSModelSearch(model, isKenwood = false) {
            // Content script handler for AKBS model search
            // This runs on the AKBS page
            
            // Kenwood uses: txtKWModelSearch, btnKWModelSearch
            // JVC/Span uses: txtSearch, btn (general search)
            
            let searchInput, searchBtn;
            
            if (isKenwood) {
                // Kenwood model search
                searchInput = document.getElementById('txtKWModelSearch');
                searchBtn = document.getElementById('btnKWModelSearch');
            } else {
                // JVC/Span model search - use txtSearch with btn
                searchInput = document.getElementById('txtSearch');
                searchBtn = document.getElementById('btn');
            }
            
            if (searchInput && searchInput.value !== undefined) {
                searchInput.value = model;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                if (searchBtn) {
                    searchBtn.click();
                }
                
                console.log('AKBS search for:', model, 'Kenwood:', isKenwood);
            } else {
                console.error('AKBS search elements not found. Kenwood mode:', isKenwood);
            }
        }
        
        /**
         * Scrapes knowledge base issues from AKBS product page
         * Called when content script runs on AKBS ProductPages
         */
        scrapeIssuesFromAKBSPage() {
            const issues = [];
            
            console.log('Starting AKBS scrape, page title:', document.title);
            console.log('Page URL:', window.location.href);
            
            // Wait for ListView to load (AKBS uses ASP.NET ListView)
            const waitForListView = (maxWait = 5000) => {
                return new Promise((resolve) => {
                    const startTime = Date.now();
                    
                    const check = () => {
                        const listView = document.querySelector('div[id*="ListView"]');
                        const issueLinks = document.querySelectorAll('a[id*="hlIssue"]');
                        
                        if (issueLinks.length > 0) {
                            console.log(`Found ${issueLinks.length} issue links!`);
                            resolve(issueLinks);
                        } else if (Date.now() - startTime > maxWait) {
                            console.log('ListView wait timed out');
                            resolve([]);
                        } else {
                            setTimeout(check, 500);
                        }
                    };
                    
                    check();
                });
            };
            
            // Get issue links using the specific selector
            const issueLinks = document.querySelectorAll('a[id*="hlIssue"]');
            console.log('Direct query found', issueLinks.length, 'issue links');
            
            // If no direct links, wait for ListView
            if (issueLinks.length === 0) {
                console.log('Waiting for ListView to load...');
                // Use synchronous wait as fallback
                const startTime = Date.now();
                while (Date.now() - startTime < 3000) {
                    const links = document.querySelectorAll('a[id*="hlIssue"]');
                    if (links.length > 0) {
                        console.log('Found after wait:', links.length);
                        links.forEach(link => {
                            const row = link.closest('tr') || link.closest('div');
                            let date = '';
                            
                            // Try to get date from row
                            if (row) {
                                const dateCell = row.querySelector('td');
                                if (dateCell) date = dateCell.textContent.trim();
                            }
                            
                            issues.push({
                                title: link.textContent.trim(),
                                url: link.href,
                                date: date
                            });
                        });
                        return issues;
                    }
                }
            }
            
            // Process found links
            issueLinks.forEach(link => {
                const row = link.closest('tr') || link.closest('div');
                let date = '';
                
                // Try to get date from row
                if (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > 0) {
                        date = cells[0].textContent.trim();
                    }
                }
                
                issues.push({
                    title: link.textContent.trim(),
                    url: link.href,
                    date: date
                });
            });
            
            console.log(`Scraped ${issues.length} KB issues from AKBS page`);
            return issues;
        }
        
        /**
         * Scrapes the Instructions link from AKBS product page
         */
        scrapeInstructionsLink() {
            const instructionsLink = document.querySelector('a#ctl00_ContentPlaceHolder1_hlInstructions');
            console.log('Checking for instructions link, found:', instructionsLink);
            if (instructionsLink && instructionsLink.href) {
                console.log('Found instructions link:', instructionsLink.href);
                return instructionsLink.href;
            }
            // Also try with partial id match
            const altLink = document.querySelector('a[id*="hlInstructions"]');
            console.log('Alt link check:', altLink);
            if (altLink && altLink.href) {
                return altLink.href;
            }
            return null;
        }
        
        /**
         * Scrapes article content from KB page for preview
         */
        scrapeArticleContent() {
            let content = '';
            
            // Try common article content selectors
            const contentSelectors = [
                'div[id*="ArticleContent"]',
                'div[id*="Content"]',
                'div.content',
                'article',
                'div.article-body',
                'div[id*="body"]'
            ];
            
            for (const selector of contentSelectors) {
                const el = document.querySelector(selector);
                if (el && el.innerHTML) {
                    content = el.innerHTML;
                    break;
                }
            }
            
            // If no content found, try getting all paragraph text
            if (!content) {
                const paragraphs = document.querySelectorAll('p');
                if (paragraphs.length > 0) {
                    content = Array.from(paragraphs)
                        .map(p => p.innerHTML)
                        .join('<br><br>');
                }
            }
            
            // Clean up absolute URLs to relative for better display
            if (content) {
                content = content.replace(/href="\//g, 'href="https://www.akbs.net/');
                content = content.replace(/src="\//g, 'src="https://www.akbs.net/');
                
                // Fix malformed URLs where href contains raw HTML like: <a href=http://url.com>text
                // This pattern catches <a href=URL> where URL doesn't have surrounding quotes
                content = content.replace(/href=([^\s"'>]+)/g, (match, url) => {
                    // If the URL looks malformed (contains > or <), try to extract just the URL part
                    if (url.includes('>') || url.includes('<')) {
                        const cleanUrl = url.split('>')[0].split('<')[0];
                        return `href="${cleanUrl}"`;
                    }
                    return `href="${url}"`;
                });
            }
            
            return content || '<p>No article content found.</p>';
        }
        
        /**
         * Opens KB Chat - a chat pill that displays AKBS knowledge base links
         * for the currently selected model in the CRM form
         */
        openKBChat() {
            // Check if chat already exists
            const existingChat = document.getElementById('kbChatBubble');
            if (existingChat) {
                existingChat.remove();
                return;
            }
            
            // Detect model from CRM form
            const modelDropdown = document.getElementById('model_c');
            let currentModel = '';
            if (modelDropdown) {
                const selectedOption = modelDropdown.options[modelDropdown.selectedIndex];
                currentModel = selectedOption ? selectedOption.text : '';
            }
            
            // Detect account type (Kenwood or JVC) - determines which AKBS search to use
            const accountTypeSelect = document.getElementById('account_type_c');
            let accountType = '';
            let isKenwood = false;
            if (accountTypeSelect) {
                accountType = accountTypeSelect.value || accountTypeSelect.options[accountTypeSelect.selectedIndex]?.text || '';
                console.log('Account type raw value:', accountType);
                // Check for Kenwood specifically - case insensitive, otherwise default to JVC
                const kenwoodPatterns = ['kenwood', 'ken', 'kw'];
                const jvcPatterns = ['jvc', 'jvcKenwood'];
                const lowerAccountType = accountType.toLowerCase();
                isKenwood = kenwoodPatterns.some(p => lowerAccountType.includes(p)) && !jvcPatterns.some(p => lowerAccountType.includes(p));
                console.log('isKenwood determined:', isKenwood, 'from:', accountType);
            }
            
            // Create persistent bubble pill
            const bubblePill = document.createElement('div');
            bubblePill.id = 'kbChatBubble';
            bubblePill.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%);
                color: white;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10002;
                box-shadow: 0 4px 16px rgba(93, 92, 222, 0.4);
                transition: transform 0.2s, box-shadow 0.2s;
            `;
            bubblePill.innerHTML = `<span style="font-size: 24px;">💬</span>`;
            
            bubblePill.addEventListener('mouseenter', () => {
                bubblePill.style.transform = 'scale(1.1)';
            });
            bubblePill.addEventListener('mouseleave', () => {
                bubblePill.style.transform = 'scale(1)';
            });
            
            document.body.appendChild(bubblePill);
            
            // Click to open full chat - re-detect account type at click time
            bubblePill.addEventListener('click', () => {
                bubblePill.remove();
                
                // Re-detect account type at click time
                const accountTypeSelect = document.getElementById('account_type_c');
                let currentIsKenwood = isKenwood;
                
                if (accountTypeSelect) {
                    const accountType = accountTypeSelect.value || accountTypeSelect.options[accountTypeSelect.selectedIndex]?.text || '';
                    const kenwoodPatterns = ['kenwood', 'ken', 'kw'];
                    const jvcPatterns = ['jvcKenwood'];
                    const lowerAccountType = accountType.toLowerCase();
                    currentIsKenwood = kenwoodPatterns.some(p => lowerAccountType.includes(p)) && !jvcPatterns.some(p => lowerAccountType.includes(p));
                }
                
                this.openKBChatFull(currentModel, currentIsKenwood);
            });
        }
        
        openKBChatFull(currentModel, isKenwood) {
            
            // Create chat bubble - aligned with widget button on same Y axis
            const chatBubble = document.createElement('div');
            chatBubble.id = 'kbChatBubble';
            chatBubble.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 380px;
                max-height: 500px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.25);
                z-index: 10002;
                overflow: hidden;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                animation: slideInUp 0.3s ease;
            `;
            
            // Header
            const header = document.createElement('div');
            header.style.cssText = `
                background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%);
                color: white;
                padding: 14px 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: move;
            `;
            header.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 18px;">💬</span>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">KB Chat</div>
                        <div style="font-size: 11px; opacity: 0.85;">AKBS Knowledge Base</div>
                    </div>
                </div>
            `;
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            closeBtn.addEventListener('click', () => {
                chatBubble.remove();
                // Recreate the bubble pill for minimize functionality
                const bubblePill = document.createElement('div');
                bubblePill.id = 'kbChatBubble';
                bubblePill.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%);
                    color: white;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10002;
                    box-shadow: 0 4px 16px rgba(93, 92, 222, 0.4);
                    transition: transform 0.2s, box-shadow 0.2s;
                `;
                bubblePill.innerHTML = `<span style="font-size: 24px;">💬</span>`;
                
                bubblePill.addEventListener('mouseenter', () => {
                    bubblePill.style.transform = 'scale(1.1)';
                });
                bubblePill.addEventListener('mouseleave', () => {
                    bubblePill.style.transform = 'scale(1)';
                });
                
                document.body.appendChild(bubblePill);
                
                // Click to reopen full chat - re-detect account type
                bubblePill.addEventListener('click', () => {
                    bubblePill.remove();
                    
                    const accountTypeSelect = document.getElementById('account_type_c');
                    let currentIsKenwood = isKenwood;
                    
                    if (accountTypeSelect) {
                        const accountType = accountTypeSelect.value || accountTypeSelect.options[accountTypeSelect.selectedIndex]?.text || '';
                        const kenwoodPatterns = ['kenwood', 'ken', 'kw'];
                        const jvcPatterns = ['jvcKenwood'];
                        const lowerAccountType = accountType.toLowerCase();
                        currentIsKenwood = kenwoodPatterns.some(p => lowerAccountType.includes(p)) && !jvcPatterns.some(p => lowerAccountType.includes(p));
                    }
                    
                    this.openKBChatFull(currentModel, currentIsKenwood);
                });
            });
            header.appendChild(closeBtn);
            
            // Model info bar with account type indicator and search
            const modelBar = document.createElement('div');
            modelBar.style.cssText = `
                background: ${isKenwood ? '#e8f5e9' : '#e3f2fd'};
                padding: 10px 16px;
                border-bottom: 1px solid ${isKenwood ? '#c8e6c9' : '#bbdefb'};
                font-size: 13px;
                color: #495057;
            `;
            
            // Create model search input with autocomplete
            const modelInput = document.createElement('input');
            modelInput.type = 'text';
            modelInput.id = 'kbChatModelInput';
            modelInput.placeholder = currentModel || 'Enter model name (e.g., DMX1057)...';
            modelInput.value = currentModel || '';
            modelInput.setAttribute('list', 'kbChatModelSuggestions');
            modelInput.style.cssText = `
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 13px;
                margin-bottom: 8px;
                box-sizing: border-box;
            `;
            
            // Create datalist for autocomplete suggestions from CRM dropdown
            const suggestionsList = document.createElement('datalist');
            suggestionsList.id = 'kbChatModelSuggestions';
            
            const crmModelDropdown = document.getElementById('model_c');
            if (crmModelDropdown) {
                Array.from(crmModelDropdown.options).forEach(opt => {
                    if (opt.value && opt.text && opt.text.trim() !== 'Select Correct Model' && opt.text.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = opt.text.trim();
                        suggestionsList.appendChild(option);
                    }
                });
            }
            
            // Account type toggle
            const typeToggle = document.createElement('div');
            typeToggle.style.cssText = `
                display: flex;
                gap: 12px;
                margin-bottom: 8px;
                padding: 8px 12px;
                background: rgba(0,0,0,0.03);
                border-radius: 8px;
            `;
            typeToggle.innerHTML = `
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; ${isKenwood ? 'background: rgba(93, 92, 222, 0.15);' : ''}" onmouseover="this.style.background='rgba(93, 92, 222, 0.1)'" onmouseout="this.style.background='${isKenwood ? 'rgba(93, 92, 222, 0.15)' : 'transparent'}'">
                    <input type="radio" name="kbChatDivision" value="kenwood" ${isKenwood ? 'checked' : ''} style="accent-color: #5D5CDE; width: 16px; height: 16px; cursor: pointer;">
                    <span style="font-weight: ${isKenwood ? '600' : '400'}; color: ${isKenwood ? '#5D5CDE' : '#666'};">🔵 Kenwood</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; ${!isKenwood ? 'background: rgba(93, 92, 222, 0.15);' : ''}" onmouseover="this.style.background='rgba(93, 92, 222, 0.1)'" onmouseout="this.style.background='${!isKenwood ? 'rgba(93, 92, 222, 0.15)' : 'transparent'}'">
                    <input type="radio" name="kbChatDivision" value="jvc" ${!isKenwood ? 'checked' : ''} style="accent-color: #5D5CDE; width: 16px; height: 16px; cursor: pointer;">
                    <span style="font-weight: ${!isKenwood ? '600' : '400'}; color: ${!isKenwood ? '#5D5CDE' : '#666'};">🟢 JVC</span>
                </label>
            `;
            
            modelBar.appendChild(modelInput);
            modelBar.appendChild(suggestionsList);
            modelBar.appendChild(typeToggle);
            
            // Chat content area
            const content = document.createElement('div');
            content.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8f9fa;
            `;
            
            // Welcome message
            const welcomeMsg = document.createElement('div');
            welcomeMsg.style.cssText = `
                background: white;
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            `;
            welcomeMsg.innerHTML = `
                <p style="margin: 0 0 12px 0; color: #212529; line-height: 1.5;">
                    👋 Hi! I'll help you find knowledge base articles for AKBS products.
                </p>
                <p style="margin: 0 0 12px 0; color: #495057; font-size: 13px; line-height: 1.5;">
                    Enter a model name and click Search to find KB articles and issues.
                </p>
            `;
            content.appendChild(welcomeMsg);
            
            // Search button
            const searchBtn = document.createElement('button');
            searchBtn.innerHTML = '🔍 Search AKBS';
            searchBtn.style.cssText = `
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
            `;
            
            // Loading state
            const loadingDiv = document.createElement('div');
            loadingDiv.style.cssText = `
                display: none;
                text-align: center;
                padding: 20px;
                color: #6c757d;
            `;
            loadingDiv.innerHTML = '⏳ Searching AKBS...';
            
            // Results container
            const resultsDiv = document.createElement('div');
            resultsDiv.style.cssText = `
                margin-top: 12px;
                display: none;
            `;
            
            searchBtn.addEventListener('click', () => {
                searchBtn.style.display = 'none';
                loadingDiv.style.display = 'block';
                
                // Get model from input and division from radio
                const modelInput = document.getElementById('kbChatModelInput');
                let model = modelInput ? modelInput.value.trim() : currentModel;
                
                // Clean up model name - remove prefixes like "Ken_", "JVC_" etc for AKBS search
                if (model) {
                    model = model.replace(/^(Ken|JVC|Pyle|iSimple|PAC|Boss|Aura|Bazooka|Mountie)[\s_-]*/i, '');
                    console.log('Cleaned model name for AKBS:', model);
                }
                const divisionRadio = document.querySelector('input[name="kbChatDivision"]:checked');
                const division = divisionRadio ? divisionRadio.value : (isKenwood ? 'kenwood' : 'jvc');
                const isKenwoodInput = division === 'kenwood';
                
                console.log('Searching for model:', model, 'division:', division);
                
                // Scrape AKBS in background and display results without leaving CRM
                this.scrapeAKBSIssues(model, isKenwoodInput, resultsDiv, loadingDiv, searchBtn);
            });
            
            content.appendChild(searchBtn);
            content.appendChild(loadingDiv);
            content.appendChild(resultsDiv);
            
            // Assemble
            chatBubble.appendChild(header);
            chatBubble.appendChild(modelBar);
            chatBubble.appendChild(content);
            document.body.appendChild(chatBubble);
            
            // Make draggable with position memory
            this.makeDraggable(header, chatBubble, 'kbChatBubble_position');
            
            // Auto-search if model was detected from CRM
            if (currentModel) {
                setTimeout(() => {
                    searchBtn.click();
                }, 500);
            }
            
            this.showTemporaryMessage('KB Chat opened');
        }
        
        makeDraggable(header, element, storageKey = null) {
            let isDragging = false;
            let startX, startY, startLeft, startTop;
            
            header.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = element.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                element.style.right = 'auto';
                element.style.bottom = 'auto';
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                let newLeft = startLeft + dx;
                let newTop = startTop + dy;
                newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - element.offsetWidth));
                newTop = Math.max(0, Math.min(newTop, window.innerHeight - element.offsetHeight));
                element.style.left = newLeft + 'px';
                element.style.top = newTop + 'px';
            });
            
            document.addEventListener('mouseup', () => {
                if (isDragging && storageKey) {
                    // Save position to chrome.storage.local
                    const rect = element.getBoundingClientRect();
                    const saveObj = { left: rect.left, top: rect.top };
                    chrome.storage.local.set({ [storageKey]: saveObj });
                }
                isDragging = false;
            });
            
            // Load saved position
            if (storageKey) {
                chrome.storage.local.get([storageKey], (result) => {
                    if (result[storageKey]) {
                        const pos = result[storageKey];
                        element.style.left = pos.left + 'px';
                        element.style.top = pos.top + 'px';
                        element.style.right = 'auto';
                        element.style.bottom = 'auto';
                    }
                });
            }
        }
        
        /**
         * Scrapes AKBS for issues/articles related to a model
         * Opens in background tab, scrapes, and displays results without leaving CRM
         */
        scrapeAKBSIssues(model, isKenwood, resultsDiv, loadingDiv, searchBtn) {
            const akbsBaseUrl = 'http://akbs.eastus2.cloudapp.azure.com';
            
            // Build the product page URL with model parameter
            // Based on productpage.txt structure: KBProductPage.aspx?id={model}&div={kenwood|jvc}
            const division = isKenwood ? 'kenwood' : 'jvc';
            const productUrl = `${akbsBaseUrl}/ProductPages/KBProductPage.aspx?id=${encodeURIComponent(model)}&div=${division}`;
            
            console.log('Scraping AKBS:', productUrl);
            
            // Send message to background script to handle tab creation
            chrome.runtime.sendMessage({
                action: 'scrapeAKBSIssues',
                url: productUrl,
                model: model
            }, (response) => {
                console.log('Scrape response:', response);
                loadingDiv.style.display = 'none';
                resultsDiv.style.display = 'block';
                
                if (response && response.success && response.issues && response.issues.length > 0) {
                    this.displayKBIssues(response.issues, resultsDiv, isKenwood, response.instructionsUrl, model);
                    
                    // Save successful model+division to chrome.storage.local for future reference
                    chrome.storage.local.get(['kbModelCache'], (result) => {
                        const cache = result.kbModelCache || {};
                        cache[model.toUpperCase()] = { division: division, lastUsed: Date.now() };
                        chrome.storage.local.set({ kbModelCache: cache });
                        console.log('Saved model cache:', model, '->', division);
                    });
                } else if (response && response.issues && response.issues.length > 0) {
                    // Sometimes response format differs
                    this.displayKBIssues(response.issues, resultsDiv, isKenwood, response.instructionsUrl, model);
                    
                    // Save successful model+division
                    chrome.storage.local.get(['kbModelCache'], (result) => {
                        const cache = result.kbModelCache || {};
                        cache[model.toUpperCase()] = { division: division, lastUsed: Date.now() };
                        chrome.storage.local.set({ kbModelCache: cache });
                    });
                } else {
                    console.log('No issues found in response:', response);
                    resultsDiv.innerHTML = `
                        <div style="background: #f8d7da; padding: 12px; border-radius: 8px; font-size: 13px; color: #721c24; margin-bottom: 12px;">
                            📭 No knowledge base articles found for <strong>${model}</strong>.
                        </div>
                        <p style="font-size: 13px; color: #6c757d; margin: 0 0 12px 0;">
                            Try selecting a different model or search manually on AKBS.
                        </p>
                        <a href="${productUrl}" target="_blank" style="color: #5D5CDE; font-size: 13px;">Open AKBS manually →</a>
                    `;
                }
                
                searchBtn.style.display = 'flex';
            });
        }
        
        /**
         * Displays KB issues in the results container
         */
        displayKBIssues(issues, container, isKenwood, instructionsUrl = null, model = '') {
            // Inject preview window styles
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                .kb-issue-item { position: relative; cursor: pointer; }
                .kb-issue-item:hover { background: #f8f9fa; }
                .kb-issue-link:hover { background: #f0f4ff; }
                .kb-issue-preview-btn {
                    display: inline-block;
                    margin-top: 6px;
                    padding: 4px 10px;
                    background: #5D5CDE;
                    color: white;
                    border-radius: 4px;
                    font-size: 11px;
                    text-decoration: none;
                    cursor: pointer;
                }
                .kb-issue-preview-btn:hover { background: #4746b8; }
                .kb-preview-window {
                    display: none;
                    position: fixed;
                    width: 500px;
                    height: 450px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    z-index: 100001;
                    overflow: hidden;
                }
                .kb-preview-header {
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                }
                .kb-preview-close {
                    cursor: pointer;
                    font-size: 24px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                }
                .kb-preview-close:hover { background: rgba(255,255,255,0.3); }
                .kb-preview-content {
                    height: calc(100% - 50px);
                    overflow-y: auto;
                    padding: 16px;
                    line-height: 1.6;
                    font-size: 14px;
                }
                .kb-preview-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #666;
                    font-size: 16px;
                }
            `;
            document.head.appendChild(styleEl);
            
            const issuesHtml = issues.map((issue, idx) => `
                <div class="kb-issue-item" data-url="${issue.url}" data-index="${idx}" style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); border-left: 3px solid ${isKenwood ? '#1976d2' : '#388e3c'};">
                    <a href="${issue.url}" target="_blank" class="kb-issue-link" style="color: #212529; text-decoration: none; font-weight: 600; display: block; margin-bottom: 4px;" title="${issue.title}">
                        ${issue.title}
                    </a>
                    ${issue.date ? `<span style="font-size: 11px; color: #6c757d;">📅 ${issue.date}</span>` : ''}
                    <a href="#" class="kb-issue-preview-btn" data-url="${issue.url}" data-index="${idx}">👁️ Preview</a>
                </div>
                <div class="kb-article-preview" id="kb-preview-${idx}"></div>
            `).join('');
            
            container.innerHTML = issuesHtml;
            
            // Attach click handlers to preview buttons using setTimeout to ensure DOM is ready
            setTimeout(() => {
                const previewBtns = document.querySelectorAll('.kb-issue-preview-btn');
                console.log('[CRM Widget] Found', previewBtns.length, 'preview buttons');
                
                previewBtns.forEach(btn => {
                    // Remove old listeners by cloning
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    console.log('[CRM Widget] Attaching click to:', newBtn.dataset.url);
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url = newBtn.dataset.url;
                        console.log('[CRM Widget] Preview clicked, URL:', url);
                        this.openArticlePreview(url);
                    });
                });
            }, 100);
            
            // Attach click handlers to article links (open in new tab)
            container.querySelectorAll('.kb-issue-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    // Let default behavior work (opens in new tab)
                });
            });
            
            const instructionsHtml = instructionsUrl ? `
                <div style="margin-bottom: 12px; padding: 10px; background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%); border-radius: 8px;">
                    <a href="${instructionsUrl}" target="_blank" style="color: white; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        📖 View Instructions
                    </a>
                </div>
            ` : '';
            
            // Search engine buttons with SVG logos
            const googleLogoSvg = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;
            const bingLogoSvg = `<svg width="18" height="18" viewBox="0 0 24 24"><rect width="24" height="24" fill="#008373" rx="4"/><path fill="#fff" d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/><circle fill="#fff" cx="9" cy="10" r="1.5"/><circle fill="#fff" cx="15" cy="10" r="1.5"/><path fill="#fff" d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>`;
            
            const searchButtonsHtml = model ? `
                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <a href="https://www.google.com/search?q=${encodeURIComponent(model + ' Kenwood')}" target="_blank" style="flex: 1; min-width: 100px; padding: 8px 12px; background: #4285f4; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        ${googleLogoSvg} Google
                    </a>
                    <a href="https://www.bing.com/search?q=${encodeURIComponent(model + ' Kenwood')}" target="_blank" style="flex: 1; min-width: 100px; padding: 8px 12px; background: #008373; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        ${bingLogoSvg} Bing
                    </a>
                </div>
            ` : '';
            
            container.innerHTML = `
                <div style="margin-bottom: 12px;">
                    <strong style="color: #212529;">📚 Knowledge Base Articles (${issues.length})</strong>
                </div>
                ${searchButtonsHtml}
                ${instructionsHtml}
                ${issuesHtml}
                <p style="font-size: 12px; color: #6c757d; margin-top: 12px; text-align: center;">
                    Click an article to open it in a new tab
                </p>
            `;
        }
        
        openArticlePreview(url) {
            console.log('[CRM Widget] openArticlePreview called with URL:', url);
            const self = this;
            
            let previewWindow = document.querySelector('.kb-preview-window');
            const content = previewWindow ? previewWindow.querySelector('.kb-preview-content') : null;
            
            if (!previewWindow) {
                previewWindow = document.createElement('div');
                previewWindow.className = 'kb-preview-window';
                previewWindow.innerHTML = `
                    <div class="kb-preview-header">
                        <span>📄 Article</span>
                        <span class="kb-preview-close">×</span>
                    </div>
                    <div class="kb-preview-content"></div>
                `;
                document.body.appendChild(previewWindow);
                previewWindow.querySelector('.kb-preview-close').addEventListener('click', () => self.closeArticlePreview());
                
                // Make preview window draggable with position memory
                const previewHeader = previewWindow.querySelector('.kb-preview-header');
                this.makeDraggable(previewHeader, previewWindow, 'kbPreviewWindow_position');
            }
            
            // Find saved position or default position
            chrome.storage.local.get(['kbPreviewWindow_position'], (result) => {
                if (result.kbPreviewWindow_position) {
                    const pos = result.kbPreviewWindow_position;
                    previewWindow.style.left = pos.left + 'px';
                    previewWindow.style.top = pos.top + 'px';
                    previewWindow.style.right = 'auto';
                    previewWindow.style.bottom = 'auto';
                } else {
                    // Default: position next to chat window
                    const chatWindow = document.querySelector('.kb-chat-container');
                    
                    if (chatWindow) {
                        const chatRect = chatWindow.getBoundingClientRect();
                        previewWindow.style.top = chatRect.top + 'px';
                        previewWindow.style.left = (chatRect.right + 20) + 'px';
                    } else {
                        previewWindow.style.top = '100px';
                        previewWindow.style.left = 'auto';
                        previewWindow.style.right = '20px';
                    }
                }
                
                previewWindow.style.width = '500px';
                previewWindow.style.height = '450px';
                previewWindow.style.display = 'flex';
                previewWindow.style.flexDirection = 'column';
            });
            
            const contentEl = previewWindow.querySelector('.kb-preview-content');
            contentEl.innerHTML = '<div class="kb-preview-loading">⏳ Loading article...</div>';
            
            chrome.runtime.sendMessage({
                action: 'scrapeKBArticle',
                url: url
            }, response => {
                console.log('[CRM Widget] scrapeKBArticle response:', response);
                if (response && response.success && response.content) {
                    contentEl.innerHTML = response.content;
                    
                    // Make all links in article content open in new tab
                    contentEl.querySelectorAll('a').forEach(link => {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    });
                    
                    // Also intercept clicks on any element to catch malformed links
                    contentEl.addEventListener('click', (e) => {
                        const anchor = e.target.closest('a');
                        if (anchor) {
                            e.preventDefault();
                            let linkUrl = anchor.getAttribute('href');
                            
                            // Clean up malformed URLs - if href contains > or < remove everything from that point
                            if (linkUrl && (linkUrl.includes('>') || linkUrl.includes('<'))) {
                                linkUrl = linkUrl.split('>')[0].split('<')[0];
                            }
                            
                            // Try to extract URL from text content if href is malformed
                            if (!linkUrl || linkUrl === '#' || linkUrl.includes('href=')) {
                                const textContent = anchor.textContent || '';
                                const urlMatch = textContent.match(/https?:\/\/[^\s>]+/);
                                if (urlMatch) {
                                    linkUrl = urlMatch[0].split('>')[0].split('<')[0];
                                }
                            }
                            
                            if (linkUrl && linkUrl.startsWith('http')) {
                                window.open(linkUrl, '_blank', 'noopener,noreferrer');
                            }
                        }
                    });
                } else {
                    contentEl.innerHTML = '<p>Unable to load article preview. <a href="' + url + '" target="_blank">Open in new tab</a></p>';
                }
            });
        }
        
        closeArticlePreview() {
            const previewWindow = document.querySelector('.kb-preview-window');
            if (previewWindow) {
                previewWindow.style.display = 'none';
            }
        }
        
        createModelSearchInterface(dropdown, addAKBSButton = false) {
            // Mark as enhanced
            dropdown.dataset.enhanced = 'true';
            
            // Get all options
            const options = Array.from(dropdown.options).map(opt => ({
                text: opt.text,
                value: opt.value
            }));

            // Create search input
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search';
            searchInput.style.cssText = `
                width: 200px;
                margin-right: 10px;
                padding: 6px 12px;
                border: 2px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s ease;
            `;

            // Create results dropdown
            const resultBox = document.createElement('select');
            resultBox.size = 6;
            resultBox.style.cssText = `
                display: none;
                width: 220px;
                margin: 5px 0;
                padding: 4px;
                border: 2px solid #3498db;
                border-radius: 6px;
                background: white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                position: relative;
                z-index: 1000;
                max-height: 200px;
            `;

            // Create AKBS search button only for model_c dropdown
            let akbsButton = null;
            if (addAKBSButton) {
                akbsButton = document.createElement('button');
                akbsButton.type = 'button';
                akbsButton.innerHTML = '🔍 AKBS';
                akbsButton.title = 'Search on AKBS';
                akbsButton.style.cssText = `
                    padding: 5px 10px;
                    background: #e67e22;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-left: 5px;
                    vertical-align: top;
                `;
                
                akbsButton.addEventListener('click', () => {
                    // Get account type to determine search method
                    const accountTypeSelect = document.getElementById('account_type_c');
                    const accountType = accountTypeSelect ? accountTypeSelect.value : '';
                    const kenwoodPatterns = ['ken', 'kw', 'kenwood'];
                    const isKenwood = kenwoodPatterns.some(p => accountType.toLowerCase().includes(p));
                    
                    // Get the model from search input or dropdown
                    let modelQuery = searchInput.value.trim() || dropdown.value;
                    
                    // Clean model query - remove prefixes like "Ken_", "JC_", etc.
                    if (modelQuery) {
                        modelQuery = modelQuery.replace(/^[A-Za-z]+_/, '');
                        modelQuery = modelQuery.trim();
                    }
                    
                    if (!modelQuery) {
                        const userInput = prompt('Enter model number to search on AKBS:');
                        if (!userInput || !userInput.trim()) return;
                        modelQuery = userInput.trim();
                    }
                    
                    // Open AKBS and search
                    this.openAKBSModelSearch(modelQuery, isKenwood);
                });
            }
            
            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: inline-block;
                vertical-align: top;
            `;
            if (akbsButton) {
                buttonContainer.appendChild(akbsButton);
            }
            
            // Create a container div for better positioning
            const searchContainer = document.createElement('div');
            searchContainer.style.cssText = `
                display: inline-block;
                vertical-align: top;
                margin-right: 10px;
            `;
            
            // Add search elements to container
            searchContainer.appendChild(searchInput);
            searchContainer.appendChild(resultBox);
            
            // Insert container before the original dropdown
            dropdown.parentNode.insertBefore(searchContainer, dropdown);
            if (akbsButton) {
                dropdown.parentNode.insertBefore(buttonContainer, dropdown);
            }
            
            // Style the original dropdown to show it's enhanced
            dropdown.style.border = '2px solid #27ae60';
            dropdown.title = 'Enhanced with search functionality';

            let userTyped = false;

            // Search functionality
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.trim().toLowerCase();
                userTyped = query.length > 0;
                resultBox.innerHTML = '';
                
                console.log(`Searching for: "${query}"`);

                if (!userTyped) {
                    resultBox.style.display = 'none';
                    return;
                }

                // Normalize function to remove dashes, spaces, and make lowercase
                const normalize = (text) => {
                    return text.toLowerCase().replace(/[-\s]/g, '');
                };

                const normalizedQuery = normalize(query);

                // Filter options with flexible matching
                const filtered = options.filter(opt => {
                    const normalizedText = normalize(opt.text);
                    const normalizedValue = normalize(opt.value);
                    
                    return normalizedText.includes(normalizedQuery) ||
                           normalizedValue.includes(normalizedQuery) ||
                           opt.text.toLowerCase().includes(query) ||
                           opt.value.toLowerCase().includes(query);
                });
                
                console.log(`Found ${filtered.length} matching options`);

                if (filtered.length === 0) {
                    const noResults = document.createElement('option');
                    noResults.text = 'None found';
                    noResults.disabled = true;
                    noResults.style.fontStyle = 'italic';
                    noResults.style.color = '#999';
                    resultBox.appendChild(noResults);
                } else {
                    filtered.slice(0, 10).forEach((opt, index) => { // Limit to 10 results
                        const option = document.createElement('option');
                        option.text = opt.text;
                        option.value = opt.value;
                        if (index === 0) option.selected = true; // Select first result
                        resultBox.appendChild(option);
                        console.log(`Added option: ${opt.text}`);
                    });
                }

                resultBox.style.display = 'block';
                console.log(`Result box display set to: ${resultBox.style.display}`);
            });

            // Selection functionality
            resultBox.addEventListener('change', () => {
                if (!userTyped) return;

                const selected = resultBox.value;
                dropdown.value = selected;
                
                // Set search input to show selected model
                const selectedOption = options.find(opt => opt.value === selected);
                searchInput.value = selectedOption ? selectedOption.text : '';
                
                resultBox.style.display = 'none';
                userTyped = false; // Reset the flag
                
                // Trigger change event on original dropdown
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Show success feedback
                searchInput.style.borderColor = '#27ae60';
                setTimeout(() => {
                    searchInput.style.borderColor = '#ddd';
                }, 1500);
            });

            // Double-click selection
            resultBox.addEventListener('dblclick', () => {
                if (resultBox.selectedIndex >= 0) {
                    const selected = resultBox.value;
                    dropdown.value = selected;
                    
                    const selectedOption = options.find(opt => opt.value === selected);
                    searchInput.value = selectedOption ? selectedOption.text : '';
                    
                    resultBox.style.display = 'none';
                    userTyped = false;
                    
                    dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    searchInput.style.borderColor = '#27ae60';
                    setTimeout(() => {
                        searchInput.style.borderColor = '#ddd';
                    }, 1500);
                }
            });

            // Hide results when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !resultBox.contains(e.target)) {
                    resultBox.style.display = 'none';
                }
            });

            // Focus styling
            searchInput.addEventListener('focus', () => {
                searchInput.style.borderColor = '#3498db';
            });

            searchInput.addEventListener('blur', () => {
                if (!userTyped) {
                    searchInput.style.borderColor = '#ddd';
                }
            });

            // Keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' && resultBox.style.display === 'block') {
                    e.preventDefault();
                    resultBox.focus();
                    if (resultBox.options.length > 0) {
                        resultBox.selectedIndex = 0;
                    }
                }
                if (e.key === 'Enter' && resultBox.style.display === 'block') {
                    e.preventDefault();
                    if (resultBox.options.length > 0) {
                        const selected = resultBox.options[0].value;
                        dropdown.value = selected;
                        
                        const selectedOption = options.find(opt => opt.value === selected);
                        searchInput.value = selectedOption ? selectedOption.text : '';
                        
                        resultBox.style.display = 'none';
                        userTyped = false;
                        
                        dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        searchInput.style.borderColor = '#27ae60';
                        setTimeout(() => {
                            searchInput.style.borderColor = '#ddd';
                        }, 1500);
                    }
                }
                if (e.key === 'Escape') {
                    resultBox.style.display = 'none';
                    searchInput.blur();
                }
            });

            // Keyboard navigation for result box
            resultBox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (resultBox.selectedIndex >= 0) {
                        const selected = resultBox.value;
                        dropdown.value = selected;
                        
                        const selectedOption = options.find(opt => opt.value === selected);
                        searchInput.value = selectedOption ? selectedOption.text : '';
                        
                        resultBox.style.display = 'none';
                        userTyped = false;
                        
                        dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        searchInput.focus();
                        searchInput.style.borderColor = '#27ae60';
                        setTimeout(() => {
                            searchInput.style.borderColor = '#ddd';
                        }, 1500);
                    }
                }
                if (e.key === 'Escape') {
                    resultBox.style.display = 'none';
                    searchInput.focus();
                }
            });

            console.log(`Enhanced model selector: ${dropdown.id || 'unnamed'} with ${options.length} options`);
        }

        getCallDependencyFields() {
            const findField = (id, namePart) => {
                return document.getElementById(id) ||
                    document.querySelector(`select[name="${id}"]`) ||
                    document.querySelector(`select[name*="${namePart}"]`) ||
                    null;
            };

            return {
                category: findField('call_category_c', 'call_category'),
                action: findField('call_action_c', 'call_action'),
                reason: findField('call_reason_c', 'call_reason'),
                accountType: findField('account_type_c', 'account_type'),
                communicationType: findField('communication_type_c', 'communication_type')
            };
        }

        getSelectedOptionText(selectEl) {
            if (!selectEl || selectEl.selectedIndex < 0) return '';
            const option = selectEl.options[selectEl.selectedIndex];
            return option ? option.text.trim() : '';
        }

        isValidSelection(selectEl) {
            if (!selectEl) return false;
            const value = (selectEl.value || '').trim();
            const text = this.getSelectedOptionText(selectEl).toLowerCase();
            if (!value) return false;
            if (text.includes('select')) return false;
            if (text.includes('------')) return false;
            return true;
        }

        normalizeKeyPart(value) {
            return (value || '')
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .trim();
        }

        getReasonMappingKeys(fields) {
            const reasonValue = fields.reason ? fields.reason.value : '';
            const reasonText = this.getSelectedOptionText(fields.reason);
            const accountValue = fields.accountType ? fields.accountType.value : '';
            const communicationValue = fields.communicationType ? fields.communicationType.value : '';

            const precise = [
                this.normalizeKeyPart(accountValue),
                this.normalizeKeyPart(communicationValue),
                this.normalizeKeyPart(reasonValue || reasonText)
            ].join('|');

            const fallback = this.normalizeKeyPart(reasonValue || reasonText);
            return { precise, fallback };
        }

        readCallMappings() {
            try {
                const raw = localStorage.getItem(this.callMappingStorageKey);
                if (!raw) return {};
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object' ? parsed : {};
            } catch (err) {
                console.error('Unable to read call mappings:', err);
                return {};
            }
        }

        writeCallMappings(mappings) {
            try {
                localStorage.setItem(this.callMappingStorageKey, JSON.stringify(mappings));
            } catch (err) {
                console.error('Unable to write call mappings:', err);
            }
        }

        saveReasonMappingFromCurrentSelection(fields) {
            if (!this.isValidSelection(fields.category) ||
                !this.isValidSelection(fields.action) ||
                !this.isValidSelection(fields.reason)) {
                return;
            }

            const keys = this.getReasonMappingKeys(fields);
            const mappings = this.readCallMappings();
            const now = new Date().toISOString();

            const entry = {
                categoryValue: fields.category.value,
                categoryText: this.getSelectedOptionText(fields.category),
                actionValue: fields.action.value,
                actionText: this.getSelectedOptionText(fields.action),
                updatedAt: now,
                count: 1
            };

            const existing = mappings[keys.precise] || mappings[keys.fallback];
            if (existing && typeof existing.count === 'number') {
                entry.count = existing.count + 1;
            }

            mappings[keys.precise] = entry;
            mappings[keys.fallback] = entry;
            this.writeCallMappings(mappings);
            console.log('Saved call dependency mapping for reason:', entry);
        }

        trySetSelectOption(selectEl, targetValue, targetText) {
            if (!selectEl) return false;

            const currentText = this.getSelectedOptionText(selectEl);
            if (selectEl.value === targetValue ||
                (targetText && currentText.toLowerCase() === targetText.toLowerCase())) {
                return true;
            }

            let foundValue = '';

            if (targetValue) {
                const byValue = Array.from(selectEl.options).find((opt) => opt.value === targetValue);
                if (byValue) foundValue = byValue.value;
            }

            if (!foundValue && targetText) {
                const byText = Array.from(selectEl.options).find(
                    (opt) => opt.text.trim().toLowerCase() === targetText.trim().toLowerCase()
                );
                if (byText) foundValue = byText.value;
            }

            if (!foundValue) return false;

            selectEl.value = foundValue;
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }

        rememberReasonSelection(fields) {
            if (!this.isValidSelection(fields.reason)) return;

            this.lastChosenReason = {
                value: fields.reason.value,
                text: this.getSelectedOptionText(fields.reason),
                timestamp: Date.now()
            };
        }

        restoreReasonIfCleared(fields, reasonValue, reasonText) {
            if (!fields.reason) return false;
            if (this.isValidSelection(fields.reason)) return false;

            this.isApplyingCallMapping = true;
            const restored = this.trySetSelectOption(fields.reason, reasonValue, reasonText);
            this.isApplyingCallMapping = false;
            return restored;
        }

        applyLearnedMappingForReason(fields) {
            if (!this.isValidSelection(fields.reason)) return;

            const keys = this.getReasonMappingKeys(fields);
            const mappings = this.readCallMappings();
            const mapping = mappings[keys.precise] || mappings[keys.fallback];

            if (!mapping) return;

            const selectedReasonValue = fields.reason.value;
            const selectedReasonText = this.getSelectedOptionText(fields.reason);

            this.isApplyingCallMapping = true;

            const categoryApplied = this.trySetSelectOption(
                fields.category,
                mapping.categoryValue,
                mapping.categoryText
            );

            if (!categoryApplied) {
                this.isApplyingCallMapping = false;
                return;
            }

            // Call action options may refresh after category change.
            setTimeout(() => {
                const refreshedFields = this.getCallDependencyFields();
                const actionApplied = this.trySetSelectOption(
                    refreshedFields.action,
                    mapping.actionValue,
                    mapping.actionText
                );

                // Some CRM rules clear reason when category/action changes.
                // Reapply the user's selected reason if it was cleared.
                const reasonRestored = this.restoreReasonIfCleared(
                    refreshedFields,
                    selectedReasonValue,
                    selectedReasonText
                );

                this.isApplyingCallMapping = false;

                if (actionApplied) {
                    const suffix = reasonRestored ? ' Reason restored.' : '';
                    this.showTemporaryMessage('Applied saved Call Category and Call Action from reason.' + suffix);
                }
            }, 250);
        }

        setupCallDependencyAutomation() {
            const fields = this.getCallDependencyFields();
            if (!fields.reason || !fields.category || !fields.action) {
                return;
            }

            if (fields.reason.dataset.mappingBound === 'true') {
                return;
            }

            const saveMappingHandler = () => {
                const liveFields = this.getCallDependencyFields();
                this.saveReasonMappingFromCurrentSelection(liveFields);

                // If reason was selected first and got cleared by CRM dependency logic,
                // attempt a short-window restore to keep the workflow reason-first.
                if (!this.isApplyingCallMapping &&
                    this.lastChosenReason &&
                    Date.now() - this.lastChosenReason.timestamp < 3000) {
                    setTimeout(() => {
                        const delayedFields = this.getCallDependencyFields();
                        this.restoreReasonIfCleared(
                            delayedFields,
                            this.lastChosenReason.value,
                            this.lastChosenReason.text
                        );
                    }, 260);
                }
            };

            const reasonChangeHandler = () => {
                if (this.isApplyingCallMapping) {
                    return;
                }

                const liveFields = this.getCallDependencyFields();
                this.rememberReasonSelection(liveFields);
                this.applyLearnedMappingForReason(liveFields);
                // Save after a short delay so dependent selects can settle.
                setTimeout(() => {
                    const delayedFields = this.getCallDependencyFields();
                    this.saveReasonMappingFromCurrentSelection(delayedFields);
                }, 350);
            };

            fields.reason.addEventListener('change', reasonChangeHandler);
            fields.category.addEventListener('change', saveMappingHandler);
            fields.action.addEventListener('change', saveMappingHandler);

            fields.reason.dataset.mappingBound = 'true';
            console.log('Call dependency automation enabled for reason/category/action fields.');
        }
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInFromTop {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes callBlink {
            0%, 100% { 
                background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                box-shadow: 0 4px 15px rgba(39, 174, 96, 0.5);
            }
            50% { 
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                box-shadow: 0 4px 20px rgba(231, 76, 60, 0.6);
            }
        }
        
        .call-blinking {
            animation: callBlink 0.8s ease-in-out infinite;
        }
        
        @keyframes slideOutToTop {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
        
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // Initialize the widget
    const crmTools = new CRMToolsWidget();
    window.crmTools = crmTools; // Make globally accessible

    // Auto-create persistent KB Chat bubble on CRM pages
    const autoCreateBubble = () => {
        const modelDropdown = document.getElementById('model_c');
        if (modelDropdown) {
            const currentModel = modelDropdown.options[modelDropdown.selectedIndex]?.text || '';
            if (currentModel) {
                // Remove existing bubble if any
                const existingBubble = document.getElementById('kbChatBubble');
                if (existingBubble) existingBubble.remove();
                
                // Determine division from account_type_c or chrome.storage.local cache
                const accountTypeSelect = document.getElementById('account_type_c');
                let isKenwood = false;
                
                if (accountTypeSelect) {
                    const accountType = accountTypeSelect.value || accountTypeSelect.options[accountTypeSelect.selectedIndex]?.text || '';
                    const kenwoodPatterns = ['kenwood', 'ken', 'kw'];
                    const jvcPatterns = ['jvcKenwood'];
                    const lowerAccountType = accountType.toLowerCase();
                    isKenwood = kenwoodPatterns.some(p => lowerAccountType.includes(p)) && !jvcPatterns.some(p => lowerAccountType.includes(p));
                }
                
                // Check chrome.storage.local for cached model+division
                chrome.storage.local.get(['kbModelCache'], (result) => {
                    const cache = result.kbModelCache || {};
                    const cachedModel = cache[currentModel.toUpperCase()];
                    if (cachedModel) {
                        isKenwood = cachedModel.division === 'kenwood';
                        console.log('Using cached division for', currentModel, ':', cachedModel.division);
                    }
                    
                    // Create persistent bubble pill
                    const bubblePill = document.createElement('div');
                    bubblePill.id = 'kbChatBubble';
                    bubblePill.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        left: 20px;
                        background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%);
                        color: white;
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        z-index: 10002;
                        box-shadow: 0 4px 16px rgba(93, 92, 222, 0.4);
                        transition: transform 0.2s, box-shadow 0.2s;
                    `;
                    bubblePill.innerHTML = `<span style="font-size: 24px;">💬</span>`;
                    
                    bubblePill.addEventListener('mouseenter', () => {
                        bubblePill.style.transform = 'scale(1.1)';
                    });
                    bubblePill.addEventListener('mouseleave', () => {
                        bubblePill.style.transform = 'scale(1)';
                    });
                    
                    document.body.appendChild(bubblePill);
                    
                    // Click to open full chat - re-detect account type at click time
                    bubblePill.addEventListener('click', () => {
                        bubblePill.remove();
                        
                        // Re-detect account type at click time (not creation time)
                        const accountTypeSelect = document.getElementById('account_type_c');
                        let currentIsKenwood = isKenwood; // fallback to cached value
                        
                        if (accountTypeSelect) {
                            const accountType = accountTypeSelect.value || accountTypeSelect.options[accountTypeSelect.selectedIndex]?.text || '';
                            const kenwoodPatterns = ['kenwood', 'ken', 'kw'];
                            const jvcPatterns = ['jvcKenwood'];
                            const lowerAccountType = accountType.toLowerCase();
                            currentIsKenwood = kenwoodPatterns.some(p => lowerAccountType.includes(p)) && !jvcPatterns.some(p => lowerAccountType.includes(p));
                            console.log('Account type re-detected on click:', accountType, '-> isKenwood:', currentIsKenwood);
                        }
                        
                        crmTools.openKBChatFull(currentModel, currentIsKenwood);
                    });
                });
            }
        }
    };
    
    // Run auto-create after page loads
    setTimeout(autoCreateBubble, 1000);

    // Set up mutation observer to detect new model selectors added dynamically
    const observer = new MutationObserver((mutations) => {
        let shouldRecheck = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if new node contains select elements
                        const hasSelects = node.tagName === 'SELECT' || 
                                          node.querySelectorAll('select').length > 0;
                        if (hasSelects) {
                            shouldRecheck = true;
                        }
                    }
                });
            }
        });
        
        if (shouldRecheck) {
            // Debounce the recheck to avoid excessive calls
            clearTimeout(window.modelRecheckTimeout);
            window.modelRecheckTimeout = setTimeout(() => {
                crmTools.enhanceModelSelectors({ silent: true });
                crmTools.setupCallDependencyAutomation();
                
                // Auto-create KB Chat bubble when model dropdown appears
                const modelDropdown = document.getElementById('model_c');
                if (modelDropdown && !document.getElementById('kbChatBubble')) {
                    const currentModel = modelDropdown.options[modelDropdown.selectedIndex]?.text || '';
                    if (currentModel) {
                        // Create persistent bubble pill
                        const bubblePill = document.createElement('div');
                        bubblePill.id = 'kbChatBubble';
                        bubblePill.style.cssText = `
                            position: fixed;
                            bottom: 20px;
                            left: 20px;
                            background: linear-gradient(135deg, #5D5CDE 0%, #7B7BEB 100%);
                            color: white;
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            z-index: 10002;
                            box-shadow: 0 4px 16px rgba(93, 92, 222, 0.4);
                            transition: transform 0.2s, box-shadow 0.2s;
                        `;
                        bubblePill.innerHTML = `<span style="font-size: 24px;">💬</span>`;
                        
                        bubblePill.addEventListener('mouseenter', () => {
                            bubblePill.style.transform = 'scale(1.1)';
                        });
                        bubblePill.addEventListener('mouseleave', () => {
                            bubblePill.style.transform = 'scale(1)';
                        });
                        
                        document.body.appendChild(bubblePill);
                        
                        // Click to open full chat
                        bubblePill.addEventListener('click', () => {
                            bubblePill.remove();
                            crmTools.openKBChatFull(currentModel, false);
                        });
                    }
                }
            }, 500);
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Restore form data if available
    window.addEventListener('load', () => {
        const backupData = sessionStorage.getItem('crmFormBackup');
        if (backupData) {
            try {
                const formData = JSON.parse(backupData);
                Object.keys(formData).forEach(key => {
                    const field = document.querySelector(`[name="${key}"], #${key}`);
                    if (field && !field.value) {
                        field.value = formData[key];
                    }
                });
                sessionStorage.removeItem('crmFormBackup');
                console.log('Form data restored from backup');
            } catch (e) {
                console.error('Error restoring form data:', e);
            }
        }
    });

})();
