import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

export const metadata = {
  title: "RentHub — Căn hộ & Homestay cho thuê",
  description: "Khám phá căn hộ, homestay, nhà trọ. Quản lý hợp đồng, hóa đơn và không gian sống hiện đại.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
