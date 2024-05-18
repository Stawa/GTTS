import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

/**
 * Interface for the components that can be passed to the GoogleGemini constructor.
 */
interface GeminiComponents {
  /**
   * API key for accessing the Google Generative AI service.
   */
  apiKey: string;
  /**
   * A boolean flag indicates whether debug logs should be enabled.
   */
  debugLog?: boolean;
}

/**
 * The Google Generative AI service (Gemini) is wrapped by the GoogleGemini class.
 * It provides text generation in response to prompts via interaction with the Gemini API.
 */
export class GoogleGemini {
  /**
   * Instance of GoogleGenerativeAI client.
   */
  public client: GoogleGenerativeAI;
  /**
   * Instance of GenerativeModel.
   */
  public model: GenerativeModel;
  /**
   * API key for accessing the Google Generative AI service.
   */
  public apiKey: string | undefined;
  /**
   * A boolean flag indicating whether debug logs are enabled.
   */
  public debugLog: boolean;

  /**
   * Constructs a new GoogleGemini instance.
   * @param components Additional components to set the GoogleGemini instance setup.
   */
  constructor(components?: GeminiComponents) {
    this.apiKey = components?.apiKey;
    this.debugLog = components?.debugLog ?? false;
    this.client = this.apiKey
      ? new GoogleGenerativeAI(this.apiKey)
      : (() => {
          console.error(
            "GEMINI_API_KEY is missing. Please provide a valid API key."
          );
          process.exit(1);
        })();
    this.model = this.client.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Utilizing the Google Generative AI service, it generates a response based on the given prompt.
   * @param prompt The prompt for generating the response.
   * @returns A Promise that resolves to the generated response.
   */
  public async chat(prompt: string): Promise<string> {
    const getResponse = await this.model.generateContent(prompt);
    const response = getResponse.response.text();
    this.createLog([
      `User Prompt: ${prompt}`,
      `Original Response: ${response}`,
    ]);
    return response;
  }

  /**
   * When debug logging is enabled, creates a debug log using the information provided.
   * @param info Information to be logged. It can be a string or an array of strings.
   */
  private createLog(info: string[] | string): void {
    if (!this.debugLog) return;

    const prefix =
      typeof info === "string"
        ? `* ${info}`
        : info.map((line) => `* ${line}`).join("\n");
    console.log(`[DEBUG GoogleGemini]\n${prefix}`);
  }
}
