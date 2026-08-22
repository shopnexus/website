"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useCoarsePointer } from "@/hooks/useMediaQuery";

/**
 * The dock before there is anything to read: a few questions worth asking, and a box.
 *
 * Its own composer rather than the thread's. The thread's box owns its text so it can hand
 * the message to the outbox and clear itself, and these chips have to write into that text —
 * a chip that could not be edited before sending would be useless on "Mình xem trực tiếp ở
 * Ninh Bình được không?", where the whole point is the part you change.
 *
 * The chips fill the box; they do not send. One tap is already most of the work, and the tap
 * that sends should be a tap that means "send".
 *
 * No attachment button here either, deliberately: nothing has been created yet, and the first
 * message into a stranger's inbox is a question. Once the thread exists the real composer
 * takes over, pictures and all.
 */
const MAX_HEIGHT_PX = 120;

export default function ChatDockIntro({
  sellerName,
  prompts,
  isSending,
  onSend,
}: {
  sellerName: string;
  prompts: readonly string[];
  isSending: boolean;
  /** Resolves false when the send failed, and the text stays where it was typed. */
  onSend: (body: string) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  const enterSends = !useCoarsePointer();

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [text]);

  const pick = (prompt: string) => {
    setText(prompt);
    box.current?.focus();
  };

  const submit = async () => {
    if (isSending || text.trim() === "") return;
    const sent = await onSend(text);
    if (sent) setText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col justify-end gap-3 overflow-y-auto p-3">
        <p className="text-center font-body-sm text-on-surface-variant">
          Chưa có tin nhắn nào với{" "}
          <span className="font-semibold text-on-surface">{sellerName}</span>. Hỏi gì cũng được
          — người bán sẽ thấy kèm sản phẩm này.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => pick(prompt)}
              className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-left font-label-sm text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-outline-variant bg-surface p-2.5">
        <div className="flex items-end gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            ref={box}
            rows={1}
            value={text}
            disabled={isSending}
            placeholder={`Viết tin nhắn cho ${sellerName}...`}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              if (!enterSends || event.shiftKey) return;
              event.preventDefault();
              void submit();
            }}
            className="flex-1 resize-none border-none bg-transparent px-1.5 py-1.5 font-body-sm text-on-surface outline-none placeholder:text-outline focus:ring-0 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isSending || text.trim() === ""}
            aria-label="Gửi tin nhắn"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary transition-transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:bg-surface-container-high disabled:text-outline"
          >
            <span
              className={[
                "material-symbols-outlined text-[17px]",
                isSending ? "animate-spin" : "",
              ].join(" ")}
              style={{ fontVariationSettings: isSending ? undefined : "'FILL' 1" }}
            >
              {isSending ? "progress_activity" : "send"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
