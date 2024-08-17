from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
    Microphone,
)
from dotenv import load_dotenv
import os
import logging
import time

load_dotenv()

logging.basicConfig(
    format="[VoiceRecognition Deepgram]\n* %(message)s", level=logging.INFO
)
logger = logging.getLogger()


class VoiceRecognition:
    def __init__(self, phrases: list, api_key: str) -> None:
        self.client = DeepgramClient(api_key=api_key)
        self.finalized_transcriptions = []
        self.phrases = phrases
        self.processing_command = False

    def run(self, language: str = "en-US", model: str = "nova-2") -> None:
        try:
            dg_connection = self.client.listen.websocket.v("1")
            dg_connection.on(LiveTranscriptionEvents.Open, self.on_open)
            dg_connection.on(LiveTranscriptionEvents.Transcript, self.on_message)
            dg_connection.on(LiveTranscriptionEvents.Metadata, self.on_metadata)
            dg_connection.on(
                LiveTranscriptionEvents.SpeechStarted, self.on_speech_started
            )
            dg_connection.on(
                LiveTranscriptionEvents.UtteranceEnd, self.on_utterance_end
            )
            dg_connection.on(LiveTranscriptionEvents.Close, self.on_close)
            dg_connection.on(LiveTranscriptionEvents.Error, self.on_error)
            dg_connection.on(LiveTranscriptionEvents.Unhandled, self.on_unhandled)

            options = LiveOptions(
                model=model,
                language=language,
                smart_format=True,
                encoding="linear16",
                channels=1,
                sample_rate=16000,
                interim_results=True,
                utterance_end_ms="1000",
                vad_events=True,
                endpointing=300,
            )

            self.create_log("Press Enter to stop recording...")

            if not dg_connection.start(options, addons={"no_delay": True}):
                self.create_log("ERROR: Failed to connect to Deepgram")
                return
            self.create_log("INFO: Successfully connected to Deepgram")

            microphone = Microphone(dg_connection.send, input_device_index=2)
            self.create_log("INFO: Starting microphone recording...")
            microphone.start()

            input("")

            self.create_log("INFO: Stopping microphone recording...")
            microphone.finish()
            dg_connection.finish()

            self.create_log("INFO: Recording finished")

        except Exception as e:
            self.create_log(f"ERROR: Could not open socket: {e}")

    def on_open(self, *args, **kwargs):
        self.create_log("INFO: Connection Open")

    def on_message(self, *args, **kwargs):
        result = kwargs.get("result") if "result" in kwargs else args[0]
        sentence = result.channel.alternatives[0].transcript.strip()
        if not sentence:
            return

        if result.is_final:
            self.finalized_transcriptions.append(sentence.lower())
            if any(phrase in sentence.lower() for phrase in self.phrases):
                self.create_log("INFO: Trigger phrase detected")
                if not self.processing_command:
                    os.system('bun run command.ts --audio "default"')
                    time.sleep(3)
                    self.processing_command = True
        else:
            self.create_log(f"DEBUG: Interim Results: {sentence}")

    def on_metadata(self, *args, **kwargs):
        metadata = kwargs.get("metadata", args[0] if args else None)
        if metadata:
            self.create_log(f"INFO: Metadata: {metadata}")

    def on_speech_started(self, *args, **kwargs):
        self.create_log("INFO: Speech Started")

    def on_utterance_end(self, *args, **kwargs):
        if self.finalized_transcriptions:
            utterance = " ".join(self.finalized_transcriptions)
            self.create_log(f"INFO: Utterance End: {utterance}")
            self.finalized_transcriptions.clear()
            if self.processing_command:
                if not any(phrase in utterance.lower() for phrase in self.phrases):
                    os.system(f'bun run command.ts --text "{utterance}"')
                    self.create_log(f"INFO: Asking Gemini about {utterance}")
                    self.processing_command = False

    def on_close(self, *args, **kwargs):
        self.create_log("INFO: Connection Closed")

    def on_error(self, *args, **kwargs):
        error = kwargs.get("error", args[0] if args else None)
        self.create_log(f"ERROR: Handled Error: {error}")

    def on_unhandled(self, *args, **kwargs):
        unhandled = kwargs.get("unhandled", args[0] if args else None)
        self.create_log(f"WARNING: Unhandled Websocket Message: {unhandled}")

    def create_log(self, message: str) -> None:
        logger.info(message)


if __name__ == "__main__":
    voice_command = ["hey, bot", "hey bot"]
    api_key = os.getenv("DEEPGRAM_API_KEY")

    if not api_key:
        raise Exception("ERROR: DEEPGRAM_API_KEY not set in environment variables")

    vr = VoiceRecognition(voice_command, api_key)
    vr.run()
