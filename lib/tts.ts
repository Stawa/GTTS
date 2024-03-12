import fs from "fs";
import axios, { type AxiosResponse } from "axios";
import translate from "@iamtraction/google-translate";
import { VoiceSpeaker } from "./enums";

/**
 * Interface for the components that can be passed to the TextToSpeech constructor.
 */
interface TTSComponents {
  /**
   * Session ID for accessing the TikTok text-to-speech API.
   */
  sessionId?: string;
  /**
   * A boolean flag indicates whether debug logs should be enabled.
   */
  debugLog?: boolean;
}

/**
 * Arguments for the createSpeech method of the TextToSpeech class.
 */
interface TTSArgs {
  /**
   * The text is to be converted to speech.
   */
  text: string;
  /**
   * Optional name for the audio file.
   */
  audioName?: string;
  /**
   * A boolean flag indicates whether to detect the language of the input text.
   */
  detectLanguage?: boolean;
  /**
   * The voice speaker is to be used for the generated speech.
   */
  voice?: VoiceSpeaker | string;
}

/**
 * The TextToSpeech class provides functionalities for converting text to speech using the TikTok text-to-speech API.
 */
export class TextToSpeech {
  /**
   * Represents the URL of the TikTok text-to-speech API.
   * @private
   * @readonly
   */
  private readonly apiUrl: string;
  /**
   * The session ID required for accessing the TikTok text-to-speech API.
   * @public
   */
  public sessionId: string | undefined;
  /**
   * A boolean flag indicates whether debug logging is enabled.
   * @public
   */
  public debugLog: boolean;

  /**
   * Constructs a new TextToSpeech instance.
   * @param components Optional components to initialize the TextToSpeech instance.
   */
  constructor(components?: TTSComponents) {
    this.apiUrl =
      "https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke";
    this.sessionId = components?.sessionId ?? process.env.TIKTOK_SESSION_ID;
    this.debugLog = components?.debugLog ?? false;
  }

  /**
   * Generates speech audio from the provided text using the TikTok text-to-speech API.
   * @param args Arguments for generating the speech.
   * @returns A Promise that resolves when the speech audio is successfully generated.
   */
  public async createSpeech(args: TTSArgs): Promise<string | undefined> {
    const detectedLanguage = args.detectLanguage
      ? await this.detectLanguage(args.text)
      : VoiceSpeaker.Jessie;

    const formattedText = this.formatText(args.text);

    const headers = {
      "User-Agent":
        "com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)",
      Cookie: `sessionid=${this.sessionId}`,
      "Accept-Encoding": "gzip,deflate,compress",
    };

    this.createLog([
      `Audio Language: ${detectedLanguage}`,
      `Auto Detect Language: ${args.detectLanguage}`,
    ]);

    try {
      const audioChunks: Buffer[] = [];
      for (const textChunk of formattedText) {
        const fullUrl = `${this.apiUrl}/?text_speaker=${
          args.voice ?? detectedLanguage
        }&req_text=${textChunk}&speaker_map_type=0&aid=1233`;

        const result: AxiosResponse<any> = await axios.post(fullUrl, null, {
          headers: headers,
        });
        const { status_code: statusCode, data } = result.data;

        if (statusCode !== 0) {
          throw new Error(this.handleError(statusCode));
        }

        const audioChunk = Buffer.from(data.v_str, "base64");
        audioChunks.push(audioChunk);
      }

      const audioBuffer = Buffer.concat(audioChunks);
      const audioFilename = `${args.audioName ?? "gemini-speech"}.mp3`;
      fs.writeFileSync(audioFilename, audioBuffer);
      this.createLog(`Saved Audio with Name: ${audioFilename}`);
      return audioFilename;
    } catch (error) {
      console.error("Error occurring when generating speech:", error);
    }
  }

  /**
   * Formats the provided text for the TikTok text-to-speech API.
   * @param text The text to be formatted.
   * @returns The formatted text.
   */
  private formatText(text: string): string[] {
    const chunks: string[] = [];

    while (text.length > 0) {
      chunks.push(text.substring(0, Math.min(150, text.length)));
      text = text.substring(150);
    }

    return chunks.map((chunk) => {
      return chunk.replace(/^[*-]\s*|\s+/gm, (match) => {
        return match === "*" || match === "-" ? "" : "+";
      });
    });
  }

  /**
   * Handles errors based on the status code returned by the TikTok text-to-speech API.
   * @param statusCode The status code returned by the API.
   * @returns The error message corresponding to the status code.
   */
  private handleError(statusCode: number): string {
    const errorMessages: { [key: number]: string } = {
      1: `It's likely that your TikTok session ID is no longer valid. Attempt to obtain a new one.`,
      2: `The provided content is just too long.`,
      4: `The speaker is invalid. Please refer to the list of acceptable speaker values.`,
      5: `Failed to locate the session ID.`,
    };

    return errorMessages[statusCode] ?? `Unknown status code: ${statusCode}`;
  }

  /**
   * Creates debug logs with the provided information if debug logging is enabled.
   * @param info Information to be logged. It can be a string or an array of strings.
   */
  private createLog(info: string[] | string): void {
    if (!this.debugLog) return;

    const prefix =
      typeof info === "string"
        ? `* ${info}`
        : info.map((line) => `* ${line}`).join("\n");
    console.log(`[DEBUG TextToSpeech]\n${prefix}`);
  }

  /**
   * Detects the language of the provided text using Google Translate.
   * @param text The text for language detection.
   * @returns The detected language code.
   */
  private async detectLanguage(text: string): Promise<string> {
    const lang = {
      EN: VoiceSpeaker.Jessie,
      ES: VoiceSpeaker.SpanishMXMale,
      FR: VoiceSpeaker.FrenchMale1,
      PT: VoiceSpeaker.PortugueseBRFemale1,
      DE: VoiceSpeaker.GermanFemale,
      ID: VoiceSpeaker.IndonesianFemale,
      JP: VoiceSpeaker.JapaneseFemale1,
      KR: VoiceSpeaker.KoreanMale1,
      VN: VoiceSpeaker.VietnameseFemale,
    };
    const res = await translate(text);
    const detectedLanguageKey = Object.keys(lang).find(
      (key: string) => key === res.from.language.iso.toUpperCase()
    );
    const detectedLanguage = detectedLanguageKey ?? "EN";
    return lang[detectedLanguage as keyof typeof lang];
  }
}
