"use client";

import { useState, useEffect } from "react";
import { ContactService, Contact, CreateContactRequest } from "@/services/contact.service";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface Location {
  name: string;
  code: number;
}
interface Ward extends Location {}
interface District extends Location {
  wards: Ward[];
}
interface Province extends Location {
  districts: District[];
}

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateContactRequest>({
    full_name: "",
    phone: "",
    country: "VN",
    province_code: "",
    province_name: "",
    district_code: "",
    district_name: "",
    ward_code: "",
    ward_name: "",
    address: "",
    address_type: "home",
    is_default_delivery: false,
    is_default_pickup: false,
  });

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const res = await ContactService.getContacts();
      setContacts(res.data || []);
    } catch (error) {
      // apiClient handles error toast
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Fetch Vietnam provinces
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(() => toast.error("Không thể tải dữ liệu tỉnh thành."));
  }, []);

  const handleOpenForm = (contact?: Contact) => {
    if (contact) {
      setEditingId(contact.id);
      setFormData({
        full_name: contact.full_name,
        phone: contact.phone,
        country: contact.country,
        province_code: contact.province_code,
        province_name: contact.province_name,
        district_code: contact.district_code || "",
        district_name: contact.district_name || "",
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
        district_code: "",
        district_name: "",
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

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await ContactService.deleteContact(id);
      toast.success("Đã xóa địa chỉ.");
      fetchContacts();
    } catch (error) {
      // Handled by API client
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up payload
      let formattedPhone = formData.phone;
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+84" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }

      const payload = {
        ...formData,
        phone: formattedPhone,
      };

      if (!payload.district_code) {
        delete payload.district_code;
        delete payload.district_name;
      }
      if (!payload.address_detail) {
        delete payload.address_detail;
      }

      if (editingId) {
        await ContactService.updateContact(editingId, payload);
        toast.success("Cập nhật địa chỉ thành công.");
      } else {
        await ContactService.createContact(payload);
        toast.success("Thêm địa chỉ thành công.");
      }
      setIsFormOpen(false);
      fetchContacts();
    } catch (error) {
      // Handled by API client
    }
  };

  const selectedProvince = provinces.find(p => p.code.toString() === formData.province_code);
  const selectedDistrict = selectedProvince?.districts?.find(d => d.code.toString() === formData.district_code);

  return (
    <div className="space-y-6">
      {!isFormOpen ? (
        <>
          <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-outline-variant shadow-sm">
            <div className="font-label-lg font-semibold text-on-surface">Bạn có {contacts.length} địa chỉ đã lưu</div>
            <Button onClick={() => handleOpenForm()} icon={<span className="material-symbols-outlined">add</span>}>
              Thêm địa chỉ mới
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>
          ) : contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map(contact => (
                <div key={contact.id} className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm relative group hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm font-bold text-on-surface">{contact.full_name}</span>
                      {contact.is_default_delivery && <span className="text-[10px] bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full font-bold">Mặc định</span>}
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
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {contact.phone}
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] mt-0.5">location_on</span>
                      <span>
                        {contact.address_detail ? `${contact.address_detail}, ` : ""}{contact.address}, {contact.ward_name}, {contact.district_name}, {contact.province_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="text-xs bg-surface-container-high text-on-surface px-2 py-1 rounded">
                      {contact.address_type === "home" ? "Nhà riêng" : "Văn phòng"}
                    </span>
                    {contact.is_default_pickup && (
                      <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded">
                        Địa chỉ lấy hàng
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-2xl p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">location_off</span>
              <h3 className="font-headline-sm font-bold text-on-surface mb-2">Chưa có địa chỉ nào</h3>
              <p className="text-body-md text-on-surface-variant mb-6">Bạn chưa lưu địa chỉ nhận hàng nào. Hãy thêm một địa chỉ mới.</p>
              <Button onClick={() => handleOpenForm()}>Thêm địa chỉ</Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h2 className="font-headline-sm font-bold text-on-surface mb-6">
            {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm font-semibold mb-1.5">Họ và tên <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full h-10 px-3 rounded-lg border border-outline focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-label-sm font-semibold mb-1.5">Số điện thoại <span className="text-error">*</span></label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-10 px-3 rounded-lg border border-outline focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-label-sm font-semibold mb-1.5">Tỉnh / Thành phố <span className="text-error">*</span></label>
                <select 
                  value={formData.province_code}
                  onChange={e => {
                    const prov = provinces.find(p => p.code.toString() === e.target.value);
                    setFormData({
                      ...formData, 
                      province_code: e.target.value, 
                      province_name: prov?.name || "",
                      district_code: "",
                      district_name: "",
                      ward_code: "",
                      ward_name: ""
                    });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-outline focus:border-primary outline-none bg-surface"
                  required
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-sm font-semibold mb-1.5">Quận / Huyện <span className="text-error">*</span></label>
                <select 
                  value={formData.district_code || ""}
                  onChange={e => {
                    const dist = selectedProvince?.districts?.find(d => d.code.toString() === e.target.value);
                    setFormData({
                      ...formData, 
                      district_code: e.target.value, 
                      district_name: dist?.name || "",
                      ward_code: "",
                      ward_name: ""
                    });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-outline focus:border-primary outline-none bg-surface"
                  required
                  disabled={!formData.province_code}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {selectedProvince?.districts?.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-sm font-semibold mb-1.5">Phường / Xã <span className="text-error">*</span></label>
                <select 
                  value={formData.ward_code}
                  onChange={e => {
                    const ward = selectedDistrict?.wards?.find(w => w.code.toString() === e.target.value);
                    setFormData({
                      ...formData, 
                      ward_code: e.target.value, 
                      ward_name: ward?.name || ""
                    });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-outline focus:border-primary outline-none bg-surface"
                  required
                  disabled={!formData.district_code}
                >
                  <option value="">Chọn Phường/Xã</option>
                  {selectedDistrict?.wards?.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-sm font-semibold mb-1.5">Địa chỉ cụ thể (Số nhà, tên đường) <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full h-10 px-3 rounded-lg border border-outline focus:border-primary outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-label-sm font-semibold mb-1.5">Loại địa chỉ</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="address_type" 
                    value="home" 
                    checked={formData.address_type === "home"}
                    onChange={() => setFormData({...formData, address_type: "home"})}
                  />
                  Nhà riêng
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_default_delivery}
                  onChange={e => setFormData({...formData, is_default_delivery: e.target.checked})}
                />
                Đặt làm địa chỉ nhận hàng mặc định
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
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
              <Button type="submit">Lưu địa chỉ</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
