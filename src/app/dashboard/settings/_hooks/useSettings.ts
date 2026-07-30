import { useState } from "react";

export type SettingsTab = "profile" | "shipping" | "payments" | "security";

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [shopName, setShopName] = useState("Cửa hàng Minh");
  const [shopBio, setShopBio] = useState("Cửa hàng chuyên cung cấp các sản phẩm chất lượng cao, bền vững và tiện ích cho ngôi nhà hiện đại.");
  const [email, setEmail] = useState("hello@minhshop.vn");
  const [warehouseCity, setWarehouseCity] = useState("Hà Nội, VN");

  const [shippingStandard, setShippingStandard] = useState(true);
  const [shippingExpress, setShippingExpress] = useState(false);

  const handleSave = () => {
    console.log("Saving settings...", { shopName, shopBio, email, warehouseCity, shippingStandard, shippingExpress });
  };

  return {
    activeTab,
    setActiveTab,
    shopName, setShopName,
    shopBio, setShopBio,
    email, setEmail,
    warehouseCity, setWarehouseCity,
    shippingStandard, setShippingStandard,
    shippingExpress, setShippingExpress,
    handleSave,
  };
}
