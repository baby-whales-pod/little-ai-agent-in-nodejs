import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const AGENT_NAME = "Fakey";

// Canned responses: first matching rule wins.
const rules = [
  { match: /\b(hello|hi|hey)\b/i, replies: ["Hello! How can I help you today?", "Hi there! Ask me anything."] },
  { match: /\b(your name|who are you)\b/i, replies: [`I'm ${AGENT_NAME}, a totally fake AI agent.`] },
  { match: /\b(time|date)\b/i, replies: [() => `It is ${new Date().toLocaleString()}.`] },
  { match: /\b(weather)\b/i, replies: ["It's always sunny in the land of fake agents."] },
  { match: /\b(joke)\b/i, replies: ["Why do programmers prefer dark mode? Because light attracts bugs."] },
  { match: /\b(thanks|thank you)\b/i, replies: ["You're welcome!"] },
];

const fallbacks = [
  "That's a great question. After careful consideration, I'd say: it depends.",
  "Interesting! I'd need more context, but I'm confident the answer is 42.",
  "I've analyzed your question deeply and concluded... maybe.",
  "Hmm, let me think about that. Have you tried turning it off and on again?",
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function think(question) {
  for (const { match, replies } of rules) {
    if (match.test(question)) {
      const reply = pick(replies);
      return typeof reply === "function" ? reply() : reply;
    }
  }
  return pick(fallbacks);
}

// Simulate "thinking" and token-by-token streaming.
async function answer(question) {
  output.write("🤔 thinking");
  for (let i = 0; i < 3; i++) {
    await sleep(300);
    output.write(".");
  }
  output.write("\r\x1b[K");

  output.write(`🤖 ${AGENT_NAME}: `);
  for (const word of think(question).split(" ")) {
    output.write(word + " ");
    await sleep(60);
  }
  output.write("\n\n");
}

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log(`${AGENT_NAME} is ready. Type your question (or "exit" to quit).\n`);

  rl.on("SIGINT", () => rl.close());

  try {
    while (true) {
      const question = (await rl.question("🧑 You: ")).trim();
      if (!question) continue;
      if (/^(exit|quit|bye)$/i.test(question)) {
        console.log(`🤖 ${AGENT_NAME}: Goodbye!`);
        break;
      }
      await answer(question);
    }
  } catch {
    // readline closed (Ctrl+C / Ctrl+D)
  } finally {
    rl.close();
  }
}

main();
