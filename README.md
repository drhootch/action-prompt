# ActionPrompt Developer Guide

A natural language processing plugin that uses Chrome AI (Gemini Nano) to interpret commands and execute corresponding actions. This plugin supports multilingual input and variable extraction.

> **Note**: this library can be integrated into **any web based JavaScript project** - whether it's a vanilla JavaScript project or a Framework based project (React, Vue, Svelte, etc.). Simply import the library and map natural language commands to your desired actions!

## How It Works

### Core Components

1. **AI Model Integration**
   - Uses Chrome's built-in Gemini Nano AI model
   - Initializes with a system prompt that configures the AI as a multilingual command interpreter

2. **Command Registry**
   - Stores commands in a Map structure where each entry contains:
     - Command key (identifier)
     - Example phrases
     - Callback function
     - Expected variables (optional)

### Processing Flow

1. **Input Processing**
   ```javascript
   // When user input is received:
   const result = await actionPrompt.processInput("my name is John Smith and I'm 30");
   ```

2. **AI Analysis**
   - Constructs a prompt containing:
     - User's input
     - Available commands and their example phrases
     - Expected variables (if any)
   - Sends to AI for interpretation
   - Example internal prompt:
   
   ```

   USER INPUT: "my name is John Smith and I'm 30"

   AVAILABLE COMMANDS:
   - Command "fill_form": Similar phrases: "my name is John Doe and I'm 25"...
     Expected variables: firstName, lastName, age
   - Command "toggle_theme": Similar phrases: "toggle theme"...
     No variables expected

   TASK:
   1. Compare user input against commands
   2. Find closest matching command
   3. Extract variables if required
   ```

3. **Variable Extraction**
   - If the matched command expects variables:
     - First attempt: Extracts variables from initial AI response
     - If variables are missing: Performs a second AI call specifically for variable extraction
     - Returns structured JSON with command and variables:
   ```javascript
   {
       action: "fill_form",
       variables: {
           firstName: "John",
           lastName: "Smith",
           age: "30"
       }
   }
   ```

4. **Action Execution**
   - Retrieves the registered callback for the matched command
   - Executes callback with extracted variables (if any)
   ```javascript
   actionPrompt.executeAction(result);
   ```

### Multilingual Support

- AI model inherently understands multiple languages
- System prompt configured to:
  - Accept input in any language
  - Normalize responses to English
  - Maintain consistent command matching

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