import fs from "fs-extra";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  const prompt = process.argv.slice(2).join(" ");
  if (!prompt) {
    console.error("Usage: node scaffold.js \"<your prompt here>\"");
    process.exit(1);
  }

  // 1) Call OpenAI to generate a file manifest
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a code generator. Reply with valid JSON." },
      { role: "user", content: `Generate a complete project for:\n\n${prompt}\n\nRespond with a JSON array of { path: string, content: string }.` }
    ]
  });

  const json = completion.choices[0].message.content;
  let files;
  try {
    files = JSON.parse(json);
  } catch (e) {
    console.error("Failed to parse JSON:", json);
    process.exit(1);
  }

  // 2) Write each file to disk
  for (const { path, content } of files) {
    await fs.ensureDir(fs.dirname(path));
    await fs.writeFile(path, content, "utf8");
    console.log("Written", path);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
