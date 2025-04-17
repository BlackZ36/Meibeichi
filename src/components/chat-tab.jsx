import React, { useEffect, useState } from "react";
import { Copy, Edit, Plus, Trash, Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addChat, deleteChat, getAllChats, updateChat } from "@/services/ChatService";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";

export default function ContentManagement() {
  const [chatItems, setChatItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [editingItem, setEditingItem] = useState(null);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  const [newChat, setNewChat] = useState({
    title: "",
    values: [""],
  });

  //fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const chats = await getAllChats();
        setChatItems(chats);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to fetch chat data");
        console.log(error);
      }
    };
    fetchData();
  }, []);

  // Copy to clipboard function
  const handleCopyToClipboard = (text) => {
    // Thay thế tất cả \n bằng ký tự xuống dòng thực sự
    const processedText = text.replace(/\\n/g, "\n").replace(/\n/g, "\n");

    navigator.clipboard.writeText(processedText);
    toast.success("Đã copy chat vào bộ nhớ");
  };
  // Delete chat function
  const handleDeleteChat = async (id) => {
    setIsDeleteLoading(true);
    try {
      // Gọi API xóa chat
      await deleteChat(id);

      // Xóa khỏi local state
      setChatItems(chatItems.filter((item) => item.id !== id));

      toast.success("Đã xóa chat thành công");
    } catch (error) {
      console.error("Lỗi khi xóa chat:", error);
      toast.error("Đã xảy ra lỗi khi xóa chat");
    } finally {
      // Đóng dialog và reset
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setIsDeleteLoading(false);
    }
  };

  // Edit chat function
  const handleEditChat = async () => {
    if (!editingItem) return;

    setIsEditLoading(true);
    try {
      // Gọi API update
      await updateChat(editingItem.id, editingItem);
      // Cập nhật lại UI
      setChatItems(chatItems.map((item) => (item.id === editingItem.id ? editingItem : item)));

      toast.success("Đã cập nhật chat thành công");
      setEditingItem(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật chat:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật chat");
    } finally {
      setIsEditLoading(false);
    }
  };

  // Pin chat function
  const handlePinChat = async (id) => {
    setIsLoading(true);
    try {
      const currentItem = chatItems.find((item) => item.id === id);
      if (!currentItem) throw new Error("Chat không tồn tại");
      const updatedItem = { ...currentItem, pin: !currentItem.pin };
      await updateChat(id, updatedItem);
      setChatItems(chatItems.map((item) => (item.id === id ? updatedItem : item)));

      toast.success(updatedItem.pin ? "Đã ghim chat vào trang sản phẩm" : "Đã bỏ ghim chat");
    } catch (error) {
      console.error("Lỗi khi (bỏ) ghim chat:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái ghim");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new chat function
  const handleAddChat = async () => {
    setIsAddingLoading(true);
    try {
      // Kiểm tra dữ liệu đầu vào
      if (newChat.values.some((v) => !v.trim())) {
        toast.warning("Hãy điền toàn bộ các thông tin");
        return false;
      }

      const newChatItem = {
        pin: false,
        title: newChat.title,
        values: newChat.values.filter((v) => v.trim()),
        createdAt: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0,
        },
      };

      await addChat(newChatItem);

      // Cập nhật local state
      setChatItems([...chatItems, newChatItem]);

      //set state for dialog
      setNewChatDialogOpen(false);

      // Reset form
      setNewChat({
        title: "",
        values: [""],
      });

      toast.success("Đã thêm chat thành công");
      return true;
    } catch (error) {
      console.error("Lỗi khi thêm chat:", error);
      toast.error("Đã xảy ra lỗi khi thêm chat");
      return false;
    } finally {
      setIsAddingLoading(false);
    }
  };

  // Sort items to show pinned first
  const sortedChatItems = [...chatItems].sort((a, b) => {
    if (a.pin && !b.pin) return -1;
    if (!a.pin && b.pin) return 1;
    return 0;
  });

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 top-0 left-0 w-full h-full z-90 bg-muted-foreground/20 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Danh Sách Chat</h1>
          <Button onClick={() => setNewChatDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Thêm Chat
          </Button>
        </div>

        {/* Chat items list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedChatItems.map((item) => (
            <Card key={item.id} className={item.pin ? "border-2 border-primary" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 py-2 px-4">
                <CardTitle className="text-base font-medium mr-2">{item.title}</CardTitle>
                <div className="flex space-x-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      handlePinChat(item.id);
                    }}
                  >
                    {item.pin ? <Pin className="h-3.5 w-3.5 text-primary" /> : <PinOff className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => setEditingItem(item)}>
                    <Edit className="h-3.5 w-3.5 text-green-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setItemToDelete(item.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <ul className="space-y-1.5">
                  {item.values.map((value, index) => (
                    <li key={index} className="flex items-center justify-between p-1.5 bg-muted/50 rounded-md">
                      <span className="text-sm mr-2 break-words flex-1">
                        {value.split("\n").map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleCopyToClipboard(value)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground py-2 px-4">{new Date(item.createdAt.seconds * 1000).toLocaleDateString("vi-VN")}</CardFooter>
            </Card>
          ))}
        </div>

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa chat</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn xóa đoạn chat này không?.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={() => itemToDelete && handleDeleteChat(itemToDelete)} disabled={isDeleteLoading}>
                {isDeleteLoading ? (
                  <>
                    <Spinner className="text-primary-foreground" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit dialog */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Chat Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editingItem.title}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Dòng</label>
                  {editingItem.values.map((value, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <Textarea
                        value={value}
                        onChange={(e) => {
                          const updatedValues = [...editingItem.values];
                          updatedValues[index] = e.target.value;
                          setEditingItem({
                            ...editingItem,
                            values: updatedValues,
                          });
                        }}
                        rows={3}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          if (editingItem.values.length > 1) {
                            const updatedValues = editingItem.values.filter((_, i) => i !== index);
                            setEditingItem({
                              ...editingItem,
                              values: updatedValues,
                            });
                          }
                        }}
                        disabled={editingItem.values.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      setEditingItem({
                        ...editingItem,
                        values: [...editingItem.values, ""],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2 text-green-500" /> Thêm dòng
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Hủy
                </Button>
                <Button onClick={handleEditChat} disabled={isEditLoading}>
                  {isEditLoading ? (
                    <>
                      <Spinner className="text-primary-foreground" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add new chat dialog */}
        <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Đoạn Chat Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên</label>
                <Input value={newChat.title} onChange={(e) => setNewChat({ ...newChat, title: e.target.value })} placeholder="nhập tên đoạn chat" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dòng</label>
                {newChat.values.map((value, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <Textarea
                      value={value}
                      onChange={(e) => {
                        const updatedValues = [...newChat.values];
                        updatedValues[index] = e.target.value;
                        setNewChat({ ...newChat, values: updatedValues });
                      }}
                      placeholder={`nhập chat ${index + 1}`}
                    />
                    {index === newChat.values.length - 1 ? (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setNewChat({
                            ...newChat,
                            values: [...newChat.values, ""],
                          })
                        }
                      >
                        <Plus className="h-4 w-4 text-green-500" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const updatedValues = newChat.values.filter((_, i) => i !== index);
                          setNewChat({ ...newChat, values: updatedValues });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewChatDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => handleAddChat()} disabled={isAddingLoading}>
                {isAddingLoading ? (
                  <>
                    <Spinner className="text-primary-foreground" />
                    Đang thêm...
                  </>
                ) : (
                  "Thêm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
