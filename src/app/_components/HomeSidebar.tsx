"use client";

import React from "react";
import Link from "next/link";

import LocationMap from "@/components/ui/LocationMap";

const COLLECTIONS = [
  {
    title: "Hoài niệm Film",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCExxnL4KhiKKXZRr0Kkg2zSlN-qgY66E0Kjydii6qeMOBPwIAjSPkDh9AFmpeI2LXJwpUtSXclqIXrDhnPakePGQEo5PQwSjiLAsBtMJYQFThILC2EaIgN62RyjeP7yHMZKDpSbL2io-6hpizpkM_qFNg50A2eszNY_1g2LVRjNOHSgX227yl89kTFVpalcTsPfi5BjQH8rio7QyB4nDkGn8Z_YsyrBmm2LRWA22Wh6DYOKgUa2RQ8ICIWFVejFAj9NCuvLThannE",
    slug: "film",
  },
  {
    title: "Gốm Nghệ Thuật",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-lQkO8_Wiu-jF-Lqw5WrdnX9UbhkDNhd2SB5avDy92FcRleuXjJ--_sbjmPpAIwBRjC9H9vAhROCRGKDy6MdPdCNsm-gtPx81jKpKT1ovNiS4Cf_kJ8iF7RNMlp977m03h-UhM6KKNkf_Q7JHzSWkJPQzmsjIeYlZtARlewuPo9oyA9T1CT_OjlOIGucqkW1Pj6d2keHH3fWvhRZs7SJDrzmoewaTbjN10WXJZzNxsPlKayVIYjhqHu3IiTkD5H195LZDfgFTbQs",
    slug: "decor",
  },
  {
    title: "Âm Nhạc Cũ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABLt2dHr0sK6GSY9jJMFQPG0KptMWULKZppajQDB7SAZd7LIIYIwX1AjqSwol5kWw-MhMQFZ9TagiT1OWE-5zmKKTiAO431CEjb8PqE7zI0nib0LzzsnLVFl2hGnXHJqtSvIjt8JHvRNXVMsZjzzDxnuyQ3aAW1vud5J3c-g5UiUiJMSHaMoOGR3m4U-FU43Qbzf4da9Rd1WHQgD_Tuhebj1lGt5Cbi-PO1HQF7bJyQbLu5Kgbjgjc7PphA24SsZ44GmeniLW3XjU",
    slug: "audio",
  },
  {
    title: "Văn Phòng Phẩm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRN3LAogMSeKk2Ga5FBSqnQEkShxYaMzedXDC2YuGTKwjdV0Ci_O54V9xJ1_OkNw6Jv5X27G-8rhX0gfDf9zbYyBuUJHta4SCz_Nk1VcJQhBjNq_v8sRJSfVQ5Hzc174sgBLCjSU51KnAxFQRIg37SYFHNQP0RQgAfkxxxM54NBM4_MWaN5X8yDfXutQxYT-1qjKRARSj8kvcWIHIwI8a3tdO-o9mtxAlB_JKPYUcdhwkkSt9di1dMAGGp1ARJMCZJD3-7qQm0rD8",
    slug: "books",
  },
];

export default function HomeSidebar(): React.ReactElement {
  return (
    <aside className="md:col-span-4 space-y-8">
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 overflow-hidden">
        <h3 className="font-headline font-bold text-headline-sm mb-4">Khu Vực Của Bạn</h3>
        <div className="mb-4">
          <LocationMap />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-body-sm text-on-surface-variant">Sản phẩm gần đây</span>
            <span className="text-label-md font-bold text-primary">1,240+</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline font-bold text-headline-sm">Góc Sưu Tầm</h3>
          <Link
            href="/search"
            className="text-label-sm text-primary underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {COLLECTIONS.map((col) => (
            <Link key={col.title} href={`/search?category=${col.slug}`} className="group cursor-pointer block">
              <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-white p-1">
                <img
                  className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
                  src={col.image}
                  alt={col.title}
                />
              </div>
              <p className="text-label-sm font-bold truncate text-on-surface">{col.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
