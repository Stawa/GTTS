import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs";
import axios, { type AxiosResponse } from "axios";
import querystring from "querystring";

/**
 * Interface for the components that can be passed to the VoiceRecognition constructor.
 */
interface STTComponents {
  /**
   * A boolean flag indicates whether debug logging is enabled.
   */
  debugLog?: boolean;
  apiKey?: string;
}

/**
 * Interface for Google Speech components.
 */
interface GoogleSpeechComponents {
  language: string;
  audioFile: string;
}

/**
 * Represents a transcript result containing transcribed text and a confidence level.
 */
interface TranscriptResult {
  alternative: { transcript: string; confidence?: number }[];
  final: boolean;
}

/**
 * The VoiceRecognition class provides functionalities for performing voice recognition.
 */
export class VoiceRecognition {
  /**
   * A boolean flag indicating whether debug logs are enabled.
   * @public
   */
  public debugLog: boolean;
  /**
   * A boolean flag indicates whether debug logs have been created to prevent double logs.
   * If set to true, debug logs have already been created for the current instance.
   * @private
   */
  private debugLogged: boolean;
  /**
   * Represents the URL of the Google Speech to Text API.
   * @private
   * @readonly
   */
  private readonly apiUrl: string;
  /**
   * API key for accessing the Google Speech service.
   */
  apiKey: string | undefined;

  /**
   * Constructs a new VoiceRecognition instance.
   * @param components Optional components to initialize the VoiceRecognition instance.
   * @constructor
   */
  constructor(components?: STTComponents) {
    this.debugLog = components?.debugLog ?? false;
    this.debugLogged = false;
    this.apiUrl = "https://www.google.com/speech-api/v2/recognize";
    this.apiKey = components?.apiKey ?? process.env.TIKTOK_SESSION_ID;
  }

  /**
   * Performs voice recognition on the audio file specified by the filename.
   * @param filename The filename of the audio file for voice recognition.
   */
  public voiceRecognition(filename: string): void {
    const command: ChildProcessWithoutNullStreams = spawn("/usr/bin/sox", [
      "-t",
      "alsa",
      "default",
      "--encoding",
      "signed-integer",
      "--bits 16",
      "--rate 16000",
      `${filename}.flac`,
      "silence",
      "1",
      "0.1",
      "5%",
      "1",
      "3.0",
      "5%",
    ]);

    command.stderr.on("data", (data) => {
      if (this.debugLog && !this.debugLogged) {
        const lines = data.toString().split("\n");
        if (lines.length) {
          this.createLog(lines);
        }
      }
    });

    command.on("close", (code) => {
      if (this.debugLog && !this.debugLogged) {
        this.createLog([`VoiceRecognition Closed with Code: ${code}`]);
      }
    });
  }

  /**
   * Fetch transcript from the Google Speech-to-Text API.
   * @param components - Object containing Google Speech components.
   * @returns {Promise<TranscriptResult | null>} - Promise containing the AxiosResponse.
   */
  public async fetchTranscript(
    components: GoogleSpeechComponents
  ): Promise<TranscriptResult | null> {
    const params = querystring.stringify({
      output: "json",
      lang: components.language,
      key: this.apiKey,
    });
    const headers = { "Content-Type": "audio/x-flac; rate=16000;" };
    const audioData = fs.readFileSync(components.audioFile);
    const url = `${this.apiUrl}?${params}`;
    const response = await axios.post(url, audioData, { headers });
    return this.parseResponse(response.data);
  }

  /**
   * Parses the response text and extracts transcript results.
   * @param {string} responseText - The response text to parse.
   * @returns {TranscriptResult | null} The parsed transcript result, or null if no result is found.
   */
  private parseResponse(responseText: string): TranscriptResult | null {
    const lines = responseText.split("\n");
    for (const line of lines) {
      if (!line) continue;

      const result: TranscriptResult[] = JSON.parse(line).result;

      if (result.length !== 0) {
        if (result[0].alternative.length === 0) {
          throw new Error("No transcribed text found in the response.");
        }
        return result[0];
      }
    }

    return null;
  }

  /**
   * Creates debug logs with the provided information about the voice recognition process.
   * @param info Information to be logged.
   */
  private createLog(info: string[]): void {
    console.log("[DEBUG VoiceRecognition]");
    !this.debugLogged &&
      info
        .filter((line) =>
          /^(Input File|Channels|Sample Rate|Precision|Sample Encoding).*/.test(
            line
          )
        )
        .forEach((line) => {
          const match =
            /^(Input File|Channels|Sample Rate|Precision|Sample Encoding).*/.exec(
              line
            );
          match && console.log(`* ${match[0]}`);
        });

    this.debugLogged = true;
  }
}
