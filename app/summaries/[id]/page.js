import { Suspense } from "react";
import Link from "next/link";
import SummaryContent from "./SummaryContent";

export default function SummaryPage({ params }) {
  return (
    <div className="min-h-screen bg-[#32324d] py-8 text-white">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/summaries"
          className="bg-[#4945ff] text-white px-4 py-2 rounded mb-4 inline-block"
        >
          Back to Summaries
        </Link>

        <Suspense fallback={<div>Loading...</div>}>
          <SummaryContent id={params.id} />
        </Suspense>
      </div>
    </div>
  );
}
