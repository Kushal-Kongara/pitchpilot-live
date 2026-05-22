import { GoogleGenAI } from "@google/genai";

// Vertex AI via Application Default Credentials.
// Set env vars:
//   GOOGLE_GENAI_USE_VERTEXAI=true
//   GOOGLE_CLOUD_PROJECT=<your-project>
//   GOOGLE_CLOUD_LOCATION=<your-location>
// No API key needed — ADC handles auth automatically.
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

export default ai;
