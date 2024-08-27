<h2 align="center" style="display: flex; align-items: center; justify-content: center;">
  <img src="https://raw.githubusercontent.com/Stawa/Gemini-Text-To-Speech/86c0daa9de8303ef31b791eb172ce70c651de23c/repo/google_gemini.svg" alt="Gemini Icon" width="24" height="24" style="margin-right: 8px;">
  Gemini Text-To-Speech 
  <img src="https://raw.githubusercontent.com/Stawa/Gemini-Text-To-Speech/86c0daa9de8303ef31b791eb172ce70c651de23c/repo/google_gemini.svg" alt="Gemini Icon" width="24" height="24" style="margin-left: 8px;">
</h2>

<p align="center"><b>Transform written content into speech using Google AI (Gemini) for text generation and internet-based information retrieval.</b></p>

<p align="center">
  <a href="https://gemini.google.com/">
    <img src="https://img.shields.io/badge/Google%20Gemini-black?style=flat&logo=Google&logoColor=blue" alt="Google Gemini">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/Made%20with%20TypeScript-black?style=flat&logo=TypeScript&logoColor=blue" alt="Made with TypeScript">
  </a>
  <a href="https://bun.sh/">
    <img src="https://img.shields.io/badge/Powered%20by%20Bun-black?style=flat&logo=bun&logoColor=white" alt="Powered by Bun">
  </a>
  <a href="https://stawa.github.io/GTTS/">
    <img alt="Documentation" src="https://img.shields.io/website?url=https://stawa.github.io/GTTS/&up_message=Available&up_color=1F51FF&down_color=critical&down_message=Unavailable&style=flat&logo=github&label=Documentation&labelColor=black">
  </a>
  <a href="https://sonarcloud.io/project/overview?id=Stawa_Gemini-Text-To-Speech">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Stawa_Gemini-Text-To-Speech&metric=reliability_rating" alt="SonarCloud Reliability Rating">
  </a>
</p>

<hr />

<h3>📜 Table of Contents</h3>
<ol>
  <li><a href="#how-it-works"><b>How It Works</b></a></li>
  <li><a href="#project-note"><b>Project Note</b></a></li>
  <li><a href="#project-installation"><b>Project Installation</b></a></li>
  <li><a href="#project-examples"><b>Project Examples</b></a></li>
  <li><a href="#contributors"><b>Contributors</b></a></li>
</ol>

<hr />

<h3 id="how-it-works">❓ How It Works</h3>
<p>This project is based on an example in <a href="https://github.com/Stawa/GTTS/blob/main/test/app.ts">test/app.ts</a>. It performs the following steps:</p>
<ol>
  <li>Fetches a voice input</li>
  <li>Sends a request to the Google Gemini API to receive an AI-generated response</li>
  <li>Automatically converts the response to speech using Text-To-Speech (TTS) technology</li>
  <li>Plays the generated audio</li>
</ol>

<hr />

<h3 id="project-note">📌 Project Note</h3>
<p>This project has been tested on Linux (Ubuntu 24.04 LTS x86_64). Windows users can install SoX via SourceForge. MacOS-specific information is currently unavailable.</p>

<table>
  <tr>
    <th>Task</th>
    <th>Priority</th>
    <th>Status</th>
  </tr>
  <tr>
    <td>Implement Gemini Chat</td>
    <td>High</td>
    <td>✅ Completed</td>
  </tr>
  <tr>
    <td>Develop Voice Recognition</td>
    <td>High</td>
    <td>✅ Completed</td>
  </tr>
  <tr>
    <td>Implement Audio Language Detection</td>
    <td>High</td>
    <td>✅ Completed</td>
  </tr>
  <tr>
    <td>Implement Text Language Detection</td>
    <td>Medium</td>
    <td>✅ Completed</td>
  </tr>
  <tr>
    <td>Implement an Audio Player</td>
    <td>Low</td>
    <td>✅ Completed</td>
  </tr>
  <tr>
    <td>Define Enums</td>
    <td>Low</td>
    <td>✅ Completed</td>
  </tr>
  <tr>
    <td>Integrate Debugging</td>
    <td>Low</td>
    <td>✅ Completed</td>
  </tr>
