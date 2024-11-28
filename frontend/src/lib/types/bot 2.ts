import { Mistral } from "@mistralai/mistralai";
import User from './user';

// Load the API key from environment variables or provide a default
const apiKey = process.env.MISTRAL_API_KEY || "u1vZer1kMuEAwTSXIY0QZIgXZor6NBWQ";
if (!apiKey) {
  throw new Error("MISTRAL_API_KEY environment variable is not set!");
}

// Initialize the Mistral client
const client = new Mistral({ apiKey });

// Define the model
const model = "mistral-large-latest";

// Bot Class
export default class Bot {
  private name: string;
  private email: string;

  constructor(name: string = "BotAgent", email: string = "bot@bot.com") {
    this.name = name;
    this.email = email;
  }

  // Simulate bot creation (e.g., could be extended to register bot on a system)
  static async createBot(): Promise<Bot> {
    console.log(`Creating bot user with nickname: "BotAgent" and email: "bot@bot.com".`);
    return new Bot();
  }

  // Chat function
  async chat() {
    console.log(`Chat started with ${this.name}. Type your message below (type 'exit' to quit).`);

    // Define the message type locally
    type Message = {
      role: "system" | "user" | "assistant";
      content: string;
    };

    // Initialize message history with the correct type
    const messages: Message[] = [
      { role: "system", content: "You are a helpful and friendly chatbot." },
    ];

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = (question: string): Promise<string> => {
      return new Promise((resolve) => rl.question(question, resolve));
    };

    while (true) {
      const userInput = await askQuestion("> ");
      if (userInput.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        break;
      }

      // Add user's input to the message history
      messages.push({ role: "user", content: userInput });

      try {
        // Send the conversation to the Mistral API
        const chatResponse = await client.chat.complete({
          model,
          messages,
          temperature: 0.7, // Adjust for randomness
        });

        // Ensure choices exist and are valid
        const assistantResponse = chatResponse.choices?.[0]?.message?.content;
        if (!assistantResponse || typeof assistantResponse !== "string") {
          console.error("No valid response from the assistant.");
          continue;
        }

        console.log(`Bot (${this.name}): ${assistantResponse}`);

        // Add the assistant's response to the history
        messages.push({ role: "assistant", content: assistantResponse });
      } catch (error) {
        console.error("An error occurred:", error);
        rl.close();
        break;
      }
    }
  }
}

// Example usage
(async () => {
  const bot = await Bot.createBot();
  await bot.chat();
})();
