import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

/**
 * Configuration options for the GoogleGemini class.
 */
interface GeminiConfig {
  /** API key for accessing the Google Generative AI service. */
  apiKey: string;
  /** Model type to be used with the Google Generative AI service. */
  model:
    | "gemini-1.5-pro-latest"
    | "gemini-1.5-flash-latest"
    | "gemini-1.5-pro"
    | "gemini-1.5-flash"
    | "gemini-1.0-pro"
    | "gemini-pro-vision"
    | "gemini-pro";
  /** Whether to enable logging. Defaults to false. */
  enableLogging?: boolean;
}

/**
 * Wrapper class for interacting with Google's Generative AI service (Gemini).
 * Provides methods for generating text responses based on prompts.
 */
export class GoogleGemini {
  private readonly client: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly enableLogging: boolean;

  /**
   * Creates a new GoogleGemini instance.
   * @param config - Configuration options for the GoogleGemini instance.
   * @throws {Error} If the API key is missing.
   */
  constructor(config: GeminiConfig) {
    if (!config.apiKey) {
      throw new Error("API key is missing. Please provide a valid API key.");
    }

    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = this.client.getGenerativeModel({ model: config.model || "gemini-1.5-flash" });
    this.enableLogging = config.enableLogging ?? false;
  }

  /**
   * Generates a response based on the given prompt using the Google Generative AI service.
   * @param prompt - The input prompt for generating the response.
   * @returns A Promise that resolves to the generated response text.
   */
  public async generateResponse(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    this.log([`User Prompt: ${prompt}`, `Generated Response: ${response}`]);

    return response;
  }

  /**
   * Logs information if logging is enabled.
   * @param info - Information to be logged. Can be a string or an array of strings.
   */
  private log(info: string | string[]): void {
    if (!this.enableLogging) return;

    const logMessage = Array.isArray(info)
      ? info.map((line) => `* ${line}`).join("\n")
      : `* ${info}`;

    console.log(`[DEBUG GoogleGemini]\n${logMessage}`);
  }
}
