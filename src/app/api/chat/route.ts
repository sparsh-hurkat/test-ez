import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  createStreamDataTransformer,
  LangChainAdapter,
  StreamingTextResponse,
  streamText,
  Message as VercelChatMessage,
} from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
  model: "gemini-1.5-flash",
  verbose: true,
});

const TEMPLATE = `Generate {number_of_questions} unique questions from the context that doesn't already exist.
If the question is from an example, then show the example before the question.
Only show the question, not why you chose the question or how to solve it.
==============================
context: {context}
==============================
Current conversation: {chat_history}`;

// const loader = new JSONLoader("src/data/states.json", [
//   "/state",
//   "/code",
//   "/nickname",
//   "/website",
//   "/admission_date",
//   "/admission_number",
//   "/capital_city",
//   "/capital_url",
//   "/population",
//   "/population_rank",
//   "/constitution_url",
//   "/twitter_url",
// ]);

const dummyTextbook = "./public/textbook.pdf";

const loader = new PDFLoader(dummyTextbook);

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  const { messages } = await req.json();
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

  const currentMessageContent = messages[messages.length - 1].content;

  const docs = await loader.load();
  const parser = new HttpResponseOutputParser();
  const prompt = PromptTemplate.fromTemplate(TEMPLATE);
  // const model = google("models/gemini-1.5-flash");

  // const chain = prompt.pipe(model);

  const chain = RunnableSequence.from([
    {
      number_of_questions: (input) => input.number_of_questions,
      chat_history: (input) => input.chat_history,
      context: (input) => input.context,
    },
    prompt,
    model,
    // parser,
  ]);

  const stream = await chain.stream({
    chat_history: formattedPreviousMessages.join("\n"),
    // question: currentMessageContent,
    number_of_questions: currentMessageContent,
    context: formatDocumentsAsString(docs),
  });

  // const result = await streamText({
  //   model,
  //   messages,
  //   onFinish({ text, toolCalls, toolResults, finishReason, usage }) {
  //     console.log(text, toolCalls, toolResults, finishReason, usage);
  //   },
  // });
  // return result.toDataStreamResponse();
  return LangChainAdapter.toDataStreamResponse(stream);
}
