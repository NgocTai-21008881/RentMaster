"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Button, Field, inputClass } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { authApi, fileSrc } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  return (
    <AppShell title="Hồ sơ" allow={user?.role === "tenant" ? "tenant" : "staff"}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Thông tin cá nhân</h2>
          {user?.avatar ? <img src={fileSrc(user.avatar)} alt="" className="mt-3 h-20 w-20 rounded-full object-cover" /> : null}
          <div className="mt-4 space-y-3">
            <Field label="Họ tên"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="SĐT"><input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="Avatar">
              <input type="file" onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const form = new FormData();
                form.append("name", name);
                form.append("phone", phone);
                form.append("avatar", file);
                await authApi.updateProfile(form);
                await refreshUser();
                toast.success("Đã cập nhật ảnh");
              }} />
            </Field>
            <Button onClick={async () => { const form = new FormData(); form.append("name", name); form.append("phone", phone); await authApi.updateProfile(form); await refreshUser(); toast.success("Đã lưu hồ sơ"); }}>Lưu</Button>
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Đổi mật khẩu</h2>
          <div className="mt-4 space-y-3">
            <Field label="Mật khẩu hiện tại"><input type="password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
            <Field label="Mật khẩu mới"><input type="password" className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} /></Field>
            <Button onClick={async () => { try { await authApi.changePassword({ current_password: current, new_password: next }); toast.success("Đã đổi mật khẩu"); } catch (e) { toast.error(e.message); } }}>Đổi mật khẩu</Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
