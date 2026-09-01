"use client";

import Header from "@/components/Header";
import { useMenu } from "@/context/MenuContext";

export default function PageShell({ title, actions, children }) {
  const { openMenu } = useMenu();

  return (
    <div className="min-h-screen">
      <Header title={title} onMenu={openMenu} />
      <div className="space-y-6 p-4 lg:p-8">
        {actions ? <div className="flex justify-end">{actions}</div> : null}
        {children}
      </div>
    </div>
  );
}
