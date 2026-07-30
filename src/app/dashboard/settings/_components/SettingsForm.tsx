"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { useSettings, SettingsTab } from "../_hooks/useSettings";

export default function SettingsForm() {
  const {
    activeTab, setActiveTab,
    shopName, setShopName,
    shopBio, setShopBio,
    email, setEmail,
    warehouseCity, setWarehouseCity,
    shippingStandard, setShippingStandard,
    shippingExpress, setShippingExpress,
    handleSave,
  } = useSettings();

  const TABS = [
    { id: "profile", label: "Hồ sơ Cửa hàng", icon: "storefront" },
    { id: "shipping", label: "Vận chuyển", icon: "local_shipping" },
    { id: "payments", label: "Thanh toán", icon: "payments" },
    { id: "security", label: "Bảo mật", icon: "shield_lock" },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation (Desktop) / Tab Bar (Mobile) */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:bg-surface-container-low p-2 rounded-xl sticky top-24 hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 shrink-0",
                activeTab === tab.id
                  ? "bg-primary-container/10 text-primary border-b-4 md:border-b-0 md:border-r-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              ].join(" ")}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span className="font-label-md whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Settings Panels */}
      <section className="flex-grow space-y-6">
        
        {/* Shop Profile Section */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm">
              <h2 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                Nhận diện Cửa hàng
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Logo Upload */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high border-2 border-dashed border-outline flex items-center justify-center relative">
                      <Image src="https://picsum.photos/seed/shoplogo/200/200" alt="Shop Logo" fill className="object-cover" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-lg hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                    </button>
                  </div>
                  <div>
                    <p className="font-label-md font-bold">Logo Cửa hàng</p>
                    <p className="font-body-sm text-on-surface-variant">SVG, PNG hoặc JPG (tối thiểu 500px)</p>
                  </div>
                </div>
                
                {/* Name & Bio */}
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">Tên Cửa hàng</label>
                    <input 
                      type="text" 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">Mô tả Shop</label>
                    <textarea 
                      rows={4}
                      value={shopBio}
                      onChange={(e) => setShopBio(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm">
              <h2 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Thông tin Liên hệ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">Email Công khai</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">Thành phố Kho hàng</label>
                  <input 
                    type="text" 
                    value={warehouseCity}
                    onChange={(e) => setWarehouseCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave}>Lưu Hồ sơ</Button>
            </div>
          </div>
        )}

        {/* Shipping Preferences Section */}
        {activeTab === "shipping" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm">
              <h2 className="font-headline font-bold text-xl mb-6">Chiến lược Giao hàng</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-container/20 rounded-full text-primary">
                      <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div>
                      <p className="font-label-md font-bold">Giao hàng Tiêu chuẩn</p>
                      <p className="font-body-sm text-on-surface-variant">3-5 ngày làm việc toàn quốc</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={shippingStandard} onChange={() => setShippingStandard(!shippingStandard)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary-container/20 rounded-full text-secondary">
                      <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div>
                      <p className="font-label-md font-bold">Giao hàng Hỏa tốc</p>
                      <p className="font-body-sm text-on-surface-variant">24 giờ trong cùng thành phố</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={shippingExpress} onChange={() => setShippingExpress(!shippingExpress)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments & Security tabs placeholders for UI matching design */}
        {activeTab === "payments" && (
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-headline font-bold text-xl mb-6">Phương thức Thanh toán</h2>
            <div className="p-4 border-2 border-primary bg-primary-container/5 rounded-xl flex items-start gap-4 max-w-lg">
              <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
              <div className="flex-grow">
                <p className="font-label-md font-bold">Chuyển khoản Ngân hàng</p>
                <p className="font-body-sm text-on-surface-variant">Kết thúc bằng •••• 4291</p>
                <span className="mt-2 inline-block px-2 py-0.5 bg-primary text-on-primary text-[10px] rounded-full uppercase tracking-tighter">Mặc định</span>
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-headline font-bold text-xl mb-6">Bảo mật Tài khoản</h2>
            <p className="text-on-surface-variant font-body-sm mb-4">Các tính năng bảo mật tài khoản sẽ được tích hợp tại đây.</p>
          </div>
        )}

      </section>
    </div>
  );
}
