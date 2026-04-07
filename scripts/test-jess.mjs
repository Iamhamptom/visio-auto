import { google } from "@ai-sdk/google";
import { generateText } from "ai";
const r = await generateText({model: google("gemini-2.5-pro"), prompt: "In one sentence: roughly how many vehicles are registered in South Africa? Hedge with 'approximately'."});
console.log(r.text);
