import { Suspense } from "react";
import VerifyEmail from "./_components/VerifyEmail";

export const metadata = { title: "Xác minh email" };

export default function VerifyEmailPage() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-screen px-4 py-20">
      {/* useSearchParams needs a boundary, and the token lives in the query string. */}
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    </div>
  );
}
