import axios from "axios";

interface SummarizeTextComponents {
  /**
   * API Token for accessing the Deepgram and Edenai APIs.
   */
  apiTokens: {
    Deepgram: string;
    Edenai: string;
  };
  /**
   * A boolean flag indicates whether logger is enabled.
   */
  logger?: boolean;
}

interface EdenaiResponse {
  /**
   * The summarized result.
   */
  result: string;
  /**
   * The cost of the summarization operation.
   */
  cost: number;
}

interface EdenaiComponents {
  /**
   * The text to summarize.
   */
  text: string;
  /**
   * The provider to use for summarization.
   */
  providers: "openai" | "cohere" | "alephalpha" | "nlpcloud" | "anthropic";
  /**
   * The language code of the text.
   */
  languageCode: string;
  /**
   * The number of output sentences desired in the summarized text.
   */
  output_sentences: number;
}

/**
 * The SummarizeText class provides methods to summarize text using the Deepgram and Edenai APIs.
 */
export class SummarizeText {
  /**
   * The API URLs for Deepgram and Edenai.
   * @private
   */
  private readonly apiUrl: { Deepgram: string; Edenai: string };
  /**
   * The API tokens for accessing the Deepgram and Edenai APIs.
   * @public
   */
  public apiTokens: { Deepgram: string; Edenai: string };
  /**
   * A boolean flag indicates whether logging is enabled.
   * @public
   */
  public logger: boolean;

  constructor(components: SummarizeTextComponents) {
    this.apiUrl = {
      Deepgram: "https://api.deepgram.com/v1/read",
      Edenai: "https://api.edenai.run/v2/text/summarize",
    };
    this.apiTokens = components.apiTokens;
    this.logger = components.logger ?? false;
  }

  /**
   * Summarizes the provided text using the Edenai API.
   * @param components An object containing the text to summarize, the provider, and the language code.
   * @returns A Promise that resolves with the summarized text object.
   */
  public async edenai(components: EdenaiComponents): Promise<EdenaiResponse> {
    const postRequest = await axios.post(
      this.apiUrl.Edenai,
      {
        output_sentences: components.output_sentences,
        providers: components.providers,
        text: components.text,
        language: components.languageCode,
      },
      {
        headers: {
          authorization: `Bearer ${this.apiTokens.Edenai}`,
        },
      }
    );
    const response: EdenaiResponse = postRequest.data[components.providers];
    this.createLog(response);
    return response;
  }

  /**
   * Summarizes the provided text using the Deepgram API.
   * @param text The text to summarize.
   * @param languageCode The language code of the text.
   * @returns A Promise that resolves with the summarized text.
   */
  public async deepgram(text: string, languageCode: string): Promise<string> {
    const postRequest = await axios.post(
      `${this.apiUrl.Deepgram}?language=${languageCode}&summarize=v2`,
      { text },
      {
        headers: {
          Authorization: `Token ${this.apiTokens.Deepgram}`,
          "Content-Type": "application/json",
        },
      }
    );
    const response = postRequest.data.results.summary.text;
    this.createLog(response);
    return response;
  }

  /**
   * Logs the provided information if logging is enabled.
   * @param info Information to be logged. Can be a string or an EdenaiResponse object.
   */
  private createLog(info: EdenaiResponse | string): void {
    if (!this.logger) return;

    const prefix =
      typeof info == "object"
        ? `* Results: ${info.result}\nCosts: ${info.cost}`
        : `* Results: ${info}`;

    console.log(`[DEBUG GoogleGemini]\n${prefix}`);
  }
}
