"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { Button, Field, inputClass } from "@/components/ui";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await authApi.forgot(email);
    setMessage(res.message);
    setToken(res.resetToken || "");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <Field label="Email">
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Button className="w-full">Gửi hướng dẫn</Button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {token ? (
          <p className="break-all text-xs text-slate-500">
            Token demo: {token}. <a className="text-indigo-600" href={`/reset-password?token=${token}`}>Đặt lại ngay</a>
          </p>
        ) : null}
        <a className="block text-center text-sm text-indigo-600" href="/login">
          Quay lại đăng nhập
        </a>
      </form>
    </main>
  );
}
