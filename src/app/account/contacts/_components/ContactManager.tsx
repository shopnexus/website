"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import PhoneVerification from "./PhoneVerification";
import { toast } from "react-hot-toast";
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from "@/hooks/api/useContacts";
import AreaPicker from "@/components/ui/AreaPicker";
import EmptyState from "@/components/ui/EmptyState";
import type { Contact, ContactId, CreateContactRequest } from "@/api/generated/types.gen";

/**
 * Normalise a Vietnamese phone number to E.164, which is what the server validates
 * against. A leading 0 is the national trunk prefix and is replaced by the country code.
 */
function toE164(phone: string): string {
  const trimmed = phone.replace(/\s+/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("0")) return `+84${trimmed.slice(1)}`;
  return `+${trimmed}`;
}

export default function ContactManager() {
  const { data: contacts = [], isLoading } = useContacts();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<ContactId | null>(null);

  const [formData, setFormData] = useState<CreateContactRequest>({
    full_name: "",
    phone: "",
    country: "VN",
    province_code: "",
    province_name: "",
    ward_code: "",
    ward_name: "",
    address: "",
    address_type: "home",
    is_default_delivery: false,
    is_default_pickup: false,
  });

  const handleOpenForm = (contact?: Contact) => {
    if (contact) {
      setEditingId(contact.id);
      setFormData({
        full_name: contact.full_name,
        phone: contact.phone,
        country: contact.country,
        province_code: contact.province_code,
        province_name: contact.province_name,
        ward_code: contact.ward_code,
        ward_name: contact.ward_name,
        address: contact.address,
        address_detail: contact.address_detail || "",
        address_type: contact.address_type,
        is_default_delivery: contact.is_default_delivery,
        is_default_pickup: contact.is_default_pickup,
      });
    } else {
      setEditingId(null);
      setFormData({
        full_name: "",
        phone: "",
        country: "VN",
        province_code: "",
        province_name: "",
        ward_code: "",
        ward_name: "",
        address: "",
        address_detail: "",
        address_type: "home",
        is_default_delivery: contacts.length === 0,
        is_default_pickup: contacts.length === 0,
      });
    }
    setIsFormOpen(true);
  };

  const handleDelete = (id: ContactId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    deleteContact.mutate(id, {
      onSuccess: () => toast.success("Đã xóa địa chỉ."),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The area picker is not a native form control, so `required` cannot carry this: an
    // address stops at the province otherwise, which the server refuses and no carrier
    // could collect from.
    if (!formData.province_code || !formData.ward_code) {
      toast.error("Hãy chọn tỉnh / thành phố và phường / xã.");
      return;
    }

    const payload: CreateContactRequest = {
      ...formData,
      phone: toE164(formData.phone),
    };

    // A blank optional field has to be omitted, not sent empty: the server validates
    // address_detail's length and "" is not a value it means to store.
    if (!payload.address_detail) {
      delete payload.address_detail;
    }

    try {
      if (editingId) {
        // This form only asserts province and ward, so a district saved before the tier
        // was dropped has to go with the write rather than survive under a new ward.
        await updateContact.mutateAsync({
          id: editingId,
          body: { ...payload, clear_district: true },
        });
        toast.success("Cập nhật địa chỉ thành công.");
      } else {
        await createContact.mutateAsync(payload);
        toast.success("Thêm địa chỉ thành công.");
      }
      // Only closed on success, so a rejected address keeps the form and its values.
      setIsFormOpen(false);
    } catch {
      // The global handler raises the toast, including per-field validation detail.
    }
  };

  const isSaving = createContact.isPending || updateContact.isPending;

  return (
    <div className="space-y-6">
      {!isFormOpen ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
            <div className="text-label-lg text-on-surface">Bạn có {contacts.length} địa chỉ đã lưu</div>
            <Button onClick={() => handleOpenForm()} icon={<span className="material-symbols-outlined">add</span>}>
              Thêm địa chỉ mới
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8"><span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span></div>
          ) : contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map(contact => (
                <div key={contact.id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6 relative group hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-title-md text-on-surface">{contact.full_name}</span>
                      {contact.is_default_delivery && <span className="text-label-sm bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">Mặc định</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenForm(contact)} className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(contact.id)} className="text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-4 text-body-md text-on-surface-variant">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {contact.phone}
                      <PhoneVerification contact={contact} />
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] mt-0.5">location_on</span>
                      <span>
                        {contact.address_detail ? `${contact.address_detail}, ` : ""}{contact.address}, {contact.ward_name}, {contact.province_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="text-label-sm bg-surface-container-high text-on-surface px-2 py-1 rounded">
                      {contact.address_type === "home" ? "Nhà riêng" : "Văn phòng"}
                    </span>
                    {contact.is_default_pickup && (
                      <span className="text-label-sm bg-secondary-container text-on-secondary-container px-2 py-1 rounded">
                        Địa chỉ lấy hàng
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="location_off"
              title="Chưa có địa chỉ nào"
              description="Thêm một địa chỉ nhận hàng để đặt đơn nhanh hơn và không phải nhập lại khi thanh toán."
              action={<Button onClick={() => handleOpenForm()}>Thêm địa chỉ</Button>}
            />
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
          <h2 className="text-title-md text-on-surface mb-5">
            {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md text-on-surface mb-1.5">Họ và tên <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface mb-1.5">Số điện thoại <span className="text-error">*</span></label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-1.5">
                  Tỉnh / Thành phố và Phường / Xã <span className="text-error">*</span>
                </label>
                {/*
                  One control for both levels, searchable — the same one the browse filters
                  with. Two selects over 526 wards was a list nobody found a name in, and the
                  names it wrote came from whichever option happened to be picked; the server
                  now resolves them from the codes, so what this sends is advisory.
                */}
                <AreaPicker
                  provinceCode={formData.province_code}
                  wardCode={formData.ward_code}
                  onChange={(area) =>
                    setFormData({
                      ...formData,
                      province_code: area.provinceCode,
                      province_name: area.provinceName,
                      ward_code: area.wardCode,
                      ward_name: area.wardName,
                    })
                  }
                  placeholder="Chọn tỉnh / thành phố"
                  label="Tỉnh, thành phố và phường, xã"
                />
                {!formData.ward_code && (
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    Cần chọn tới phường / xã để lưu địa chỉ.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-1.5">Địa chỉ cụ thể (Số nhà, tên đường) <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-label-md text-on-surface mb-1.5">Loại địa chỉ</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-body-md text-on-surface">
                  <input 
                    type="radio" 
                    name="address_type" 
                    value="home" 
                    checked={formData.address_type === "home"}
                    onChange={() => setFormData({...formData, address_type: "home"})}
                  />
                  Nhà riêng
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-body-md text-on-surface">
                  <input 
                    type="radio" 
                    name="address_type" 
                    value="work" 
                    checked={formData.address_type === "work"}
                    onChange={() => setFormData({...formData, address_type: "work"})}
                  />
                  Văn phòng
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-body-md text-on-surface">
                <input 
                  type="checkbox" 
                  checked={formData.is_default_delivery}
                  onChange={e => setFormData({...formData, is_default_delivery: e.target.checked})}
                />
                Đặt làm địa chỉ nhận hàng mặc định
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-body-md text-on-surface">
                <input 
                  type="checkbox" 
                  checked={formData.is_default_pickup}
                  onChange={e => setFormData({...formData, is_default_pickup: e.target.checked})}
                />
                Đặt làm địa chỉ lấy hàng (dành cho người bán)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu địa chỉ"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
