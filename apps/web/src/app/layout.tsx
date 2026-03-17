import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TienOanh ERP - HR Module",
  description: "Enterprise Resource Planning for TienOanh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased selection:bg-indigo-500/30`}>
        <div className="h-full relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

          <div className="h-screen flex relative z-10">
            <div className="hidden h-full md:flex md:w-72 md:flex-col fixed inset-y-0">
              <Sidebar />
            </div>
            <main className="md:pl-72 flex-1 pb-10 h-full overflow-y-auto">
              <div className="p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
