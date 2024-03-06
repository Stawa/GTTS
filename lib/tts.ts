import fs from "fs";
import axios, { type AxiosResponse } from "axios";
import type { VoiceSpeaker } from "./enums";

interface TTSComponents {
  sessionId?: string;
  debugLog?: boolean;
}

interface TTSArgs {
  voice: VoiceSpeaker | string;
  text: string;
  audioName?: string;
}

export class TextToSpeech {
  private apiUrl: string;
  public sessionId: string | undefined;
  public debugLog: boolean;

  constructor(components?: TTSComponents) {
    this.apiUrl =
      "https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke";
    this.sessionId = components?.sessionId || process.env.TIKTOK_SESSION_ID;
    this.debugLog = components?.debugLog || false;
  }

  public async createSpeech(args: TTSArgs) {
    const formatText = this.formatText(args.text);
    const fullUrl = `${this.apiUrl}/?text_speaker=${args.voice}&req_text=${formatText}&speaker_map_type=0&aid=1233`;
    const headers = {
      "User-Agent":
        "com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)",
      Cookie: `sessionid=${this.sessionId}`,
      "Accept-Encoding": "gzip,deflate,compress",
    };

    try {
      const result: AxiosResponse<any> = await axios.post(fullUrl, null, {
        headers: headers,
      });
      const { status_code: statusCode, data } = result.data;

      this.createLog(`Fetched audio with status code: ${statusCode}`);

      if (statusCode !== 0) {
        throw new Error(this.handleError(statusCode));
      }

      const audioFilename = `${args.audioName || "gemini-speech"}.mp3`;
      fs.writeFileSync(audioFilename, Buffer.from(data.v_str, "base64"));
      this.createLog(`Saved audio with name: ${audioFilename}`);
    } catch (error) {
      console.error("Error occurring when generating speech:", error);
    }
  }

  private formatText(text: string) {
    return text.replace(/^[*-]\s*|\s+/gm, (match) =>
      match === "* " || match === "- " ? "" : "+"
    );
  }

  private handleError(statusCode: number) {
    const errorMessages: { [key: number]: string } = {
      1: `It's likely that your TikTok session ID is no longer valid. Attempt to obtain a new one.`,
      2: `The provided content is just too long.`,
      4: `The speaker is invalid. Please refer to the list of acceptable speaker values.`,
      5: `Failed to locate the session ID.`,
    };

    return errorMessages[statusCode] || `Unknown status code: ${statusCode}`;
  }

  private createLog(text: string[] | string) {
    if (!this.debugLog) return;

    const prefix =
      typeof text === "string"
        ? `* ${text}`
        : text.map((line) => `\n* ${line}`).join("\n");
    console.log(`\n[DEBUG TextToSpeech]\n${prefix}`);
  }
}
