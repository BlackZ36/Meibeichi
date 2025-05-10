import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import ProductPage from "@/components/product-list-tab";
import AddProductTab from "@/components/add-product-tab";
import ChatTab from "@/components/chat-tab";
import { Navbar } from "@/components/navbar";
import { getAllProducts } from "@/services/ProductService";
import { getAllChats } from "@/services/ChatService";
import { getAllCategories } from "@/services/CategoryService";

export default function Dashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || "general");

  // Centralized data state
  const [products, setProducts] = useState([]);
  const [chats, setChats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Centralized fetch function
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [productsRes, chatsRes, categoriesRes] = await Promise.all([
        getAllProducts(),
        getAllChats(),
        getAllCategories(),
      ]);
      setProducts(productsRes);
      setChats(chatsRes);
      setCategories(categoriesRes);
    } catch {
      // handle error (optional: toast)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
            <TabsTrigger value="add" className="w-full text-center rounded-3xl">
              Thêm Item
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <ProductPage
              products={products}
              categories={categories}
              chats={chats}
              loading={loading}
              refresh={fetchAllData}
            />
          </TabsContent>

          <TabsContent value="add">
            <AddProductTab />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTab
              chats={chats}
              loading={loading}
              refresh={fetchAllData}
            />
          </TabsContent>

          <TabsContent value="settings"></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
