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

class SettingsDemo {
    constructor() {
        this.actionPrompt = new ActionPrompt();
        this.setupCommands();
        this.setupUI();
        this.loadSettings();
    }

    setupCommands() {
        // Theme commands
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
                "day mode"
            ],
            () => this.handleThemeSwitch("light")
        );

        this.actionPrompt.addCommand(
            "toggle_dark_mode",
            [
                "toggle dark mode",
                "switch dark mode",
            ],
            () => this.handleThemeSwitch()
        );

        this.actionPrompt.addCommand(
            "toggle_notifications_on",
            [
                "turn on notifications",
                "enable notifications",
            ],
            () => this.handleToggle('notifications', "on")
        );

        this.actionPrompt.addCommand(
            "toggle_notifications_off",
            [
                "turn off notifications",
                "disable notifications"
            ],
            () => this.handleToggle('notifications', "off")
        );

        this.actionPrompt.addCommand(
            "toggle_notifications",
            [
                "toggle notifications",
                "switch notifications",
            ],
            () => this.handleToggle('notifications')
        );

        this.actionPrompt.addCommand(
            "toggle_autoplay_on",
            [
                "turn on autoplay",
                "enable autoplay",
            ],
            () => this.handleToggle('autoplay', "on")
        );

        this.actionPrompt.addCommand(
            "toggle_autoplay_off",
            [
                "turn off autoplay",
                "disable autoplay"
            ],
            () => this.handleToggle('autoplay', "off")
        );

        this.actionPrompt.addCommand(
            "toggle_autoplay",
            [
                "toggle autoplay",
                "switch autoplay"
            ],
            () => this.handleToggle('autoplay')
        );

        // Quality command
        this.actionPrompt.addCommand(
            "set_quality",
            [
                "set quality to high",
                "change quality to medium",
                "set the quality to low",
                "quality high"
            ],
            (variables) => this.handleQualityChange(variables.quality),
            ["quality"]
        );

        // Save settings command
        this.actionPrompt.addCommand(
            "save_settings",
            [
                "save settings",
                "save my settings",
                "save changes",
                "apply settings",
                "apply preferences",
            ],
            () => this.saveSettings()
        );
    }

    setupUI() {
        const submitButton = document.getElementById('action-prompt-submit');
        const input = document.getElementById('action-prompt-input');
        const saveButton = document.getElementById('saveSettings');
        
        submitButton.addEventListener('click', () => this.handleUserInput());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
        saveButton.addEventListener('click', () => this.saveSettings());

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

    handleToggle(settingId, state) {
        if (!state) {
            state = !document.getElementById(settingId).checked ? 'on' : 'off';
        }
        const element = document.getElementById(settingId);
        if (element) {
            element.checked = state === 'on' || state === 'enable';
            const feedback = document.getElementById('action-prompt-feedback');
            feedback.textContent = `${settingId} ${element.checked ? 'enabled' : 'disabled'}`;
        }
    }

    handleQualityChange(value) {
        const qualitySelect = document.getElementById('quality');
        if (qualitySelect) {
            qualitySelect.value = value.toLowerCase();
            const feedback = document.getElementById('action-prompt-feedback');
            feedback.textContent = `Quality set to ${value}`;
        }
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        
        if (settings.notifications !== undefined) {
            document.getElementById('notifications').checked = settings.notifications;
        }
        if (settings.autoplay !== undefined) {
            document.getElementById('autoplay').checked = settings.autoplay;
        }
        if (settings.quality) {
            document.getElementById('quality').value = settings.quality;
        }
    }

    saveSettings() {
        const settings = {
            notifications: document.getElementById('notifications').checked,
            autoplay: document.getElementById('autoplay').checked,
            quality: document.getElementById('quality').value
        };

        localStorage.setItem('settings', JSON.stringify(settings));
        
        const feedback = document.getElementById('action-prompt-feedback');
        feedback.textContent = 'Settings saved successfully!';

        alert('Settings saved successfully!');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.settingsDemo = new SettingsDemo();
    initTheme();
}); 