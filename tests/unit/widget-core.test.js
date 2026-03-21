/**
 * Widget Core Functionality Tests
 * Tests the main CRM Tools Widget class and core features
 */

describe('CRMToolsWidget Core', () => {
    let widget;
    
    beforeEach(() => {
        // Reset DOM and create fresh widget instance
        document.body.innerHTML = '';
        widget = new CRMToolsWidget();
    });
    
    afterEach(() => {
        // Cleanup after each test
        if (widget) {
            const bubble = document.getElementById('crmChatBubble');
            if (bubble) bubble.remove();
        }
    });

    describe('Widget Initialization', () => {
        test('should create main button on initialization', () => {
            widget.createWidget();
            const mainButton = document.querySelector('[title="CRM Tools"]');
            expect(mainButton).toBeInTheDocument();
            expect(mainButton.innerHTML).toBe('🔧');
        });

        test('should initialize with correct default state', () => {
            expect(widget.isOpen).toBe(false);
            expect(widget.tools).toHaveLength(4);
            expect(widget.currentThreadId).toBeNull();
        });

        test('should load tools configuration correctly', () => {
            widget.loadTools();
            const expectedTools = [
                'chat-assistant',
                'copy-date', 
                'copy-url',
                'enhance-models'
            ];
            
            const toolIds = widget.tools.map(tool => tool.id);
            expect(toolIds).toEqual(expectedTools);
        });
    });

    describe('Tool Menu Functionality', () => {
        beforeEach(() => {
            widget.createWidget();
        });

        test('should toggle tools menu on main button click', () => {
            const mainButton = document.querySelector('[title="CRM Tools"]');
            const toolsContainer = widget.toolsContainer;
            
            // Initially closed
            expect(toolsContainer.style.display).toBe('none');
            
            // Click to open
            mainButton.click();
            expect(widget.isOpen).toBe(true);
            expect(toolsContainer.style.display).toBe('flex');
            expect(mainButton.innerHTML).toBe('×');
            
            // Click to close
            mainButton.click();
            expect(widget.isOpen).toBe(false);
            expect(toolsContainer.style.display).toBe('none');
            expect(mainButton.innerHTML).toBe('🔧');
        });

        test('should close tools when clicking outside', () => {
            const mainButton = document.querySelector('[title="CRM Tools"]');
            mainButton.click(); // Open tools
            
            expect(widget.isOpen).toBe(true);
            
            // Click outside
            document.body.click();
            expect(widget.isOpen).toBe(false);
        });
    });

    describe('Chat Interface Creation', () => {
        test('should create chat bubble with all components', () => {
            widget.createChatBubble();
            
            const chatBubble = document.getElementById('crmChatBubble');
            const chatContainer = document.getElementById('crmChatContainer');
            const messageInput = document.getElementById('crmMessageInput');
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const sendBtn = document.getElementById('crmSendBtn');
            const clearBtn = document.getElementById('crmClearBtn');
            
            expect(chatBubble).toBeInTheDocument();
            expect(chatContainer).toBeInTheDocument();
            expect(messageInput).toBeInTheDocument();
            expect(voiceBtn).toBeInTheDocument();
            expect(sendBtn).toBeInTheDocument();
            expect(clearBtn).toBeInTheDocument();
        });

        test('should have correct initial chat layout', () => {
            widget.createChatBubble();
            
            const chatBubble = document.getElementById('crmChatBubble');
            const computedStyle = window.getComputedStyle(chatBubble);
            
            expect(computedStyle.display).toBe('flex');
            expect(computedStyle.flexDirection).toBe('column');
            expect(computedStyle.position).toBe('fixed');
        });
    });

    describe('Chat Toggle Functionality', () => {
        test('should toggle chat visibility correctly', () => {
            // First call creates chat
            widget.toggleChatAssistant();
            const chatBubble = document.getElementById('crmChatBubble');
            expect(chatBubble).toBeInTheDocument();
            expect(chatBubble.style.display).toBe('flex');
            
            // Second call hides chat
            widget.toggleChatAssistant();
            expect(chatBubble.style.display).toBe('none');
            
            // Third call shows chat again
            widget.toggleChatAssistant();
            expect(chatBubble.style.display).toBe('flex');
        });

        test('should reinitialize functionality when reopening chat', () => {
            // Create and close chat
            widget.toggleChatAssistant();
            widget.toggleChatAssistant();
            
            // Spy on reinitializeChatBubble method
            const reinitializeSpy = jest.spyOn(widget, 'reinitializeChatBubble');
            
            // Reopen chat
            widget.toggleChatAssistant();
            
            expect(reinitializeSpy).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        test('should maintain widget state across operations', () => {
            widget.createChatBubble();
            widget.startNewThread();
            
            const initialThreadId = widget.currentThreadId;
            expect(initialThreadId).toBeDefined();
            
            // Close and reopen chat
            widget.toggleChatAssistant();
            widget.toggleChatAssistant();
            
            // Thread ID should persist
            expect(widget.currentThreadId).toBe(initialThreadId);
        });

        test('should handle multiple tool activations', () => {
            widget.createWidget();
            
            // Activate different tools
            const chatTool = widget.tools.find(t => t.id === 'chat-assistant');
            const copyDateTool = widget.tools.find(t => t.id === 'copy-date');
            
            expect(() => {
                chatTool.action.call(widget);
                copyDateTool.action.call(widget);
            }).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        test('should handle missing DOM elements gracefully', () => {
            // Test reinitialization with missing elements
            expect(() => {
                widget.reinitializeChatBubble();
            }).not.toThrow();
        });

        test('should handle invalid API configurations', () => {
            widget.setApiKey('invalid-provider', 'test-key');
            // Should not throw, should log warning
            expect(widget.apiConfig.poeApiKey).toBeNull();
        });
    });
});

/**
 * Widget Helper Functions Tests
 */
describe('Widget Helper Functions', () => {
    let widget;
    
    beforeEach(() => {
        widget = new CRMToolsWidget();
        widget.createChatBubble();
    });

    describe('Clear Button Management', () => {
        test('should show clear button when input has content', () => {
            const messageInput = document.getElementById('crmMessageInput');
            const clearBtn = document.getElementById('crmClearBtn');
            
            messageInput.value = 'test message';
            widget.updateClearButton();
            
            expect(clearBtn.style.display).toBe('flex');
        });

        test('should hide clear button when input is empty', () => {
            const messageInput = document.getElementById('crmMessageInput');
            const clearBtn = document.getElementById('crmClearBtn');
            
            messageInput.value = '';
            widget.updateClearButton();
            
            expect(clearBtn.style.display).toBe('none');
        });
    });

    describe('Reinitialization', () => {
        test('should properly reinitialize all components', () => {
            const messageInput = document.getElementById('crmMessageInput');
            const chatContainer = document.getElementById('crmChatContainer');
            
            // Set initial state
            messageInput.value = 'test';
            messageInput.style.height = '80px';
            
            widget.reinitializeChatBubble();
            
            // Should reset height and maintain content
            expect(messageInput.style.height).toBe('40px');
            expect(chatContainer.style.overflowY).toBe('auto');
        });
    });
});
