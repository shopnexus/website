"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/use-auth-store";

export default function VerificationPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await AccountService.getVerificationHistory();
      setHistory(res.data || []);
    } catch (error) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartVerification = async () => {
    // In a real flow, this would redirect to a KYC provider URL (like Stripe Identity or Onfido)
    // Or open a modal to upload Front/Back of ID.
    toast.success("Tính năng xác minh danh tính đang được phát triển.");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline-md font-bold text-on-surface mb-2">Xác minh danh tính (KYC)</h1>
        <p className="font-body-sm text-on-surface-variant">Xác minh danh tính để mở khóa toàn bộ tính năng mua bán trên nền tảng.</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-headline-sm font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            Trạng thái hiện tại
          </h2>
          <div className="font-body-md">
            Bạn hiện đang ở trạng thái: <strong className="text-on-surface capitalize">{user?.identity_verified ? "Đã xác minh" : "Chưa xác minh"}</strong>
          </div>
          {!user?.identity_verified && (
             <p className="font-body-sm text-on-surface-variant mt-2 max-w-lg">
              Hoàn thành xác minh danh tính để có thể đăng bán sản phẩm và tham gia các tính năng nâng cao. Quá trình chỉ mất khoảng 3 phút.
             </p>
          )}
        </div>
        
        {!user?.identity_verified && (
          <Button onClick={handleStartVerification} className="shrink-0">
            Bắt đầu xác minh
          </Button>
        )}
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">history</span>
          Lịch sử xác minh
        </h2>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-6 bg-surface-container-lowest rounded-lg border border-outline-variant border-dashed text-on-surface-variant font-body-sm">
            Chưa có lịch sử xác minh nào.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
                <div>
                  <div className="font-label-md font-semibold text-on-surface capitalize">Trạng thái: {doc.status}</div>
                  <div className="font-body-sm text-on-surface-variant">Ngày cập nhật: {new Date(doc.updated_at || doc.created_at).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                    doc.status === 'rejected' ? 'bg-error/10 text-error' :
                    'bg-primary-container text-on-primary-container'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
