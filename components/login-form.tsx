"use client"

import { useState } from "react"
import { Eye, EyeOff, Building2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { actionLogin } from "@/app/actions/auth"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    const result = await actionLogin(email, password)

    if (!result.ok) {
      setError(result.pesan)
      setIsLoading(false)
      return
    }

    // TODO: redirect ke dashboard setelah login berhasil
    window.location.href = "/dashboard"
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-4">
      {/* Ornamen latar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / identitas */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">
              Selamat datang di
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              App Kantor
            </h1>
          </div>
        </div>

        {/* Card login */}
        <Card className="border-0 bg-white/[0.06] shadow-2xl ring-1 ring-white/10 backdrop-blur-xl dark:bg-white/[0.04]">
          <CardHeader className="border-b border-white/[0.08] pb-4">
            <CardTitle className="text-base text-white/90">Masuk ke akun Anda</CardTitle>
            <CardDescription className="text-white/40">
              Gunakan kredensial yang diberikan administrator
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-4 pt-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-white/60"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@uinpalopo.ac.id"
                  required
                  className="h-10 border-white/10 bg-white/[0.07] text-white placeholder:text-white/20 focus-visible:border-white/30 focus-visible:ring-white/10"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-white/60"
                  >
                    Kata Sandi
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-white/40 transition-colors hover:text-white/70"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="h-10 border-white/10 bg-white/[0.07] pr-10 text-white placeholder:text-white/20 focus-visible:border-white/30 focus-visible:ring-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 border-t-0 bg-transparent px-4 pb-5 pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="h-10 w-full rounded-lg bg-white text-zinc-900 font-medium hover:bg-white/90 disabled:opacity-50"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
              <p className="text-center text-xs text-white/25">
                Hubungi administrator jika mengalami kesulitan masuk
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-6 text-center text-[11px] text-white/20">
          © {new Date().getFullYear()} App Kantor. Semua hak dilindungi.
        </p>
      </div>
    </div>
  )
}
