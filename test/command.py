from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
    Microphone,
)
from dotenv import load_dotenv
import os
import logging

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

    def run(self, language: str = "en-US", model: str = "nova-2") -> None:
        try:
            dg_connection = self.client.listen.live.v("1")
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
                self.create_log("Failed to connect to Deepgram")
                return

            microphone = Microphone(dg_connection.send)
            microphone.start()

            input("")

            microphone.finish()
            dg_connection.finish()

            self.create_log("Finished")

        except Exception as e:
            self.create_log(f"Could not open socket: {e}")

    def on_open(self, *args, **kwargs):
        self.create_log("Connection Status: Connection Open")

    def on_message(self, *args, **kwargs):
        result = kwargs.get("result") if "result" in kwargs else args[0]
        sentence = result.channel.alternatives[0].transcript
        if len(sentence) == 0:
            return
        if result.is_final:
            self.finalized_transcriptions.append(sentence.lower())
            if any(phrase in sentence.lower() for phrase in self.phrases):
                self.create_log("INFO: Speech is detected...")
                os.system("bun run app.ts")
                os.abort()
            else:
                self.create_log("INFO: Utterance does not contain any phrases.")
                self.finalized_transcriptions = []
        else:
            self.create_log(f"Interim Results: {sentence}")

    def on_metadata(self, *args, **kwargs):
        metadata = kwargs.get("metadata", args[0] if args else None)
        if metadata:
            self.create_log(f"Metadata: {metadata}")

    def on_speech_started(self, *args, **kwargs):
        self.create_log("Speech Status: Speech Started")

    def on_utterance_end(self, *args, **kwargs):
        if len(self.finalized_transcriptions) > 0:
            utterance = " ".join(self.finalized_transcriptions)
            self.create_log(f"Utterance End: {utterance}")
            self.finalized_transcriptions = []

    def on_close(self, *args, **kwargs):
        self.create_log("Connection Status: Connection Closed")

    def on_error(self, *args, **kwargs):
        error = kwargs.get("error", args[0] if args else None)
        self.create_log(f"Handled Error: {error}")

    def on_unhandled(self, *args, **kwargs):
        unhandled = kwargs.get("unhandled", args[0] if args else None)
        self.create_log(f"Unhandled Websocket Message: {unhandled}")

    def create_log(self, info):
        if isinstance(info, str):
            prefix = f"* {info}"
        else:
            prefix = "\n".join([f"* {line}" for line in info])
        print(f"[VoiceRecognition Deepgram]\n{prefix}")


if __name__ == "__main__":
    voice_command = ["hey, bot", "hey bot"]
    api_key = os.getenv("DEEPGRAM_API_KEY")
    voice_recognition = VoiceRecognition(voice_command, api_key)
    voice_recognition.run()
