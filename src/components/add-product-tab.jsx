import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { PlusCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductService from "@/services/ProductService";
import { UploadImageToStorage } from "@/services/uploadImage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

export default function AddProductTab() {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    price: "",
    material: "",
    images: [],
    links: [""],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value });
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index] = value;
    setFormData({ ...formData, links: updatedLinks });
  };

  const addLinkField = () => {
    setFormData({ ...formData, links: [...formData.links, ""] });
  };

  const removeLink = (index) => {
    const updatedLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: updatedLinks });
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

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      // Tạo form data từ các trường trong form
      const formDataForJson = {
        ...formData,
        images: [],
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

      console.log("Dữ liệu sản phẩm sau khi thêm ảnh:", JSON.stringify(formDataForJson, null, 2));

      // Thêm sản phẩm vào json-server
      await ProductService.add(formDataForJson);
      toast.success("Sản phẩm đã được thêm thành công!");
      setIsAdding(false);
      navigate("/dashboard/general");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm sản phẩm.");
      console.error("Lỗi khi thêm sản phẩm:", error);
    }
  };

  if (isAdding) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Upload sản phẩm</h1>
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="Nhập code" />
            </div>
            <div>
              <Label htmlFor="name">Tên</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên sản phẩm" required />
            </div>

            <div>
              <Label htmlFor="type">Loại</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bạc">Bạc</SelectItem>
                  <SelectItem value="bạc vàng">Bạc Vàng</SelectItem>
                  <SelectItem value="nhẫn bạc">Nhẫn Bạc</SelectItem>
                  <SelectItem value="vòng khối">Vòng Khối</SelectItem>
                  <SelectItem value="vòng bi">Vòng Bi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Giá</Label>
              <Textarea id="price" name="price" value={formData.price} onChange={handleInputChange} placeholder="Nhập giá" required rows={7} />
            </div>

            <div>
              <Label htmlFor="material">Chất Liệu</Label>
              <Textarea id="material" name="material" value={formData.material} onChange={handleInputChange} placeholder="Nhập chất liệu" rows={3} />
            </div>

            <div>
              <Label htmlFor="images">Ảnh</Label>
              <div className="mt-2">
                <Input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1" />
                  Chọn ảnh
                </Button>
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="w-36 h-full">
                      <Button type="button" variant="outline" size="icon" onClick={() => removeImage(index)} className="text-red-500 w-full mb-2">
                        <X className="w-3 h-3" />
                      </Button>
                      <img src={preview || "/placeholder.svg"} alt={`Preview ${index}`} className="w-full object-cover rounded-md border" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Links</Label>
              {formData.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 mt-2">
                  <Input value={link} onChange={(e) => handleLinkChange(index, e.target.value)} placeholder="Nhập link" />
                  {formData.links.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeLink(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLinkField} className="mt-2">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit Product
          </Button>
        </form>
      </div>
    </div>
  );
}
