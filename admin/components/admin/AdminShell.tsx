"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { getAccessToken } from "@/lib/api";
import { getAdminBootstrapStatus, getCurrentAdmin } from "@/services/admin/auth.service";
import type { AdminAccount } from "@/types/admin";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!getAccessToken()) {
        router.replace("/admin/login");
        return;
      }

      try {
        
        const status = await getAdminBootstrapStatus();
        if (!active) return;

        if (status.requiresBootstrap) {
          router.replace("/admin/create-admin");
          return;
        }

        try {
          const current = await getCurrentAdmin();
          if (active) setAdmin(current);
        } catch (profileError) {
        
          console.warn("Could not fetch admin profile:", profileError);
        }
      } catch (error) {
        console.error("Admin shell error:", error);
        if (active) {
          router.replace("/admin/login");
          return;
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [router, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-[#f4f6f9]">
        <div className="flex items-center gap-3 border border-slate-200 bg-white shadow-sm px-5 py-3.5">
          <Loader2 className="animate-spin text-[#1A56DB]" size={20} />
          <span className="text-[13px] font-bold text-[#0f1e36]">
            Securing admin workspace
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-[272px_minmax(0,1fr)]">
      <AdminSidebar />
      <div className="flex flex-col bg-gradient-to-b from-slate-50 to-[#f4f6f9] min-h-screen">
        <AdminTopbar
          admin={admin}
          onRefresh={() => setRefreshKey((v) => v + 1)}
        />
        <main className="flex-1 p-7 max-w-[1440px] w-full">
          <div className="flex flex-col gap-5">{children}</div>
        </main>
      </div>
    </div>
  );
}