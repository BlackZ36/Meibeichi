import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import ProductPage from "@/components/product-list-tab";
import AddProductTab from "@/components/add-product-tab";
import ImageHover from "@/components/image-hover";
import ChatTab from "@/components/chat-tab";

export default function Dashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || "general");

  useEffect(() => {
    //check tab
    if (!tab) {
      handleTabChange(activeTab);
    }
  }, [tab]);

  useEffect(() => {
    // Cập nhật tab khi URL thay đổi
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (tabValue) => {
    navigate(`/dashboard/${tabValue}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 m-3 p-4">
        <p className="text-center text-3xl mb-2">Meibeichi Store</p>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="add" disabled={localStorage.getItem("user") !== "admin"}>
              Thêm Item
            </TabsTrigger>
            <TabsTrigger value="addchat" disabled={localStorage.getItem("user") !== "admin"}>
              Thêm Chat
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={localStorage.getItem("user") !== "admin"}>
              Cài Đặt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <ProductPage />
          </TabsContent>

          <TabsContent value="add">
            <AddProductTab />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>

          <TabsContent value="settings"></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
