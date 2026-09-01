"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button, Field, inputClass } from "@/components/ui";
import { useState } from "react";

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form, new URLSearchParams(window.location.search).get("next"));
      toast?.success("Đăng ký thành công");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Đăng ký người thuê</h1>
        <Field label="Họ tên">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Email">
          <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </Field>
        <Field label="Số điện thoại">
          <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Mật khẩu">
          <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </Field>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full" disabled={submitting}>
          {submitting ? "Đang tạo..." : "Tạo tài khoản"}
        </Button>
        <a className="block text-center text-sm text-indigo-600" href="/login">
          Đã có tài khoản? Đăng nhập
        </a>
      </form>
    </main>
  );
}
