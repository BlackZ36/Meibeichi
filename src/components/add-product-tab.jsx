import { useState, useRef, useEffect } from "react";
import { Clipboard, PlusCircle, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadImageToStorage } from "@/services/uploadImage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { addProduct } from "@/services/ProductService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Combobox } from "./custom-combo-box";
import { getAllCategories } from "@/services/CategoryService";

export default function AddProductTab() {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    price: "",
    material: "",
    images: [],
    links: [{ key: "", value: "" }],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const pasteFieldRef = useRef(null);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllCategories()
        console.log('categories', response);
        
        setTypes(response);
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value });
  };

  const handleKeyChange = (index, newKey) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index].key = newKey;
    setFormData({ ...formData, links: updatedLinks });
  };

  const handleValueChange = (index, newValue) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index].value = newValue;
    setFormData({ ...formData, links: updatedLinks });
  };

  const removeLink = (index) => {
    const updatedLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: updatedLinks });
  };

  const addLinkField = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { key: "", value: "" }],
    });
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //check type
    setTypeError(false);
    if (!formData.type) {
      toast.warning("Vui lòng chọn loại hàng!");
      setTypeError(true);
      return;
    }

    setIsAdding(true);
    try {
      // Tạo form data từ các trường trong form
      const formDataForJson = {
        ...formData,
        images: [],
        date: new Date(),
        order: 0,
      };

      // Upload tất cả các ảnh và lấy lại URL từ Cloudinary
      const imageLinks = await Promise.all(
        formData.images.map(async (file) => {
          const uploadedImageUrl = await UploadImageToStorage(file);
          return uploadedImageUrl; // Trả về URL của ảnh đã upload
        })
      );

      // Cập nhật links của sản phẩm với URL ảnh từ Cloudinary
      formDataForJson.images = imageLinks.filter((url) => url !== null);

      formDataForJson.links = formData.links
        .filter((item) => item.key.trim() !== "" && item.value.trim() !== "")
        .map((item) => ({
          [item.key]: item.value,
        }));

      console.log("Dữ liệu sản phẩm sau khi thêm ảnh:", JSON.stringify(formDataForJson, null, 2));

      await addProduct(formDataForJson);
      toast.success("Sản phẩm đã được thêm thành công!");
      setIsAdding(false);
      navigate("/dashboard/general");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm sản phẩm.");
      console.error("Lỗi khi thêm sản phẩm:", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData({ ...formData, images: [...formData.images, ...filesArray] });

      // Create image previews
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target.result) {
            setImagePreviews((prev) => [...prev, event.target.result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      // Create a synthetic event object with the files
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files,
        },
      };
      handleImageChange(syntheticEvent);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const dataTransfer = new DataTransfer();

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          dataTransfer.items.add(file);
        }
      }
    }

    if (dataTransfer.files.length > 0) {
      const syntheticEvent = {
        target: {
          files: dataTransfer.files, // Đây là FileList hợp lệ
        },
      };
      handleImageChange(syntheticEvent);
    }
  };

  // Add paste event listener to the paste field
  useEffect(() => {
    const pasteField = pasteFieldRef.current;

    if (pasteField) {
      //pasteField.addEventListener("paste", handlePaste);

      // Also add global paste event
      window.addEventListener("paste", handlePaste);
    }

    window.addEventListener("paste", handlePaste);

    return () => {
      if (pasteField) {
        pasteField.removeEventListener("paste", handlePaste);
      }
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <>
      {isAdding && (
        <div className="fixed inset-0 top-0 left-0 w-full h-full z-50 bg-muted-foreground/20 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className="container mx-auto py-8 px-4">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="Nhập code" className="rounded-3xl" />
              </div>
              <div>
                <Label htmlFor="name">Tên</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên sản phẩm" required className="rounded-3xl" />
              </div>

              <div>
                <Label htmlFor="type" className={`${typeError && "text-red-500"}`}>
                  Loại
                </Label>
                <Combobox options={types} value={formData.type} onValueChange={handleTypeChange} placeholder="Chọn loại hàng" className="rounded-3xl" error={typeError} allowCustomValue={true} />
                {/* <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className={`${typeError && "border border-red-500"} rounded-3xl`}>
                    <SelectValue placeholder="Chọn loại hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bạc">Bạc</SelectItem>
                    <SelectItem value="bạc vàng">Bạc Vàng</SelectItem>
                    <SelectItem value="nhẫn bạc">Nhẫn Bạc</SelectItem>
                    <SelectItem value="khối">Vòng Khối</SelectItem>
                    <SelectItem value="bi">Vòng Bi</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>

              <div>
                <Label htmlFor="price">Giá</Label>
                <Textarea id="price" name="price" value={formData.price} onChange={handleInputChange} placeholder="Nhập giá" required rows={7} />
              </div>

              <div>
                <Label htmlFor="material">Chất Liệu</Label>
                <Textarea id="material" name="material" value={formData.material} onChange={handleInputChange} placeholder="Nhập chất liệu" rows={7} />
              </div>

              <div>
                <div className="flex justify-between items-end gap-4">
                  <Label>Links</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLinkField} className="mt-2 rounded-3xl">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Thêm Link
                  </Button>
                </div>
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 mt-2">
                    <div className="w-1/4">
                      <Input value={link.key} onChange={(e) => handleKeyChange(index, e.target.value)} placeholder="tên" className="rounded-3xl" />
                    </div>
                    <div className="w-3/4 flex items-center gap-2">
                      <Input value={link.value} onChange={(e) => handleValueChange(index, e.target.value)} placeholder="Nhập link" className="rounded-3xl" />
                      {formData.links.length > 1 && (
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeLink(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Card className="w-full pt-3">
                <CardContent>
                  <div>
                    <div className="my-3">
                      <Input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                    </div>

                    {/* Drag and drop area */}
                    <div
                      ref={dropZoneRef}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        isDragging ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50 hover:bg-muted/5"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Kéo thả ảnh vào đây</p>
                          <p className="text-xs text-muted-foreground mt-1">Hoặc click để chọn ảnh</p>
                        </div>
                      </div>
                    </div>

                    {/* Image previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square relative overflow-hidden rounded-md border">
                              <img src={preview || "/placeholder.svg"} alt={`Product image ${index + 1}`} className="object-cover w-full h-full" />
                            </div>

                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button type="submit" className="w-full bg-primary rounded-3xl">
              Thêm
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
