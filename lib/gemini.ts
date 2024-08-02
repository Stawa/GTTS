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
   * Model type to be used with the Google Generative AI service.
   */
  models: "gemini-1.5-pro" | "gemini-1.5-flash" | "gemini-1.0-pro";
  /**
   * A boolean flag indicates whether logger should be enabled.
   */
  logger?: boolean;
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
   * A boolean flag indicating whether logger are enabled.
   */
  public logger: boolean;

  /**
   * Constructs a new GoogleGemini instance.
   * @param components Additional components to set the GoogleGemini instance setup.
   */
  constructor(components?: GeminiComponents) {
    if (!components?.apiKey) {
      throw new Error("API key is missing. Please provide a valid API key.");
    }

    this.apiKey = components.apiKey;
    this.logger = components.logger ?? false;
    this.client = new GoogleGenerativeAI(this.apiKey);
    this.model = this.client.getGenerativeModel({
      model: components.models,
    });
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
   * When logger is enabled, creates a logger using the information provided.
   * @param info Information to be logged. It can be a string or an array of strings.
   */
  private createLog(info: string[] | string): void {
    if (!this.logger) return;

    const prefix =
      typeof info === "string"
        ? `* ${info}`
        : info.map((line) => `* ${line}`).join("\n");
    console.log(`[DEBUG GoogleGemini]\n${prefix}`);
  }
}
