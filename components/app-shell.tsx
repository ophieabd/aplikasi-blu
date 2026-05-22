"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2, LayoutDashboard, BarChart3,
  Users, LogOut, Menu, X, ChevronDown,
  Banknote, BookOpen, PanelLeft,
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

function NavItem({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  )
  const Icon = item.icon
  const isActive = item.children
    ? item.children.some((c) => pathname.startsWith(c.href))
    : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

  if (item.children) {
    // Collapsed: link to first child, show only icon
    if (collapsed) {
      return (
        <Link
          href={item.children[0].href}
          title={item.label}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/80"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
        </Link>
      )
    }

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

  if (collapsed) {
    return (
      <Link
        href={item.href}
        title={item.label}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/80"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </Link>
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

function Sidebar({
  profile,
  collapsed,
  onToggleCollapse,
  onClose,
}: {
  profile: Profile
  collapsed: boolean
  onToggleCollapse: () => void
  onClose?: () => void
}) {
  const menuItems = getMenuItems(profile.role.kode)

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-0 py-4" : "justify-between px-4 py-4"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent ring-1 ring-sidebar-border">
              <Building2 className="h-4 w-4 text-sidebar-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">BLU UIN Palopo</p>
              <p className="text-[10px] text-sidebar-foreground/30">Penerimaan Dana</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <PanelLeft className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")} />
          </button>
          {onClose && (
            <button onClick={onClose} className="text-sidebar-foreground/40 hover:text-sidebar-foreground lg:hidden">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
          {menuItems.map((item) => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* User info + logout */}
      <div className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <div className="mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="text-xs font-medium text-sidebar-foreground/80 truncate">{profile.nama_lengkap}</p>
            <p className="text-[10px] text-sidebar-foreground/30 truncate">{profile.role.nama}</p>
          </div>
        )}
        <form action={actionLogout}>
          <button
            type="submit"
            title="Keluar"
            className={cn(
              "flex w-full items-center rounded-lg text-xs text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground/70",
              collapsed ? "h-9 justify-center" : "gap-2 px-3 py-2"
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && "Keluar"}
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
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className={cn(
        "hidden shrink-0 lg:block transition-all duration-200",
        collapsed ? "w-14" : "w-64"
      )}>
        <Sidebar
          profile={profile}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 z-50">
            <Sidebar
              profile={profile}
              collapsed={false}
              onToggleCollapse={() => {}}
              onClose={() => setSidebarOpen(false)}
            />
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
