"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2, LayoutDashboard, BarChart3,
  Users, LogOut, Menu, X, ChevronDown,
  Banknote, BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { actionLogout } from "@/app/actions/auth"
import type { Profile } from "@/lib/session"

type MenuItem = {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string }[]
}

function getMenuItems(role: string): MenuItem[] {
  const common: MenuItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ]

  const adminMenu: MenuItem[] = [
    {
      label: "Penerimaan", href: "/penerimaan", icon: Banknote,
      children: [
        { label: "Daftar Penerimaan", href: "/penerimaan" },
        { label: "Input Baru", href: "/penerimaan/baru" },
        { label: "Import Excel/CSV", href: "/penerimaan/import" },
      ]
    },
    {
      label: "Master Data", href: "/master", icon: BookOpen,
      children: [
        { label: "Kategori Pendapatan", href: "/master/kategori-pendapatan" },
        { label: "Jenis Pendapatan", href: "/master/jenis-pendapatan" },
        { label: "Sub Pendapatan", href: "/master/sub-pendapatan" },
        { label: "Unit Kerja", href: "/master/unit-kerja" },
        { label: "Rekening Bank", href: "/master/rekening-bank" },
        { label: "Jenis Pemindahan Kas", href: "/master/jenis-pemindahan-kas" },
      ]
    },
    { label: "Pengguna", href: "/pengguna", icon: Users },
    {
      label: "Laporan", href: "/laporan", icon: BarChart3,
      children: [
        { label: "Laporan Harian", href: "/laporan/harian" },
        { label: "Laporan Bulanan", href: "/laporan/bulanan" },
        { label: "Rekap per Rekening", href: "/laporan/per-rekening" },
      ]
    },
  ]

  const operatorMenu: MenuItem[] = [
    {
      label: "Penerimaan", href: "/penerimaan", icon: Banknote,
      children: [
        { label: "Daftar Penerimaan", href: "/penerimaan" },
        { label: "Input Baru", href: "/penerimaan/baru" },
        { label: "Import Excel/CSV", href: "/penerimaan/import" },
      ]
    },
  ]

  const pimpinanMenu: MenuItem[] = [
    {
      label: "Laporan", href: "/laporan", icon: BarChart3,
      children: [
        { label: "Laporan Harian", href: "/laporan/harian" },
        { label: "Laporan Bulanan", href: "/laporan/bulanan" },
        { label: "Rekap per Rekening", href: "/laporan/per-rekening" },
      ]
    },
  ]

  if (role === "ADMIN") return [...common, ...adminMenu]
  if (role === "OPERATOR") return [...common, ...operatorMenu]
  if (role === "PIMPINAN") return [...common, ...pimpinanMenu]
  return common
}

function NavItem({ item }: { item: MenuItem }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  )
  const Icon = item.icon
  const isActive = item.children
    ? item.children.some((c) => pathname.startsWith(c.href))
    : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/80"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "rounded-md px-2 py-1.5 text-xs transition-colors",
                  pathname === child.href || pathname.startsWith(child.href)
                    ? "text-sidebar-foreground"
                    : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/80"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}

function Sidebar({ profile, onClose }: { profile: Profile; onClose?: () => void }) {
  const menuItems = getMenuItems(profile.role.kode)

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent ring-1 ring-sidebar-border">
            <Building2 className="h-4 w-4 text-sidebar-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sidebar-foreground">BLU UIN Palopo</p>
            <p className="text-[10px] text-sidebar-foreground/30">Penerimaan Dana</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sidebar-foreground/40 hover:text-sidebar-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {menuItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* User info + logout */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <p className="text-xs font-medium text-sidebar-foreground/80 truncate">{profile.nama_lengkap}</p>
          <p className="text-[10px] text-sidebar-foreground/30 truncate">{profile.role.nama}</p>
        </div>
        <form action={actionLogout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground/70"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </form>
      </div>
    </div>
  )
}

export function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <Sidebar profile={profile} />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-56 z-50">
            <Sidebar profile={profile} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground/50 hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-foreground/70">BLU UIN Palopo</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
