// route.js

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received title:", body.title);
    console.log("Received text length:", body.text.length);

    if (!body.title) {
      throw new Error("No title provided");
    }

    const prompt = "summarize the following extracted texts: " + body.text;
    const result = await model.generateContent(prompt);
    const summaryText = result.response.text();

    // Format the summary for Rich Text (block)

    console.log("Summary generated successfully");

    // Save to Strapi
    const strapiRes = await fetch("http://localhost:1337/api/summarized-pdfs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          Title: body.title,
          Summary: summaryText,
        },
      }),
    });

    if (!strapiRes.ok) {
      const errorText = await strapiRes.text();
      console.error("Strapi error response:", errorText);
      throw new Error(
        `Failed to store summary in Strapi: ${strapiRes.status} ${strapiRes.statusText}`
      );
    }

    const strapiData = await strapiRes.json();
    console.log("Successfully stored in Strapi:", strapiData);

    return NextResponse.json({
      success: true,
      message: "Text summarized and stored successfully",
      Summary: summaryText,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
