import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getProductById, updateProduct } from "@/services/ProductService";
import { UploadImageToStorage } from "@/services/uploadImage";
import { Spinner } from "./ui/spinner";
import { getAllCategories } from "@/services/CategoryService";

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const pasteFieldRef = useRef(null);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // In a real application, you would fetch from your API
        const product = await getProductById(id);
        const typeResponse = await getAllCategories();

        //updated link
        const links = product.links.map((linkObj) => Object.entries(linkObj).map(([key, value]) => ({ key, value }))).flat();

        setProduct({ ...product, links: links });
        setTypes(typeResponse);
        console.log(types);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    if (!product) return;
    setProduct({ ...product, [field]: value });
  };

  const handleAddLink = () => {
    if (!product) return;
    const newLinks = [...product.links, { key: "", value: "" }];
    setProduct({ ...product, links: newLinks });
  };

  const handleRemoveLink = (index) => {
    if (!product) return;
    const updatedLinks = product.links.filter((_, i) => i !== index);
    setProduct({ ...product, links: updatedLinks });
  };

  const handleRemoveImage = (index) => {
    if (!product) return;
    const updatedImages = product.images.filter((_, i) => i !== index);
    setProduct({ ...product, images: updatedImages });
  };

  const handleRemoveNewImage = (index) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);

    // Also remove the preview and revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newImagePreviews[index]);
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
    setNewImagePreviews(updatedPreviews);
  };

  const handleKeyChange = (index, newKey) => {
    const updatedLinks = [...product.links];
    updatedLinks[index].key = newKey;
    setProduct({ ...product, links: updatedLinks });
  };

  const handleValueChange = (index, newValue) => {
    const updatedLinks = [...product.links];
    updatedLinks[index].value = newValue;
    setProduct({ ...product, links: updatedLinks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product) return;

    setIsLoading(true);

    try {
      // In a real application, you would upload the images and update the product
      // This is a mock implementation

      // Mock image upload
      const imageLinks = await Promise.all(
        newImages.map(async (file) => {
          const uploadedImageUrl = await UploadImageToStorage(file);
          return uploadedImageUrl; // Trả về URL của ảnh đã upload
        })
      );

      // Combine existing and new images
      const allImages = [...product.images, ...imageLinks];

      // Prepare the updated product data
      const updatedProduct = {
        ...product,
        images: allImages,
      };

      updatedProduct.links = product.links.map((item) => ({
        [item.key]: item.value,
      }));

      await updateProduct(product.id, updatedProduct);

      toast.success("Cập nhật sản phẩm thành công");

      // In a real application, you might redirect to the product list or detail page
      navigate("/dashboard/general");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Không thể cập nhật sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);

      // Create image previews
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...newPreviews]);
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

  if (!product) {
    return (
      <div className="fixed inset-0 top-0 left-0 w-full h-full z-50 bg-muted-foreground/20 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 top-0 left-0 w-full h-full z-50 bg-muted-foreground/20 flex items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="container py-10">
        <div className="mb-4">
          <Button onClick={() => navigate("/dashboard/general")}>
            <ArrowLeft />
            Trở về
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              {product.code} - {product.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type Field - Select Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="type">Loại</Label>
              <Select value={product.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại hàng" />
                </SelectTrigger>
                <SelectContent>
                  {types &&
                    types.map((type) => (
                      <SelectItem key={type.id} value={type.value}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* Order Field */}
            <div className="grid gap-2">
              <Label htmlFor="code">Ưu tiên</Label>
              <div className="flex gap-3 items-center">
                <Button size="icon" onClick={() => handleInputChange("order", Math.max(0, (parseInt(product.order) || 0) - 1))}>
                  <Minus />
                </Button>
                <Input type="number" className="w-[100px] text-center" id="order" value={product.order} onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 0)} />
                <Button size="icon" onClick={() => handleInputChange("order", (parseInt(product.order) || 0) + 1)}>
                  <Plus />
                </Button>
              </div>
            </div>

            {/* Code Field */}
            <div className="grid gap-2">
              <Label htmlFor="code">Mã</Label>
              <Input id="code" value={product.code} onChange={(e) => handleInputChange("code", e.target.value)} />
            </div>

            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">Tên</Label>
              <Input id="name" value={product.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            {/* Price Field */}
            <div className="grid gap-2">
              <Label htmlFor="price">Báo giá</Label>
              <Textarea id="price" value={product.price} onChange={(e) => handleInputChange("price", e.target.value)} rows={8} />
            </div>

            {/* Material Field */}
            <div className="grid gap-2">
              <Label htmlFor="material">Chất liệu</Label>
              <Textarea id="material" value={product.material} onChange={(e) => handleInputChange("material", e.target.value)} rows={5} />
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label>Links</Label>
                <Button type="button" variant="default" size="sm" onClick={handleAddLink}>
                  <Plus className="w-4 h-4" />
                  Thêm Link
                </Button>
              </div>
              {product.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 mt-2">
                  <div className="w-1/4">
                    <Input value={link.key} onChange={(e) => handleKeyChange(index, e.target.value)} placeholder="tên" />
                  </div>
                  <div className="w-3/4 flex items-center gap-2">
                    <Input value={link.value} onChange={(e) => handleValueChange(index, e.target.value)} placeholder="Nhập link" />
                    {product.links.map > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveLink(index)}>
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

                  {(product.images.length > 0 || newImagePreviews.length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
                      {[...product.images, ...newImagePreviews].map((preview, index) => {
                        const isOldImage = index < product.images.length;

                        return (
                          <div key={index} className="relative group">
                            <div className="aspect-square relative overflow-hidden rounded-md border">
                              <img src={preview || "/placeholder.svg"} alt={`Product image ${index + 1}`} className="object-cover w-full h-full" />
                            </div>

                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => (isOldImage ? handleRemoveImage(index) : handleRemoveNewImage(index - product.images.length))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full mt-5" onClick={handleSubmit}>
              {isLoading ? "Đang Lưu..." : "Lưu"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
