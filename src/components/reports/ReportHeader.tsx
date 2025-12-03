/**
 * Report Header Component
 * Reusable header for all report pages
 */

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ReportTheme } from "@/types/report";

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  dashboardPath: string;
  theme: ReportTheme;
}

export default function ReportHeader({
  title,
  subtitle,
  dashboardPath,
  theme,
}: ReportHeaderProps) {
  const router = useRouter();

  return (
    <header className={`${theme.gradient} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-white/80">{subtitle}</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => router.push(dashboardPath)}
            className={`px-4 py-2 text-sm bg-white rounded-lg hover:opacity-90 font-medium transition-colors ${theme.primary}`}
          >
            ← Kembali
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`px-4 py-2 text-sm bg-white rounded-lg hover:opacity-90 font-medium transition-colors ${theme.primary}`}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
