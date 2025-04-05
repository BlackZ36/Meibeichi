import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import ProductPage from "@/components/product-list-tab";
import AddProductTab from "@/components/add-product-tab";
import ChatTab from "@/components/chat-tab";
import { Navbar } from "@/components/navbar";

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
      <Navbar />
      <main className="flex-1 m-1 p-1 md:p-4 md:m-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 rounded-3xl gap-4 w-full h-auto">
            <TabsTrigger value="general" className="w-full text-center rounded-3xl">
              Chung
            </TabsTrigger>
            <TabsTrigger value="chat" className="w-full text-center rounded-3xl">
              Chat
            </TabsTrigger>
            {/* <TabsTrigger value="settings" disabled={localStorage.getItem("user") !== "admin"} className="w-full text-center">
              Cài Đặt
            </TabsTrigger> */}
            <TabsTrigger value="add" className="w-full text-center rounded-3xl">
              Thêm Item
            </TabsTrigger>
            {/* <TabsTrigger value="addchat" className="w-full text-center">
              Thêm Chat
            </TabsTrigger> */}
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