</table>

<hr />

<h3 id="project-installation">📦 Project Installation</h3>
<p>Before using this repository, ensure the following dependencies are installed on your system:</p>

<h4>Linux</h4>
<ul>
  <li><b>SoX</b>: <code>sudo apt-get install sox</code></li>
  <li><b>libsox-fmt-all</b>: <code>sudo apt-get install libsox-fmt-all</code></li>
  <li><b>FFmpeg</b>: <code>sudo apt install ffmpeg</code></li>
</ul>

<h4>Windows</h4>
<ul>
  <li><b>SoX</b>: <a href="https://sourceforge.net/projects/sox/">Download from SourceForge</a></li>
  <li><b>FFmpeg</b>: <code>choco install ffmpeg</code> (using Chocolatey) or <a href="https://www.ffmpeg.org/download.html">Download from official website</a></li>
</ul>

<h4>MacOS</h4>
<p>MacOS-specific installation instructions are not available at this time.</p>

<p>To install the package, use one of the following commands based on your preferred package manager:</p>

```bash
# npm
$ npm install git+https://github.com/Stawa/GTTS.git --legacy-peer-deps
# Bun
$ bun install git+https://github.com/Stawa/GTTS.git --trust
```

<hr />

<h3 id="project-examples">📄 Project Examples</h3>
<p>Before diving into the examples, ensure you have the following API keys and credentials:</p>
<ul>
  <li><b>Google Gemini API Key</b> (<code>lib.GoogleGemini</code>)
    <ul><li>Obtain from <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com">Google Cloud Console</a></li></ul>
  </li>
  <li><b>TikTok SessionID</b> (<code>lib.TextToSpeech</code>)
    <ul><li>Extract from <a href="https://www.tiktok.com/">TikTok</a> browser cookies after logging in</li></ul>
  </li>
  <li><b>Google Speech API Key</b> (<code>lib.VoiceRecognition.fetchTranscriptGoogle</code>)
    <ul><li>Generate from <a href="https://console.cloud.google.com/apis/credentials">Google Cloud Console Credentials</a></li></ul>
  </li>
  <li><b>Deepgram API Key</b> (<code>lib.VoiceRecognition.fetchTranscriptDeepgram</code>)
    <ul><li>Create an account and obtain from <a href="https://console.deepgram.com/signup">Deepgram Console</a></li></ul>
  </li>
  <li><b>EdenAI API Key</b> (<code>lib.SummarizeText</code>)
    <ul><li>Sign up and retrieve from <a href="https://app.edenai.run/user/register">EdenAI Dashboard</a></li></ul>
  </li>
</ul>

<p>Ensure to store these API keys securely and never commit them to version control. Consider using environment variables or a secure key management system.</p>

<p>Here's a concise example demonstrating how to generate a response using the Google Gemini API:</p>

```ts
import { GoogleGemini } from "@stawa/gtts";
import dotenv from "dotenv";
dotenv.config();

const gemini = new GoogleGemini({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-1.5-flash",
  enableLogging: true,
});

async function main() {
  try {
    const question = "When was Facebook launched?";
    console.log(`Question: ${question}`);

    const response = await gemini.chat(question);
    console.log(`Gemini's response: ${response}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
```

<hr />

<h3 id="contributors">👥 Contributors</h3>
<p>We appreciate the contributions of all our collaborators. Each person's effort helps make this project better. A special thanks to all our contributors who have helped shape this project!</p>

<a href="https://github.com/stawa/gtts/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=stawa/gtts" alt="Contributors" style="max-width: 100%; height: auto; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
</a>

<hr />
