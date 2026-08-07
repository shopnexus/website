"use client";

/**
 * One scan slot: a dashed frame that becomes the photo once it is uploaded.
 *
 * The file input is hidden behind a label rather than styled, because a styled `<input
 * type="file">` is the one control browsers will not let you restyle consistently — and
 * the label keeps it operable from the keyboard, which a `div` with an onClick would not.
 */
export default function ScanUploader({
  id,
  label,
  hint,
  previewUrl,
  uploading,
  onPick,
}: {
  id: string;
  label: string;
  hint: string;
  previewUrl: string | undefined;
  uploading: boolean;
  onPick: (file: File) => void;
}) {
  return (
    <div>
      {/* The preview is a background rather than an <img>: its source is an object URL
          over a local file, which is neither a remote pattern next/image can be
          configured for nor something worth optimising. */}
      <label
        htmlFor={id}
        aria-label={label}
        style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
        className="block aspect-[3/2] rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest bg-cover bg-center relative overflow-hidden cursor-pointer hover:border-primary transition-colors focus-within:border-primary"
      >
        {!previewUrl && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl opacity-60">add_a_photo</span>
            <span className="font-label-sm">{label}</span>
          </span>
        )}

        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="material-symbols-outlined animate-spin text-white text-3xl">
              progress_activity
            </span>
          </span>
        )}
      </label>

      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          // Reset so picking the same file twice still fires a change event, which is
          // what a seller does after a blurry first attempt.
          event.target.value = "";
        }}
      />

      <p className="text-[11px] text-on-surface-variant mt-2 leading-snug">{hint}</p>
    </div>
  );
}
