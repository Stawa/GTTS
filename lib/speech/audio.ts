import { spawn, type ChildProcess } from "child_process";
import mm, { type IAudioMetadata } from "music-metadata";

/**
 * Defines the supported audio players.
 */
type Player = "ffmpeg";

/**
 * Interface for the components that can be passed to the AudioGemini constructor.
 * @interface
 */
interface AudioComponents {
  /**
   * Enables logging when set to true.
   */
  logger?: boolean;
}

/**
 * Represents detailed metadata about an audio file.
 * @interface
 */
export interface AudioDetails {
  /**
   * Types of tags present in the audio file.
   */
  tagTypes: string[];

  /**
   * Information about the audio track.
   */
  trackInfo: string[];

  /**
   * Indicates whether the audio is lossless.
   */
  lossless: boolean;

  /**
   * The container format of the audio file.
   */
  container: string;

  /**
   * The codec used for audio encoding.
   */
  codec: string;

  /**
   * The sample rate of the audio in Hz.
   */
  sampleRate: number;

  /**
   * The number of audio channels.
   */
  numberOfChannels: number;

  /**
   * The bitrate of the audio in bits per second.
   */
  bitrate: number;

  /**
   * The profile of the codec used.
   */
  codecProfile: string;

  /**
   * The total number of audio samples.
   */
  numberOfSamples: number;

  /**
   * The duration of the audio in seconds.
   */
  duration: number;
}

/**
 * The AudioGemini class provides functionalities for playing audio files and retrieving metadata.
 */
export class AudioGemini {
  private readonly logger: boolean;
  private logSent: boolean;

  /**
   * Constructs a new AudioGemini instance.
   * @param components - Optional configuration for the AudioGemini instance.
   */
  constructor(components: AudioComponents = {}) {
    this.logger = components.logger ?? false;
    this.logSent = false;
  }

  /**
   * Plays the specified audio file using the given player.
   * @param player - The audio player to use.
   * @param filename - The path to the audio file.
   */
  public playAudio(player: Player, filename: string): void {
    const playerCommands: Record<Player, string[]> = {
      ffmpeg: ["ffplay", "-autoexit", "-nodisp", filename],
    };

    const command: ChildProcess = spawn(
      playerCommands[player][0],
      playerCommands[player].slice(1)
    );

    command.stderr?.on("data", async () => {
      if (this.logger && !this.logSent) {
        const parseAudio = await mm.parseFile(filename);
        const format: AudioDetails = this.extractAudioFormat(parseAudio);
        this.createLog(format);
      }
    });

    command.on("close", (code) => {
      this.logger && this.createLog(`AudioGemini Closed with Code: ${code}`);
    });
  }

  /**
   * Logs audio details or a message.
   * @param info - Audio details or a message to log.
   */
  private createLog(info: AudioDetails | string): void {
    if (typeof info === "string") {
      console.log(`[DEBUG AudioGemini]\n* ${info}`);
      return;
    }

    if (this.logSent) return;

    const log = [
      "[DEBUG AudioGemini]",
      `* Bit Rate: ${info.bitrate / 1000}k`,
      `* Encoding: ${info.codec}`,
      `* Channels: ${info.numberOfChannels}`,
      `* Samplerate: ${info.sampleRate}Hz`,
      `* Duration: ${this.formatDuration(info.duration)}`,
    ];

    log.forEach((entry) => console.log(entry));
    this.logSent = true;
  }

  /**
   * Formats the duration from seconds to a human-readable string.
   * @param duration - The duration in seconds.
   * @returns A formatted duration string.
   */
  private formatDuration(duration: number): string {
    if (!duration || isNaN(duration)) return "N/A";

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} Minute${minutes > 1 ? "s" : ""}`);
    if (seconds > 0 || parts.length === 0)
      parts.push(`${seconds} Second${seconds > 1 ? "s" : ""}`);

    return parts.join(", ");
  }

  /**
   * Extracts audio format details from the provided audio metadata.
   * @param audioMetadata - The metadata of the audio file.
   * @returns The extracted audio format details.
   */
  private extractAudioFormat(audioMetadata: IAudioMetadata): AudioDetails {
    const { format } = audioMetadata;
    return {
      tagTypes: format.tagTypes ?? [],
      trackInfo: format.trackInfo?.map((track) => JSON.stringify(track)) ?? [],
      lossless: format.lossless ?? false,
      container: format.container ?? "",
      codec: format.codec ?? "",
      sampleRate: format.sampleRate ?? 0,
      numberOfChannels: format.numberOfChannels ?? 0,
      bitrate: format.bitrate ?? 0,
      codecProfile: format.codecProfile ?? "",
      numberOfSamples: format.numberOfSamples ?? 0,
      duration: format.duration ?? 0,
    };
  }
}
