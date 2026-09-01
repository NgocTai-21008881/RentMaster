"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button, Field, inputClass } from "@/components/ui";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("owner@demo.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    const next = new URLSearchParams(window.location.search).get("next");
    const dest = next?.startsWith("/") && !next.startsWith("//")
      ? next
      : user.role === "tenant" ? "/portal" : "/dashboard";
    window.location.href = dest;
  }, [loading, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password, new URLSearchParams(window.location.search).get("next"));
      toast?.success("Đăng nhập thành công");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#c7d2fe,_#f8fafc_42%,_#ede9fe)] px-4 py-10">
      <div className="mx-auto mb-6 max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          ← Về trang chủ
        </Link>
      </div>
      <div className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">RentHub Property OS</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-tight text-slate-900">Quản lý căn hộ & homestay trên một nền tảng.</h1>
          <p className="mt-4 max-w-lg text-slate-600">
            Hợp đồng điện tử, điện nước, hóa đơn, thanh toán, báo cáo doanh thu, cổng người thuê và chatbot AI.
          </p>
        </section>
        <section className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-2xl font-bold">Đăng nhập</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chưa có tài khoản? <a className="text-indigo-600" href="/register">Đăng ký người thuê</a>
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Field label="Email">
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Mật khẩu">
              <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <div className="flex justify-end text-sm">
              <a className="text-indigo-600" href="/forgot-password">Quên mật khẩu?</a>
            </div>
            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
            <Button className="w-full" disabled={submitting}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          <div className="mt-5 grid gap-2 text-xs text-slate-500">
            <p>Admin: admin@demo.com / Admin@123</p>
            <p>Chủ nhà: owner@demo.com / Admin@123</p>
            <p>Người thuê: tenant1@demo.com / Tenant@123</p>
          </div>
        </section>
      </div>
    </main>
  );
}
