"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function Summaries() {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/summarized-pdfs");
      if (!response.ok) {
        throw new Error("Failed to fetch summaries");
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      setSummaries(data.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#32324d] py-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Summarized PDFs</h1>
        <Link
          href="/"
          className="bg-[#4945ff] text-white px-4 py-2 rounded mb-4 inline-block"
        >
          Back to Upload
        </Link>
        {summaries.length === 0 ? (
          <p>No summaries available.</p>
        ) : (
          <table className="min-w-full bg-gray-800 border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-600 px-4 py-2">ID</th>
                <th className="border border-gray-600 px-4 py-2">Title</th>
                <th className="border border-gray-600 px-4 py-2">Short Text</th>
                <th className="border border-gray-600 px-4 py-2">View</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.id} className="hover:bg-gray-700">
                  <td className="border border-gray-600 px-4 py-2">
                    {summary.id}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {summary.Title}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <ReactMarkdown className="prose prose-invert max-w-none">
                      {typeof summary.Summary === "string"
                        ? summary.Summary.slice(0, 100) + "..."
                        : "Summary not available"}
                    </ReactMarkdown>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <Link
                      href={`/summaries/${summary.id}`}
                      className="bg-[#4945ff] text-white px-4 py-2 rounded"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
