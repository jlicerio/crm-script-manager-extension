// Popup script for the CRM Tools Extension
document.addEventListener('DOMContentLoaded', async () => {
    const statusEl = document.getElementById('status');
    const openToolsBtn = document.getElementById('openTools');
    const scanPageBtn = document.getElementById('scanPage');
    const viewStatusBtn = document.getElementById('viewStatus');
    const devModeToggle = document.getElementById('devModeToggle');
    const devToolsSection = document.getElementById('devToolsSection');

    // Load dev mode state from storage
    const stored = await chrome.storage.local.get(['devModeEnabled']);
    const devModeEnabled = stored.devModeEnabled || false;
    devModeToggle.checked = devModeEnabled;
    if (devModeEnabled) {
        devToolsSection.classList.add('visible');
    }

    // Dev mode toggle handler
    devModeToggle.addEventListener('change', async () => {
        const enabled = devModeToggle.checked;
        await chrome.storage.local.set({ devModeEnabled: enabled });
        if (enabled) {
            devToolsSection.classList.add('visible');
        } else {
            devToolsSection.classList.remove('visible');
        }
        // Notify content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { type: 'DEV_MODE_TOGGLE', enabled });
    });

    // Check if we're on the CRM page
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const isCRMPage = tab.url && tab.url.includes('crm.nexgenexpert.com');
        
        if (isCRMPage) {
            statusEl.textContent = '✅ CRM Tools Active';
            statusEl.className = 'status active';
        } else {
            statusEl.textContent = '❌ Not on CRM page';
            statusEl.className = 'status';
            // Disable CRM-specific button
            openToolsBtn.disabled = true;
            openToolsBtn.style.opacity = '0.5';
        }

    } catch (error) {
        statusEl.textContent = '❌ Error checking status';
        console.error('Error:', error);
    }

    // Button handlers
    openToolsBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Inject script to trigger the tools widget
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (window.crmTools && !window.crmTools.isOpen) {
                    window.crmTools.toggleTools();
                }
            }
        });
        
        window.close();
    });

    scanPageBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { type: 'SCAN_PAGE' });
        window.close();
    });

    viewStatusBtn.addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isCRMPage = tab.url && tab.url.includes('crm.nexgenexpert.com');
            
            const toolsStatus = isCRMPage ? 'Active on CRM page' : 'Waiting for CRM page';
            
            alert(`CRM Tools Extension Status:

🔧 Tools Widget: ${toolsStatus}
🌐 Current Page: ${isCRMPage ? 'CRM Site' : 'Other Site'}
📅 Last Updated: ${new Date().toLocaleString()}

The tools widget appears as a floating 🔧 button on CRM pages.`);
        } catch (error) {
            alert('Error checking status: ' + error.message);
        }
    });
});
