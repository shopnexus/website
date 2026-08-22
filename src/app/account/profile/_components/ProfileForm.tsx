"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUpdateProfile, useUploadFile } from "@/hooks/api/useAccount";
import { toast } from "react-hot-toast";
import type { ProfileGender } from "@/api/generated/types.gen";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/** The select's extra option, which maps to clearing the field rather than to a value. */
const UNSPECIFIED = "unspecified";

export default function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [name, setName] = useState(user?.username || "");
  const [description, setDescription] = useState(user?.profile?.description || "");
  const [country, setCountry] = useState(user?.profile?.country || "VN");
  const [gender, setGender] = useState<ProfileGender | typeof UNSPECIFIED>(
    (user?.profile?.gender as ProfileGender) || UNSPECIFIED,
  );
  const [dob, setDob] = useState(user?.profile?.date_of_birth?.substring(0, 10) ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar?.url || "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfile();
  const uploadFile = useUploadFile();

  /**
   * Load the form when the account behind it changes.
   *
   * Adjusted during render rather than in an effect: an effect would paint an empty form
   * first and fill it on a second pass. Keyed on the account id, not on the user object,
   * so a save that refreshes the profile does not wipe whatever is in the inputs — only
   * signing in as someone else resets them.
   */
  const [loadedAccountId, setLoadedAccountId] = useState(user?.id);
  if (user && user.id !== loadedAccountId) {
    setLoadedAccountId(user.id);
    setName(user.username || "");
    setDescription(user.profile.description || "");
    setCountry(user.profile.country || "VN");
    setGender((user.profile.gender as ProfileGender) || UNSPECIFIED);
    setDob(user.profile.date_of_birth?.substring(0, 10) ?? "");
    setAvatarPreview(user.profile.avatar?.url || "");
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Kích thước ảnh tối đa là 5MB.");
      return;
    }

    const previousPreview = avatarPreview;
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    try {
      // Upload, then attach: the resource exists on its own and only becomes the avatar
      // once the profile points at it.
      const resource = await uploadFile.mutateAsync({ file, kind: "avatar" });
      await updateProfile.mutateAsync({ avatar_resource_id: resource.id });

      toast.success("Cập nhật ảnh đại diện thành công.");
      await fetchProfile();
    } catch {
      // The global handler raises the toast; this only puts the preview back.
      setAvatarPreview(previousPreview);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile.mutate(
      {
        name,
        country,
        // Clearing is an explicit flag, not a null: the request type has no nullable
        // fields, so an empty description has to say so.
        description: description || undefined,
        clear_description: !description,
        gender: gender === UNSPECIFIED ? undefined : gender,
        clear_gender: gender === UNSPECIFIED,
        date_of_birth: dob ? new Date(dob).toISOString() : undefined,
        clear_date_of_birth: !dob,
        locale: "vi-VN",
        timezone: "Asia/Ho_Chi_Minh",
      },
      {
        onSuccess: async () => {
          toast.success("Cập nhật hồ sơ thành công.");
          await fetchProfile();
        },
      },
    );
  };

  const isUploading = uploadFile.isPending;
  const isUpdating = updateProfile.isPending;

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-6 border-b border-outline-variant">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant">person</span>
              )}
            </div>
            <button 
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <span className="material-symbols-outlined">photo_camera</span>
              <span className="text-label-xs mt-1">Thay đổi</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-title-md text-on-surface">Ảnh đại diện</h3>
            <p className="text-body-sm text-on-surface-variant max-w-sm">
              Ảnh định dạng JPG, PNG hoặc GIF. Kích thước tối đa 5MB. Ảnh sẽ được công khai với mọi người.
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-label-md text-on-surface mb-1.5">Tên hiển thị <span className="text-error">*</span></label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-label-md text-on-surface mb-1.5">Quốc gia <span className="text-error">*</span></label>
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
                required
              >
                <option value="VN">Việt Nam</option>
                <option value="US">Hoa Kỳ</option>
                <option value="JP">Nhật Bản</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-label-md text-on-surface mb-1.5">Ngày sinh</label>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-label-md text-on-surface mb-1.5">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as ProfileGender | typeof UNSPECIFIED)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
              >
                <option value="unspecified">Không chỉ định</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-label-md text-on-surface mb-1.5">Tiểu sử (Giới thiệu bản thân)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary resize-none"
              placeholder="Chia sẻ một chút về bản thân bạn..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-outline-variant">
          <Button type="submit" disabled={isUpdating || isUploading}>
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
