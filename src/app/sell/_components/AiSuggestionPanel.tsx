"use client";

import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useSuggestListing } from "@/hooks/api/useCatalog";
import type { ListingSuggestion, ResourceId } from "@/api/generated/types.gen";

/**
 * Ask the model to fill in the form.
 *
 * It reads the photos the seller has already uploaded plus whatever they said — typed, or a
 * recording transcribed server-side. The route writes nothing: what comes back is a
 * proposal, and the seller is expected to correct it before posting. So this panel hands
 * the answer upward and nothing else happens until they press publish.
 *
 * The recording travels inline as base64 because it is input rather than content — nothing
 * keeps it, so there is no upload to confirm and nothing to reap.
 */
export default function AiSuggestionPanel({
  attachments,
  onSuggestion,
}: {
  attachments: ResourceId[];
  onSuggestion: (suggestion: ListingSuggestion) => void;
}) {
  const suggest = useSuggestListing();
  const [note, setNote] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const voiceRef = useRef<{ base64: string; mime: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickVoiceNote = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    // Chunked rather than spread into one call: a megabyte of samples blows the argument
    // limit of String.fromCharCode.
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    voiceRef.current = { base64: btoa(binary), mime: file.type };
    setVoiceName(file.name);
  };

  const run = () => {
    const voice = voiceRef.current;
    if (attachments.length === 0 && !note.trim() && !voice) {
      toast.error("Cần ít nhất một ảnh, một mô tả hoặc một ghi âm.");
      return;
    }

    suggest.mutate(
      {
        attachments: attachments.length > 0 ? attachments : undefined,
        note: note.trim() || undefined,
        voice_note: voice?.base64,
        voice_note_mime: voice?.mime,
        language: "vi",
      },
      {
        onSuccess: (suggestion) => {
          onSuggestion(suggestion);
          toast.success("Đã điền sẵn thông tin. Vui lòng kiểm tra lại trước khi đăng.");
        },
      },
    );
  };

  return (
    <div className="bg-secondary-container/30 border border-secondary/20 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">auto_awesome</span>
        <h4 className="text-sm font-bold text-on-surface">Điền thông tin bằng AI</h4>
      </div>
      <p className="text-xs text-on-surface-variant">
        Tải ảnh lên rồi mô tả nhanh sản phẩm. Hệ thống sẽ điền sẵn tên, danh mục, tình trạng và
        mô tả — bạn vẫn là người kiểm tra và đăng tin. Giá chỉ được điền nếu bạn nói ra.
      </p>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ví dụ: iPhone 13 128GB màu xanh, dùng 1 năm, còn bảo hành, muốn bán 9 triệu."
        className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary resize-y min-h-[80px]"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <span className="material-symbols-outlined text-[16px] mr-1">mic</span>
          {voiceName ? "Đổi ghi âm" : "Thêm ghi âm"}
        </Button>
        {voiceName && (
          <span className="text-xs text-on-surface-variant max-w-[200px] truncate">{voiceName}</span>
        )}
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          ref={fileInputRef}
          onChange={pickVoiceNote}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="ml-auto"
          disabled={suggest.isPending}
          onClick={run}
        >
          {suggest.isPending ? "Đang phân tích..." : "Điền giúp tôi"}
        </Button>
      </div>
    </div>
  );
}
