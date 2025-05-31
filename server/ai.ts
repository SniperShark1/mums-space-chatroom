import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function getParentingHelp(question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful parenting assistant for "Mum's Space" - a supportive community for mothers. 
          Provide warm, practical, and evidence-based parenting advice. Keep responses concise but caring (2-3 paragraphs max).
          Focus on common parenting challenges like sleep, feeding, behavior, development, and emotional support.
          Always be encouraging and remind parents that every child is different. If it's a serious medical concern, suggest consulting a healthcare provider.`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response right now. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Unable to get AI response at the moment. Please try again later.");
  }
}