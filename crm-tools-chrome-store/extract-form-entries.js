// Utility to extract Google Form entry IDs
// Usage: Run in browser console on the form page

(function() {
    // Parse entry IDs from current page DOM
    function extractFromDOM() {
        const entries = {};
        
        // Find all form inputs with entry.* names
        document.querySelectorAll('input[name^="entry."], textarea[name^="entry."], select[name^="entry."]').forEach((el, index) => {
            const name = el.getAttribute('name');
            const match = name.match(/entry\.(\d+)/);
            if (match) {
                const entryId = match[1];
                // Try to find label
                let label = `Field ${index + 1}`;
                const parent = el.closest('.freebirdFormViewerViewItemHeader') || el.closest('div[data-item-id]');
                if (parent) {
                    const h3 = parent.querySelector('h1, h3, .exportLabel');
                    if (h3) label = h3.textContent.trim();
                }
                entries[entryId] = label;
            }
        });
        
        return entries;
    }
    
    // Construct POST URL
    function getPostUrl() {
        return window.location.href.replace('/viewform', '/formResponse');
    }
    
    // Run extraction
    const entries = extractFromDOM();
    const postUrl = getPostUrl();
    
    console.log('=== Google Form Entry IDs ===');
    console.log('POST URL:', postUrl);
    console.log('\nEntry IDs:');
    for (const [id, label] of Object.entries(entries)) {
        console.log(`  ${label}: entry.${id}`);
    }
    
    // Store for easy access
    window.__formEntries = entries;
    window.__formPostUrl = postUrl;
    console.log('\nStored in window.__formEntries and window.__formPostUrl');
    
    return { entries, postUrl };
})();
