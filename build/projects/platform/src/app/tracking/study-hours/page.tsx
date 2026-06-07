import { Suspense } from "react";
import StudyHoursPage from "./StudyHoursClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <StudyHoursPage />
    </Suspense>
  );
}
