/**
 * Voice Recognition System Tests
 * Tests speech input functionality and continuous recognition
 */

describe('Voice Recognition System', () => {
    let widget;
    let mockSpeechRecognition;
    
    beforeEach(() => {
        // Mock Web Speech API
        mockSpeechRecognition = {
            continuous: false,
            interimResults: false,
            lang: '',
            maxAlternatives: 1,
            start: jest.fn(),
            stop: jest.fn(),
            abort: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            onstart: null,
            onend: null,
            onresult: null,
            onerror: null
        };
        
        global.SpeechRecognition = jest.fn(() => mockSpeechRecognition);
        global.webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition);
        
        // Create widget with speech support
        document.body.innerHTML = '';
        widget = new CRMToolsWidget();
        widget.createChatBubble();
    });
    
    afterEach(() => {
        delete global.SpeechRecognition;
        delete global.webkitSpeechRecognition;
    });

    describe('Speech Recognition Setup', () => {
        test('should initialize speech recognition with correct settings', () => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const messageInput = document.getElementById('crmMessageInput');
            
            widget.setupSpeechRecognition(voiceBtn, messageInput);
            
            expect(widget.recognition).toBeDefined();
            expect(widget.recognition.continuous).toBe(true);
            expect(widget.recognition.interimResults).toBe(true);
            expect(widget.recognition.lang).toBe('en-US');
            expect(widget.isRecording).toBe(false);
            expect(widget.speechBuffer).toBe('');
        });

        test('should hide voice button when speech recognition not supported', () => {
            // Remove speech recognition support
            delete global.SpeechRecognition;
            delete global.webkitSpeechRecognition;
            
            const voiceBtn = document.getElementById('crmVoiceBtn');
            widget.setupSpeechRecognition(voiceBtn, document.getElementById('crmMessageInput'));
            
            expect(voiceBtn.style.display).toBe('none');
        });
    });

    describe('Recording State Management', () => {
        beforeEach(() => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const messageInput = document.getElementById('crmMessageInput');
            widget.setupSpeechRecognition(voiceBtn, messageInput);
        });

        test('should start recording when voice button clicked', () => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            
            expect(widget.isRecording).toBe(false);
            
            voiceBtn.click();
            
            expect(mockSpeechRecognition.start).toHaveBeenCalled();
        });

        test('should stop recording when voice button clicked while recording', () => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            
            // Start recording
            widget.isRecording = true;
            voiceBtn.click();
            
            expect(mockSpeechRecognition.stop).toHaveBeenCalled();
        });

        test('should update voice button appearance during recording', () => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            
            widget.updateVoiceButton(voiceBtn, true);
            expect(voiceBtn.classList.contains('recording')).toBe(true);
            expect(voiceBtn.style.background).toContain('#dc3545');
            
            widget.updateVoiceButton(voiceBtn, false);
            expect(voiceBtn.classList.contains('recording')).toBe(false);
            expect(voiceBtn.style.background).toContain('#28a745');
        });
    });

    describe('Speech Recognition Events', () => {
        beforeEach(() => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const messageInput = document.getElementById('crmMessageInput');
            widget.setupSpeechRecognition(voiceBtn, messageInput);
        });

        test('should handle speech recognition start event', () => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            
            // Simulate onstart event
            if (widget.recognition.onstart) {
                widget.recognition.onstart();
            }
            
            expect(widget.isRecording).toBe(true);
        });

        test('should handle final speech results correctly', () => {
            const messageInput = document.getElementById('crmMessageInput');
            const mockEvent = {
                resultIndex: 0,
                results: [{
                    0: { transcript: 'Hello world' },
                    isFinal: true
                }]
            };
            
            // Clear initial state
            widget.speechBuffer = '';
            messageInput.value = '';
            
            // Simulate speech result
            if (widget.recognition.onresult) {
                widget.recognition.onresult(mockEvent);
            }
            
            expect(widget.speechBuffer).toBe('Hello world');
            expect(messageInput.value).toBe('Hello world');
        });

        test('should accumulate multiple speech segments', () => {
            const messageInput = document.getElementById('crmMessageInput');
            
            // First speech segment
            widget.speechBuffer = 'Hello';
            const mockEvent1 = {
                resultIndex: 1,
                results: [
                    null, // resultIndex 0 already processed
                    {
                        0: { transcript: ' world' },
                        isFinal: true
                    }
                ]
            };
            
            if (widget.recognition.onresult) {
                widget.recognition.onresult(mockEvent1);
            }
            
            expect(widget.speechBuffer).toBe('Hello world');
        });

        test('should handle interim speech results', () => {
            const messageInput = document.getElementById('crmMessageInput');
            const mockEvent = {
                resultIndex: 0,
                results: [{
                    0: { transcript: 'Hello...' },
                    isFinal: false
                }]
            };
            
            widget.speechBuffer = 'Previous text';
            
            if (widget.recognition.onresult) {
                widget.recognition.onresult(mockEvent);
            }
            
            // Should show interim result but not add to buffer
            expect(messageInput.value).toBe('Previous text Hello...');
            expect(widget.speechBuffer).toBe('Previous text');
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const messageInput = document.getElementById('crmMessageInput');
            widget.setupSpeechRecognition(voiceBtn, messageInput);
        });

        test('should handle no-speech error gracefully', () => {
            const mockError = { error: 'no-speech' };
            
            expect(() => {
                if (widget.recognition.onerror) {
                    widget.recognition.onerror(mockError);
                }
            }).not.toThrow();
        });

        test('should handle network errors', () => {
            const mockError = { error: 'network' };
            
            expect(() => {
                if (widget.recognition.onerror) {
                    widget.recognition.onerror(mockError);
                }
            }).not.toThrow();
        });

        test('should stop recording on permission denied', () => {
            widget.isRecording = true;
            const mockError = { error: 'not-allowed' };
            
            if (widget.recognition.onerror) {
                widget.recognition.onerror(mockError);
            }
            
            expect(widget.isRecording).toBe(false);
        });
    });

    describe('Continuous Recognition', () => {
        beforeEach(() => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const messageInput = document.getElementById('crmMessageInput');
            widget.setupSpeechRecognition(voiceBtn, messageInput);
        });

        test('should restart recognition automatically when still recording', () => {
            widget.isRecording = true;
            const startSpy = jest.spyOn(widget.recognition, 'start');
            
            // Simulate recognition end
            if (widget.recognition.onend) {
                widget.recognition.onend();
            }
            
            expect(startSpy).toHaveBeenCalled();
        });

        test('should not restart recognition when recording stopped', () => {
            widget.isRecording = false;
            const startSpy = jest.spyOn(widget.recognition, 'start');
            
            // Simulate recognition end
            if (widget.recognition.onend) {
                widget.recognition.onend();
            }
            
            expect(startSpy).not.toHaveBeenCalled();
        });
    });

    describe('Clear Button Integration', () => {
        beforeEach(() => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const messageInput = document.getElementById('crmMessageInput');
            widget.setupSpeechRecognition(voiceBtn, messageInput);
        });

        test('should show clear button when voice input adds text', () => {
            const messageInput = document.getElementById('crmMessageInput');
            const clearBtn = document.getElementById('crmClearBtn');
            const mockEvent = {
                resultIndex: 0,
                results: [{
                    0: { transcript: 'Test speech' },
                    isFinal: true
                }]
            };
            
            // Initially hidden
            expect(clearBtn.style.display).toBe('none');
            
            // Speech adds text
            if (widget.recognition.onresult) {
                widget.recognition.onresult(mockEvent);
            }
            
            expect(clearBtn.style.display).toBe('flex');
        });

        test('should clear speech buffer when clear button clicked', () => {
            const messageInput = document.getElementById('crmMessageInput');
            const clearBtn = document.getElementById('crmClearBtn');
            
            // Add some speech content
            widget.speechBuffer = 'Test content';
            messageInput.value = 'Test content';
            
            clearBtn.click();
            
            expect(widget.speechBuffer).toBe('');
            expect(messageInput.value).toBe('');
        });
    });

    describe('Input Field Integration', () => {
        test('should preserve manually typed text with voice input', () => {
            const voiceBtn = document.getElementById('crmVoiceBtn');
            const messageInput = document.getElementById('crmMessageInput');
            widget.setupSpeechRecognition(voiceBtn, messageInput);
            
            // User types some text
            messageInput.value = 'Typed text ';
            widget.speechBuffer = 'Typed text ';
            
            // Then uses voice input
            const mockEvent = {
                resultIndex: 0,
                results: [{
                    0: { transcript: 'spoken text' },
                    isFinal: true
                }]
            };
            
            if (widget.recognition.onresult) {
                widget.recognition.onresult(mockEvent);
            }
            
            expect(messageInput.value).toBe('Typed text spoken text');
        });
    });
});
