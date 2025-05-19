import fs from "fs-extra"; import path from "path"; import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() { const prompt = process.argv.slice(2).join(" "); if (!prompt) { console.error("Usage: node scaffold.js "<your prompt here>""); process.exit(1); }

// 1) Call OpenAI to generate a file manifest const completion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [ { role: "system", content: "You are a code generator. Reply with valid JSON." }, { role: "user", content: Generate a complete project for:\n\n${prompt}\n\nRespond with a JSON array of objects with 'path' and 'content' fields. } ] });

const json = completion.choices[0].message.content; let files; try { files = JSON.parse(json); } catch (e) { console.error("Failed to parse JSON from model output:", json); process.exit(1); }

// 2) Write each file to disk for (const file of files) { const filePath = file.path; const dir = path.dirname(filePath); await fs.ensureDir(dir); await fs.writeFile(filePath, file.content, "utf8"); console.log("Written", filePath); } }

run().catch(err => { console.error("Error during scaffold:", err); process.exit(1); });
