import { AppHeader } from "@/components/app-header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-w-0 flex-col">
      <AppHeader />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
