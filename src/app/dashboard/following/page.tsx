"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function FollowingPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFollowing = async () => {
    try {
      const res = await AccountService.getFollowing();
      setSellers(res.data || []);
    } catch (error) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  const handleUnfollow = async (accountId: string) => {
    try {
      await AccountService.unfollowSeller(accountId);
      toast.success("Đã bỏ theo dõi gian hàng.");
      // Optimistic UI update
      setSellers(sellers.filter(s => s.id !== accountId));
    } catch (error) {
      // Revert if error
      fetchFollowing();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline-md font-bold text-on-surface mb-2">Đang theo dõi</h1>
        <p className="font-body-sm text-on-surface-variant">Danh sách các gian hàng mà bạn đang theo dõi.</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center p-12 bg-surface-container-lowest rounded-2xl text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">storefront</span>
            <p className="font-body-md">Bạn chưa theo dõi gian hàng nào.</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">Khám phá sản phẩm</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {sellers.map((seller) => (
              <div key={seller.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-outline-variant relative bg-surface-container-high flex shrink-0 items-center justify-center">
                    {seller.avatar?.url ? (
                      <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant">storefront</span>
                    )}
                  </div>
                  <div>
                    <Link href={`/shop/${seller.username || seller.id}`} className="font-label-lg font-bold text-on-surface hover:text-primary transition-colors">
                      {seller.name}
                    </Link>
                    <div className="font-body-sm text-on-surface-variant mt-0.5">
                      Đã tham gia {new Date(seller.created_at).getFullYear()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/shop/${seller.username || seller.id}`}>
                    <Button variant="outline">
                      Xem Shop
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => handleUnfollow(seller.id)}>
                    Đang theo dõi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
