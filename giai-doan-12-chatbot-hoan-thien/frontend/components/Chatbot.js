"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { chatbotApi } from "@/lib/api";

const starters = ["Phòng nào đang còn trống?", "Tôi còn hóa đơn nào chưa thanh toán?", "Hợp đồng của tôi khi nào hết hạn?"];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Xin chào, tôi là trợ lý RentHub. Bạn có thể hỏi về phòng trống, hóa đơn, hợp đồng hoặc quy trình báo sự cố." },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text) {
    const content = (text || question).trim();
    if (!content || loading) return;
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: content }]);
    setLoading(true);
    try {
      const res = await chatbotApi.ask(content);
      setMessages((prev) => [...prev, { role: "bot", text: res.data.reply, source: res.data.source }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="mb-3 flex h-[460px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Trợ lý RentHub</p>
              <p className="text-xs text-indigo-100">Dữ liệu thật từ hệ thống</p>
            </div>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user" ? "ml-auto bg-indigo-600 text-white" : "bg-white text-slate-700 shadow-sm"
                }`}
              >
                <p>{message.text}</p>
              </div>
            ))}
            {loading ? <p className="text-xs text-slate-400">Đang truy vấn dữ liệu...</p> : null}
            <div ref={bottomRef} />
          </div>
          <div className="space-y-2 border-t p-3">
            <div className="flex flex-wrap gap-1.5">
              {starters.map((item) => (
                <button key={item} type="button" onClick={() => send(item)} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">
                  {item}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input className="flex-1 rounded-xl border px-3 py-2 text-sm" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Nhập câu hỏi..." />
              <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Gửi</button>
            </form>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle />
      </button>
    </div>
  );
}
