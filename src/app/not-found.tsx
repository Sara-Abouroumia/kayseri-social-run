import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-sm text-zinc-500">Not found</p>
      <Link href="/" className="mt-4 text-sm text-zinc-900 underline">
        Home
      </Link>
    </div>
  );
}
