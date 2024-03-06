import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

interface GeminiComponents {
  apiKey?: string;
  debugLog?: boolean;
}

export class GoogleGemini {
  public client: GoogleGenerativeAI;
  public model: GenerativeModel;
  public apiKey: string | undefined;
  public debugLog: boolean;

  constructor(components?: GeminiComponents) {
    this.apiKey = components?.apiKey || process.env.GEMINI_API_KEY;
    this.debugLog = components?.debugLog || false;
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

  public async chat(prompt: string) {
    const getResponse = await this.model.generateContent(prompt);
    const response = getResponse.response.text();
    this.createLog([
      `User Prompt: ${prompt}`,
      `Original Response: ${response}`,
    ]);
    return response;
  }

  private createLog(text: string[] | string) {
    if (!this.debugLog) return;

    const prefix =
      typeof text === "string"
        ? `* ${text}`
        : text.map((line) => `* ${line}`).join("\n");
    console.log(`[DEBUG GoogleGemini]\n${prefix}`);
  }
}
