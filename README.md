# ActionPrompt Plugin Developer Guide

A natural language processing plugin that uses Chrome AI (Gemini Nano) to interpret commands and execute corresponding actions. This plugin supports multilingual input and variable extraction.

## Prerequisites

- Chrome browser with Gemini Nano enabled
- Chrome AI flags enabled

## Basic Usage

### 1. Initialize the Plugin

```javascript
import { ActionPrompt } from './action-prompt.js';

const actionPrompt = new ActionPrompt();
await actionPrompt.init();
```

### 2. Adding Commands

Commands can be added with or without variable extraction:
```javascript
// Simple command without variables
actionPrompt.addCommand(
    "light_mode", // Command key
    [ // Example phrases
        "switch to light mode",
        "turn on light mode",
        "enable light mode"
    ],
    () => handleLightMode() // Callback function
);

// Command with variable extraction
actionPrompt.addCommand(
    "fill_form", // Command key
    [ // Example phrases
        "my name is John Doe and I'm 25",
        "I am Jane Smith, 30 years old from Italy"
    ],
    (variables) => handleFormFill(variables), // Callback with variables
    ["firstName", "lastName", "age", "country"] // Expected variables
);
```

### 3. Processing User Input

```javascript
const result = await actionPrompt.processInput("switch to dark mode");
if (result) {
    actionPrompt.executeAction(result);
}
```

## Command Management

```javascript
// Remove a specific command
actionPrompt.removeCommand("command_key");

// Clear all commands
actionPrompt.clearCommands();
```

## Error Handling

```javascript
try {
    const result = await actionPrompt.processInput(userInput);
    if (result) {
        actionPrompt.executeAction(result);
    } else {
        console.log("Command not recognized");
    }
} catch (error) {
    console.error("Error processing input:", error);
}
```

## Complete Example

```javascript
class MyApp {
    constructor() {
        this.actionPrompt = new ActionPrompt();
        this.setupCommands();
    }

    setupCommands() {
        // Form filling command
        this.actionPrompt.addCommand(
            "fill_form",
            [
                "my name is John Doe and I'm 25",
                "I am Jane Smith, 30 years old from Italy"
            ],
            (variables) => this.fillForm(variables),
            ["firstName", "lastName", "age", "country"]
        );

        // Theme switching command
        this.actionPrompt.addCommand(
            "toggle_theme",
            ["toggle theme", "switch theme"],
            () => this.handleThemeSwitch()
        );
    }

    async handleUserInput(input) {
        try {
            const result = await this.actionPrompt.processInput(input);
            if (result) {
                this.actionPrompt.executeAction(result);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}
```

## Best Practices

1. **Example Phrases**: Provide diverse example phrases for better command matching
2. **Variable Names**: Use clear, descriptive names for variables
3. **Error Handling**: Always implement proper error handling
4. **Initialization**: Wait for the plugin to initialize before processing input
5. **Command Keys**: Use lowercase, underscore-separated strings for command keys

## Limitations

- Requires Chrome browser with Gemini Nano enabled
- Internet connection required for AI processing
- Variable extraction accuracy depends on input clarity

## Browser Support

- Chrome (with AI flags enabled)
- Other browsers: Not supported