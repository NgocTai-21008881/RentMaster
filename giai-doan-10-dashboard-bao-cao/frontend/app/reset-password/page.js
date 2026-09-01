"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { authApi } from "@/lib/api";
import { Button, Field, inputClass } from "@/components/ui";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    await authApi.reset(params.get("token"), password);
    setMessage("Đặt lại thành công. Đang chuyển về đăng nhập...");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
      <Field label="Mật khẩu mới">
        <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Field>
      <Button className="w-full">Cập nhật</Button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </form>
  );
}

export default function ResetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense>
        <ResetForm />
      </Suspense>
    </main>
  );
}
