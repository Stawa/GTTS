import axios, { type AxiosResponse } from "axios";

interface SummarizeTextComponents {
  /**
   * API Tokens for accessing the Deepgram and Edenai APIs.
   */
  apiTokens: {
    Deepgram: string;
    Edenai: string;
  };
  /**
   * Enables logging when set to true.
   */
  logger?: boolean;
}

interface EdenaiResponse {
  /**
   * The summarized text result.
   */
  result: string;
  /**
   * The cost of the summarization operation.
   */
  cost: number;
}

interface EdenaiComponents {
  /**
   * The text to be summarized.
   */
  text: string;
  /**
   * The AI provider to use for summarization.
   */
  providers: "openai" | "cohere" | "alephalpha" | "nlpcloud" | "anthropic";
  /**
   * The ISO language code of the input text.
   */
  languageCode: string;
  /**
   * The desired number of sentences in the summarized output.
   */
  output_sentences: number;
}

/**
 * The SummarizeText class provides methods to summarize text using the Deepgram and Edenai APIs.
 */
export class SummarizeText {
  /**
   * The base URLs for the Deepgram and Edenai APIs.
   * @private
   */
  private readonly apiUrl: { Deepgram: string; Edenai: string };

  /**
   * The API tokens for authenticating with Deepgram and Edenai services.
   * @private
   */
  private readonly apiTokens: { Deepgram: string; Edenai: string };

  /**
   * A flag to enable or disable logging.
   * @private
   */
  private readonly logger: boolean;

  /**
   * Creates a new instance of SummarizeText.
   * @param components - Configuration options for the SummarizeText instance.
   */
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
   * @param components - An object containing the text to summarize and other parameters.
   * @returns A Promise that resolves with the summarized text object.
   * @throws Will throw an error if the API request fails.
   */
  public async edenai(components: EdenaiComponents): Promise<EdenaiResponse> {
    try {
      const response: AxiosResponse = await axios.post(
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
      const result: EdenaiResponse = response.data[components.providers];
      this.log(result);
      return result;
    } catch (error) {
      this.log(`Error in Edenai summarization: ${error}`);
      throw error;
    }
  }

  /**
   * Summarizes the provided text using the Deepgram API.
   * @param text - The text to summarize.
   * @param languageCode - The ISO language code of the text.
   * @returns A Promise that resolves with the summarized text.
   * @throws Will throw an error if the API request fails.
   */
  public async deepgram(text: string, languageCode: string): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.apiUrl.Deepgram}?language=${languageCode}&summarize=v2`,
        { text },
        {
          headers: {
            Authorization: `Token ${this.apiTokens.Deepgram}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result: string = response.data.results.summary.text;
      this.log(result);
      return result;
    } catch (error) {
      this.log(`Error in Deepgram summarization: ${error}`);
      throw error;
    }
  }

  /**
   * Logs the provided information if logging is enabled.
   * @param info - Information to be logged. Can be a string or an EdenaiResponse object.
   * @private
   */
  private log(info: EdenaiResponse | string): void {
    if (!this.logger) return;

    const message =
      typeof info === "object"
        ? `Results: ${info.result}\nCosts: ${info.cost}`
        : `Results: ${info}`;

    console.log(`[DEBUG SummarizeText]\n* ${message}`);
  }
}
