import { ActionPrompt } from '../action-prompt.js';

class BasicDemo {
    constructor() {
        this.actionPrompt = new ActionPrompt();
        this.setupCommands();
        this.setupUI();
    }

    setupCommands() {
        // Configure available commands
        this.actionPrompt.addCommand(
            "open_settings",
            [
                "open settings",
                "show settings",
                "go to settings",
                "open configuration",
                "settings please"
            ],
            () => window.demoFunctions.openSettings()
        );

        this.actionPrompt.addCommand(
            "save_document",
            [
                "save my work",
                "save document",
                "save changes",
                "save this page",
                "save progress"
            ],
            () => window.demoFunctions.saveDocument()
        );
    }

    setupUI() {
        const submitButton = document.getElementById('action-prompt-submit');
        const input = document.getElementById('action-prompt-input');
        input.placeholder = "Type a command in any language...";
        
        submitButton.addEventListener('click', () => this.handleUserInput());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });

        this.actionPrompt.init()
            .catch(error => {
                const feedback = document.getElementById('action-prompt-feedback');
                feedback.textContent = `Error: ${error.message}. Make sure to:
                    1. Use Chrome Canary (v128+)
                    2. Enable chrome://flags/#optimization-guide-on-device-model
                    3. Enable chrome://flags/#prompt-api-for-gemini-nano
                    4. Restart browser`;
            });
    }

    async handleUserInput() {
        const input = document.getElementById('action-prompt-input');
        const feedback = document.getElementById('action-prompt-feedback');
        
        if (!input.value.trim()) return;

        try {
            const action = await this.actionPrompt.processInput(input.value);
            
            if (action) {
                feedback.textContent = `Executing: ${action}`;
                this.actionPrompt.executeAction(action);
            } else {
                feedback.textContent = "Sorry, I couldn't understand that command.";
            }
        } catch (error) {
            console.error("Error processing input:", error);
            feedback.textContent = `Error: ${error.message}`;
        }

        input.value = '';
    }
}

// Initialize the demo application
window.addEventListener('DOMContentLoaded', () => {
    window.basicDemo = new BasicDemo();
});
