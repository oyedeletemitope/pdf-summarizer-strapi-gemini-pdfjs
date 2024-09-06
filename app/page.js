"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  function handleTitleChange(event) {
    setTitle(event.target.value);
  }

  async function handleShowSummary() {
    if (file && title) {
      setIsLoading(true);
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        console.log("loaded pdf:", pdf.numPages);

        let text = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          content.items.forEach((item) => {
            text += item.str + " ";
          });
        }

        sendToAPI(text);
      };
      fileReader.readAsArrayBuffer(file);
    }
  }

  function sendToAPI(text) {
    console.log("Sending title to API:", title);
    fetch("/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, title }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setSummary(data.Summary);
          setShowSummary(true);
        } else {
          throw new Error(data.message || "Unknown error occurred");
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleClear() {
    setSummary("");
    setTitle("");
    setFile(null);
    fileInputRef.current.value = null; // Clear file input
    setShowSummary(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#32324d]">
      <div className="p-8 rounded shadow-md w-full max-w-md mb-6 border border-gray-600 bg-[#32324d]">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">
          Upload PDF
        </h1>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-200"
            >
              Enter Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter Title"
              value={title}
              onChange={handleTitleChange}
              className="border border-gray-500 rounded p-2 mt-1 w-full text-white bg-gray-700"
              required
            />
          </div>
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-200"
            >
              Upload PDF
            </label>
            <input
              id="file"
              type="file"
              name="file"
              accept=".pdf"
              onChange={onFileChange}
              ref={fileInputRef}
              className="border border-gray-500 text-white rounded p-2 mt-1 w-full bg-gray-700"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleShowSummary}
              className="text-white px-4 py-2 rounded hover:opacity-90 bg-[#4945ff]"
              disabled={!file || !title || isLoading}
            >
              Show Summary
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
            >
              Clear
            </button>
          </div>
        </form>

        {isLoading && <p className="text-yellow-300 mt-4">Summarizing...</p>}

        {showSummary && summary && (
          <div className="mt-6 p-4 border rounded border-gray-600 bg-gray-700">
            <h2 className="text-xl text-gray-100 font-semibold mb-2">
              {title}
            </h2>
            <ReactMarkdown className="text-gray-200">{summary}</ReactMarkdown>
          </div>
        )}
      </div>
      <div className="w-full max-w-md text-center">
        <Link
          href="/summaries"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-500 transition-colors inline-block"
        >
          View Summarized PDFs
        </Link>
      </div>
    </div>
  );
}
