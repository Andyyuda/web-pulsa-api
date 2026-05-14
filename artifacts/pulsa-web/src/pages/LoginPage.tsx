import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginPulsa } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Check, AlertCircle, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Stage = "credentials" | "otp" | "done";

interface OtpState {
  otpType: string;
  otpHint: string;
  username: string;
  password: string;
}

interface TokenResult {
  username: string;
  token: string;
  balance: number | null;
  message: string;
}

async function verifyOtp(username: string, password: string, otp: string) {
  const resp = await fetch("/api/pulsa/login/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, otp }),
  });
  const data = await resp.json() as Record<string, unknown>;
  if (!resp.ok) throw new Error(String((data as { error?: string }).error ?? "Gagal"));
  return data as TokenResult;
}

export default function LoginPage() {
  const [stage, setStage] = useState<Stage>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpState, setOtpState] = useState<OtpState | null>(null);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<TokenResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Step 1: login
  const loginMut = useMutation({
    mutationFn: () => loginPulsa({ username: username.trim(), password: password.trim() }),
    onSuccess: (data) => {
      const d = data as Record<string, unknown>;
      if (d.needOtp) {
        setOtpState({
          otpType: String(d.otpType ?? "email"),
          otpHint: String(d.otpHint ?? ""),
          username: username.trim(),
          password: password.trim(),
        });
        setStage("otp");
        setError("");
        toast({ title: "OTP dikirim", description: String(d.message ?? "") });
      } else {
        setResult(d as TokenResult);
        setStage("done");
        setError("");
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? "Login gagal";
      setError(msg);
    },
  });

  // Step 2: OTP verify
  const otpMut = useMutation({
    mutationFn: () => verifyOtp(otpState!.username, otpState!.password, otp.trim()),
    onSuccess: (data) => {
      setResult(data);
      setStage("done");
      setError("");
    },
    onError: (err: unknown) => {
      const msg = (err as Error)?.message ?? "OTP salah";
      setError(msg);
    },
  });

  const copyToken = async () => {
    if (!result?.token) return;
    await navigator.clipboard.writeText(result.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Token disalin!" });
  };

  const copyFull = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`Username: ${result.username}\nToken: ${result.token}`);
    toast({ title: "Username + Token disalin!" });
  };

  const formatBalance = (n: number | null) =>
    n == null ? "-" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const isPending = loginMut.isPending || otpMut.isPending;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Login Isipulsa</h1>
          <p className="text-slate-400 text-sm mt-1">
            {stage === "otp" ? "Masukkan kode OTP yang dikirim" : "Masuk untuk mendapatkan token API"}
          </p>
        </div>

        {/* ── Stage: Credentials ── */}
        {stage === "credentials" && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <form onSubmit={(e) => { e.preventDefault(); setError(""); loginMut.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-300 text-sm">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username isipulsa"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                    autoComplete="username"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password isipulsa"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
                      autoComplete="current-password"
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
                  disabled={isPending || !username.trim() || !password.trim()}
                >
                  {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</> : "Login & Ambil Token"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Stage: OTP ── */}
        {stage === "otp" && otpState && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white text-base">Verifikasi OTP</CardTitle>
              </div>
              <CardDescription className="text-slate-400 text-xs">
                Kode OTP dikirim ke <span className="text-slate-300">{otpState.otpHint}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setError(""); otpMut.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-slate-300 text-sm">Kode OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukkan kode OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 text-center text-lg tracking-widest"
                    autoFocus
                    maxLength={8}
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
                  disabled={isPending || otp.trim().length < 4}
                >
                  {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memverifikasi...</> : "Verifikasi OTP"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStage("credentials"); setError(""); setOtp(""); }}
                  className="w-full text-xs text-slate-500 hover:text-slate-300 mt-1"
                >
                  Kembali ke login
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Stage: Done ── */}
        {stage === "done" && result && (
          <Card className="bg-slate-900 border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <CardTitle className="text-green-400 text-base">Login Berhasil</CardTitle>
              </div>
              <CardDescription className="text-slate-400 text-xs">{result.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Username</p>
                <p className="text-sm text-white font-mono bg-slate-800 rounded px-3 py-2">{result.username}</p>
              </div>
              {result.balance != null && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Saldo</p>
                  <p className="text-sm text-green-400 font-semibold">{formatBalance(result.balance)}</p>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-500">Token API</p>
                  <button onClick={copyToken} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Tersalin!" : "Salin"}
                  </button>
                </div>
                <div className="bg-slate-800 rounded px-3 py-2 break-all">
                  <p className="text-xs text-slate-200 font-mono leading-relaxed">{result.token}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-sm"
                onClick={copyFull}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                Salin Username + Token
              </Button>
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1 font-medium">Cara pakai di Bot WA:</p>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Ketik <span className="text-blue-400">.loginpulsa</span> di WhatsApp,<br />
                  lalu ikuti langkah yang diminta bot.
                </p>
              </div>
              <button
                onClick={() => { setStage("credentials"); setResult(null); setOtp(""); setUsername(""); setPassword(""); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300"
              >
                Login akun lain
              </button>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-center text-xs text-slate-600">isipulsa.web.id — Token API</p>
      </div>
    </div>
  );
}
