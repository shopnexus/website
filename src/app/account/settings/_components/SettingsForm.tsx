"use client";

import Link from "next/link";
import OptionList from "./OptionList";
import PickupAddressPicker from "./PickupAddressPicker";
import { useSettings } from "../_hooks/useSettings";
import type { SettingsTab } from "../types";

const CARD =
  "rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6";

const TABS: Array<{ id: SettingsTab; label: string; icon: string }> = [
  { id: "pickup", label: "Địa chỉ lấy hàng", icon: "local_shipping" },
  { id: "shipping", label: "Đơn vị vận chuyển", icon: "conveyor_belt" },
  { id: "payments", label: "Thanh toán", icon: "payments" },
];

export default function SettingsForm() {
  const {
    tab,
    setTab,
    contacts,
    contactsLoading,
    setDefaultPickup,
    isSaving,
    carriers,
    carriersLoading,
    rails,
    railsLoading,
  } = useSettings();

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 flex-shrink-0">
        <nav
          className="flex md:flex-col gap-1 overflow-x-auto md:bg-surface-container-low p-2 rounded-xl md:sticky md:top-24 hide-scrollbar"
          aria-label="Mục cài đặt"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 shrink-0 cursor-pointer",
                tab === item.id
                  ? "bg-primary-container/10 text-primary border-b-4 md:border-b-0 md:border-r-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-label-md whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex-grow space-y-6">
        {tab === "pickup" && (
          <div className={CARD}>
            <h2 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Địa chỉ lấy hàng mặc định
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-6 max-w-xl">
              Nơi đơn vị vận chuyển đến lấy hàng, và cũng là vị trí người mua nhìn thấy trên tin
              đăng của bạn.
            </p>
            <PickupAddressPicker
              contacts={contacts}
              loading={contactsLoading}
              saving={isSaving}
              onChoose={setDefaultPickup}
            />
          </div>
        )}

        {tab === "shipping" && (
          <div className={CARD}>
            <h2 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">conveyor_belt</span>
              Đơn vị vận chuyển đang hoạt động
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-6 max-w-xl">
              Người mua chọn một trong các đơn vị này khi thanh toán và trả phí giao hàng. Danh
              sách do nền tảng cấu hình — người bán không bật/tắt được từng đơn vị.
            </p>
            <OptionList
              options={carriers}
              loading={carriersLoading}
              icon="local_shipping"
              emptyLabel="Hiện chưa có đơn vị vận chuyển nào được bật."
            />
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-6">
            <div className={CARD}>
              <h2 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Người mua thanh toán bằng
              </h2>
              <p className="text-body-sm text-on-surface-variant mb-6 max-w-xl">
                Tiền hàng được nền tảng giữ hộ tới khi đơn kết thúc, sau đó vào số dư khả dụng của
                bạn.
              </p>
              <OptionList
                options={rails}
                loading={railsLoading}
                icon="credit_card"
                emptyLabel="Hiện chưa có phương thức thanh toán nào được bật."
              />
            </div>

            <div className={`${CARD} flex flex-wrap items-center justify-between gap-4`}>
              <div>
                <h2 className="text-title-md text-on-surface mb-1">Nhận tiền về ngân hàng</h2>
                <p className="text-body-sm text-on-surface-variant">
                  Tài khoản ngân hàng, yêu cầu rút tiền và đăng ký thuế nằm trong ví của bạn.
                </p>
              </div>
              <Link
                href="/account/wallet"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-md hover:brightness-110 transition-all"
              >
                Mở ví
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
