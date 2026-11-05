import Link from "next/link";
import Button from "@/components/common/Button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-red-50 p-4 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-4">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

