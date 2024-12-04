// action-prompt.js

// Define the type of interaction map entries
class InteractionMapEntry {
    constructor(examples, callback, expectedVariables = null) {
        this.examples = examples;
        this.callback = callback;
        this.expectedVariables = expectedVariables; // Array of variable names to extract
    }
}

export class ActionPrompt {
    constructor() {
        this.initialized = false;
        this.model = null;
        this.session = null;
        this.interactionMap = new Map();
        this.init();
    }

    async init() {
        try {
            if (!('ai' in window)) {
                throw new Error('Chrome AI is not available. Please enable Chrome flags for Gemini Nano.');
            }
            
            // Create AI session with basic system prompt
            this.session = await window.ai.languageModel.create({
                systemPrompt: `You are a multilingual command interpreter that matches user input to specific actions.
                You can understand input in any language, but always respond in English.
                When variables are requested, extract them and return as JSON.
                Otherwise, respond only with the matching command key or null if no match is found.`
            });
            
            this.initialized = true;
            console.log("ActionPrompt initialized successfully with Chrome AI");
            return true;
        } catch (error) {
            console.error("Failed to initialize ActionPrompt:", error);
            throw error;
        }
    }

    // Command management methods
    addCommand(key, examples, callback, expectedVariables = null) {
        this.interactionMap.set(key, new InteractionMapEntry(examples, callback, expectedVariables));
    }

    removeCommand(key) {
        this.interactionMap.delete(key);
    }

    clearCommands() {
        this.interactionMap.clear();
    }

    async processInput(userInput) {
        if (!userInput.trim()) return null;

        try {
            if (!this.session) {
                throw new Error("AI session not initialized");
            }

            // First attempt with combined prompt
            const commandsWithDetails = Array.from(this.interactionMap.entries())
                .map(([key, entry]) => {
                    const examplesStr = `Similar phrases: ${entry.examples.map(ex => `"${ex}"`).join(', ')}`;
                    const varsStr = entry.expectedVariables ? 
                        `Expected variables: ${entry.expectedVariables.join(', ')}` : 
                        'No variables expected';
                    return `- Command "${key}": ${examplesStr}. ${varsStr}`;
                })
                .join('\n');

            const commands = Array.from(this.interactionMap.entries())
                .map(([key, entry]) => `"${key}"`).join(', ');

            const prompt = `USER INPUT: "${userInput}"

AVAILABLE COMMANDS:
${commandsWithDetails}

TASK:
1. Compare the user input against each command and its similar phrases
2. Find the command that most closely matches the user's intention from this list: ${commands}
3. If the matched command has expected variables, extract their values from the user input

RESPONSE FORMAT:
If the command has no variables, reply with only the command name.
If the command expects variables, reply with a JSON object matching this structure:
{
    "command": "commandName"
}
If no command matches, reply with "null"`;

            const response = await this.session.prompt(prompt);

            try {
                // Try parsing as JSON first (for commands with variables)
                const parsed = JSON.parse(response);
                if (parsed.command) {
                    // Check if we need to retry variable extraction
                    const commandEntry = this.interactionMap.get(parsed.command);
                    const hasUndefinedVariables = commandEntry.expectedVariables?.some(
                        varName => !parsed.variables || parsed.variables[varName] === undefined
                    );

                    if (hasUndefinedVariables) {
                        // Retry with specific variable extraction prompt
                        const variableStructure = commandEntry.expectedVariables.reduce((acc, varName) => {
                            acc[varName] = "";
                            return acc;
                        }, { command: parsed.command });

                        const varPrompt = `Extract the following information from: "${userInput}"
                            Return a JSON object exactly matching this structure: ${JSON.stringify(variableStructure)}
                            Only include values that are explicitly mentioned in the input.
                            Required variables: ${commandEntry.expectedVariables.join(', ')}`;

                        const varResponse = await this.session.prompt(varPrompt);

                        try {
                            const varParsed = JSON.parse(varResponse);
                            if (varParsed.command) {
                                return {
                                    action: varParsed.command,
                                    variables: varParsed
                                };
                            }
                        } catch (e) {
                            console.warn("Variable retry parsing failed, returning original response");
                        }
                    }

                    return {
                        action: parsed.command,
                        variables: parsed.variables
                    };
                }
            } catch (e) {
                // If not JSON, treat as simple command response
                const matchedCommand = this.parseAIResponse(response);
                return matchedCommand ? { action: matchedCommand } : null;
            }

            return null;

        } catch (error) {
            console.error("Error processing input:", error);
            throw error;
        }
    }

    parseAIResponse(response) {
        const cleaned = response.toLowerCase().trim();
        return Array.from(this.interactionMap.keys()).find(key => 
            cleaned.includes(key) || cleaned === key
        ) || null;
    }

    executeAction(actionData) {
        console.log("Executing action:", actionData);
        const action = this.interactionMap.get(actionData.action);
        if (action && typeof action.callback === 'function') {
            try {
                action.callback(actionData.variables);
            } catch (error) {
                console.error(`Error executing action ${actionData.action}:`, error);
                throw error;
            }
        } else {
            console.error("Invalid action or callback:", actionData.action);
            throw new Error(`Invalid action: ${actionData.action}`);
        }
    }
}