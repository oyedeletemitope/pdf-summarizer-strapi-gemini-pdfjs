"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function SummaryContent({ id }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/summarized-pdfs?filters[id][$eq]=${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setSummary(data.data[0]);
        } else {
          throw new Error("Summary not found");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!summary) return <div>Summary not found</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{summary.Title}</h1>
      <div className="bg-gray-800 p-6 rounded-lg">
        <ReactMarkdown className="prose prose-invert max-w-none">
          {summary.Summary}
        </ReactMarkdown>
      </div>
    </>
  );
}
