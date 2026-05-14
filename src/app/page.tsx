import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <Image
        src="/kayserisocialrun_logo.png"
        alt="Kayseri Social Run"
        width={280}
        height={120}
        className="h-auto w-[min(280px,80vw)]"
        priority
      />
      <div className="mt-10 flex gap-6 text-sm text-zinc-600">
        <Link href="/login" className="underline underline-offset-4 hover:text-zinc-900">
          Login
        </Link>
        <Link href="/register" className="underline underline-offset-4 hover:text-zinc-900">
          Register
        </Link>
      </div>
    </div>
  );
}
