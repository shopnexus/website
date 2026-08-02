"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

export default function ProfileForm() {
  const { user, fetchProfile } = useAuthStore();
  
  // Profile Fields
  const [name, setName] = useState(user?.username || "");
  const [description, setDescription] = useState(user?.profile?.description || "");
  const [country, setCountry] = useState(user?.profile?.country || "VN");
  const [gender, setGender] = useState(user?.profile?.gender || "unspecified");
  const [dob, setDob] = useState(user?.profile?.date_of_birth ? user.profile.date_of_birth.substring(0, 10) : "");
  const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar?.url || "");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setDescription(user.profile?.description || "");
      setCountry(user.profile?.country || "VN");
      setGender(user.profile?.gender || "unspecified");
      setDob(user.profile?.date_of_birth ? user.profile.date_of_birth.substring(0, 10) : "");
      setAvatarPreview(user.profile?.avatar?.url || "");
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Kích thước ảnh tối đa là 5MB.");
    }

    setIsUploading(true);
    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    try {
      // 1. Request presigned URL
      const { data: slot } = await AccountService.requestUpload({
        filename: file.name,
        mime: file.type,
        size: file.size,
        kind: "avatar"
      });

      // 2. Upload file to presigned URL
      // Use Next.js proxy by taking only pathname + search to bypass CORS
      const parsedUrl = new URL(slot.url, window.location.origin);
      const proxiedUrl = parsedUrl.pathname.startsWith('/api/v1') 
        ? parsedUrl.pathname + parsedUrl.search 
        : slot.url;

      const uploadRes = await fetch(proxiedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          ...(slot.headers || {})
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      // 3. Confirm upload
      await AccountService.confirmUpload(slot.resource_id);

      // 4. Update profile with new avatar
      await AccountService.updateProfile({
        name: name, // required
        country: country, // required
        locale: "vi-VN",
        timezone: "Asia/Ho_Chi_Minh",
        avatar_resource_id: slot.resource_id
      });

      toast.success("Cập nhật ảnh đại diện thành công.");
      await fetchProfile();
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
      setAvatarPreview(user?.profile?.avatar?.url || ""); // Revert
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await AccountService.updateProfile({
        name,
        description: description || undefined,
        clear_description: !description,
        country,
        gender: gender === "unspecified" ? undefined : gender,
        clear_gender: gender === "unspecified",
        date_of_birth: dob ? new Date(dob).toISOString() : undefined,
        clear_date_of_birth: !dob,
        locale: "vi-VN",
        timezone: "Asia/Ho_Chi_Minh",
      });
      toast.success("Cập nhật hồ sơ thành công.");
      await fetchProfile(); // Refresh store data
    } catch (error: any) {
      // Error handled by apiClient
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-6 border-b border-outline-variant">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
              )}
            </div>
            <button 
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <span className="material-symbols-outlined">photo_camera</span>
              <span className="text-[10px] font-medium mt-1">Thay đổi</span>
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
            <h3 className="font-headline-sm font-bold text-on-surface">Ảnh đại diện</h3>
            <p className="font-body-sm text-on-surface-variant max-w-sm">
              Ảnh định dạng JPG, PNG hoặc GIF. Kích thước tối đa 5MB. Ảnh sẽ được công khai với mọi người.
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Tên hiển thị <span className="text-error">*</span></label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
                required
              />
            </div>
            
            <div>
              <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Quốc gia <span className="text-error">*</span></label>
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
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
              <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Ngày sinh</label>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
              />
            </div>
            
            <div>
              <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Giới tính</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
              >
                <option value="unspecified">Không chỉ định</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Tiểu sử (Giới thiệu bản thân)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md resize-none"
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
