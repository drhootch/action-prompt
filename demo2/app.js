import { ActionPrompt } from '../action-prompt.js';

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('theme-toggle-btn');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

class FormDemo {
    constructor() {
        this.actionPrompt = new ActionPrompt();
        this.setupCommands();
        this.setupUI();
    }

    setupCommands() {
        this.actionPrompt.addCommand(
            "fill_form",
            [
                "my name is John Doe and I'm 25",
                "I am Jane Smith, 30 years old from Italy",
                "Fill the form with name Mohamed Ali age 27",
                "I'm Alice Brown, I'm from France and I like coffee"
            ],
            (variables) => this.fillForm(variables),
            ["firstName", "lastName", "age", "country","drink"] // Expected variables
        );
        
        this.actionPrompt.addCommand(
            "dark_mode",
            [
                "switch to dark mode",
                "turn on dark mode",
                "enable dark mode",
                "night mode"
            ],
            () => this.handleThemeSwitch("dark")
        );
        
        this.actionPrompt.addCommand(
            "light_mode",
            [
                "switch to light mode",
                "turn on light mode",
                "enable light mode",
                "daylight mode"
            ],
            () => this.handleThemeSwitch("light")
        );

        this.actionPrompt.addCommand(
            "toggle_theme",
            [
                "toggle theme",
                "switch theme"
            ],
            () => this.handleThemeSwitch()
        );
    }

    fillForm(variables) {
        if (!variables) return;
        
        const fields = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            age: document.getElementById('age'),
            country: document.getElementById('country'),
            drink: document.getElementById('drink')
        };

        Object.entries(fields).forEach(([key, field]) => {
            if (variables[key]) {
                field.value = variables[key];
            }
        });
    }

    setupUI() {
        const submitButton = document.getElementById('action-prompt-submit');
        const input = document.getElementById('action-prompt-input');
        input.placeholder = "Say something...";
        
        submitButton.addEventListener('click', () => this.handleUserInput());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });

        this.actionPrompt.init()
            .catch(error => {
                const feedback = document.getElementById('action-prompt-feedback');
                feedback.textContent = `Error: ${error.message}`;
            });
    }

    async handleUserInput() {
        const input = document.getElementById('action-prompt-input');
        const feedback = document.getElementById('action-prompt-feedback');
        
        if (!input.value.trim()) return;

        try {
            const result = await this.actionPrompt.processInput(input.value);
            
            if (result) {
                feedback.textContent = `Processing: ${result.action}`;
                this.actionPrompt.executeAction(result);
            } else {
                feedback.textContent = "Sorry, I couldn't understand that command.";
            }
        } catch (error) {
            console.error("Error processing input:", error);
            feedback.textContent = `Error: ${error.message}`;
        }

        input.value = '';
    }

    handleThemeSwitch(mode) {
        if (!mode) {
            mode = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        }

        const isDarkMode = mode?.toLowerCase().includes('dark');
        const newTheme = isDarkMode ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const feedback = document.getElementById('action-prompt-feedback');
        feedback.textContent = `Switched to ${newTheme} mode`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.formDemo = new FormDemo();
    initTheme();
}); 