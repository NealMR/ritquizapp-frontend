"use client";
import { QRCodeSVG } from "qrcode.react";
import type { ClassRoom } from "@/lib/types";

export default function JoinQR({ c, size = 200 }: { c: ClassRoom; size?: number }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/join/${c.join_token}` : `/join/${c.join_token}`;
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="rounded-xl border border-line bg-white p-3"><QRCodeSVG value={url} size={size} /></div>
      <p className="text-sm text-slate-600">Or enter code</p>
      <p className="font-display text-4xl font-extrabold tracking-[0.2em]">{c.join_code}</p>
    </div>
  );
}
