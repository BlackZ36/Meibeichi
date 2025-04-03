import React from "react";
import { useState, useMemo, useEffect } from "react";
import { ExternalLink, ArrowUpDown, Search, Copy, Check, Loader2, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ProductService from "@/services/ProductService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ChatService from "@/services/ChatService";
import ImageHover from "./image-hover";
import data from "../lib/database.json";

export default function ProductPage() {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [products, setProducts] = useState();
  const [chats, setChats] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [copiedField, setCopiedField] = useState(null);
  const [copyingImage, setCopyingImage] = useState(null);

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const res = await ProductService.getAll();
    //     const resChat = await ChatService.getAll();
    //     if (res && res.data) {
    //       setProducts(res.data);
    //       setChats(resChat.data);
    //       setSelectedProduct(res.data[0]); // Chọn sản phẩm đầu tiên làm mặc định
    //     } else {
    //       console.log("Không có dữ liệu hoặc dữ liệu không hợp lệ", res);
    //     }
    //   } catch (error) {
    //     console.log("Lỗi khi gọi API:", error);
    //   }
    // };

    //fetchData();
    setProducts(data.products);
    setSelectedProduct(data.products[0]);
    setChats(data.chats);
  }, []);

  useEffect(() => {
    if (products && products.length > 0) {
      setTypes(["all", ...Array.from(new Set(products.map((product) => product?.type || "")))]);
    } else {
      setTypes(["all"]);
    }
  }, [products]); // Theo dõi sự thay đổi của `products`

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return null;
    // First filter by type and search term
    const filtered = products.filter((product) => {
      // Filter by type (if not "all")
      if (selectedType !== "all" && product.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Then filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return product.code.toLowerCase().includes(searchLower) || product.type.toLowerCase().includes(searchLower) || product.price.toLowerCase().includes(searchLower) || product.material.toLowerCase().includes(searchLower);
      }

      return true;
    });

    // Then sort by selected column
    return [...filtered].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle numeric values
      if (sortColumn === "id") {
        aValue = a.id;
        bValue = b.id;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, selectedType, sortColumn, sortDirection]);

  // Update selected product when filtered products change
  // This ensures we always have a valid selected product
  //   useMemo(() => {
  //     if (!products) return null;
  //     if (filteredAndSortedProducts.length > 0 && !filteredAndSortedProducts.some((p) => p.id === selectedProduct.id)) {
  //       setSelectedProduct(filteredAndSortedProducts[0]);
  //     }
  //   }, [filteredAndSortedProducts, selectedProduct.id]);

  //copy image
  const copyImageToClipboard = async (imageUrl, index) => {
    try {
      setCopyingImage(index);

      // Tạo ảnh từ URL
      const img = new Image();
      img.crossOrigin = "anonymous"; // Tránh lỗi CORS
      img.src = imageUrl;

      img.onload = async () => {
        // Tạo canvas và vẽ ảnh lên đó
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Chuyển đổi canvas thành blob
        canvas.toBlob(async (blob) => {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);

          setCopiedField(`Image ${index + 1}`);
          toast.success(`Image ${index + 1} copied to clipboard`);

          setTimeout(() => {
            setCopiedField(null);
          }, 2000);
        }, "image/png");
      };

      img.onerror = () => {
        throw new Error("Failed to load image");
      };
    } catch (err) {
      console.error("Failed to copy image: ", err);
      toast.error("Failed to copy image to clipboard");
    } finally {
      setCopyingImage(null);
    }
  };

  //copy field
  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        toast.success(`${fieldName} copied to clipboard`);

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedField(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  if (!products || products.length === 0) {
    return <p>Loading...</p>; // Hiển thị loading khi chưa có dữ liệu
  }

  return (
    <div className=" py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4 col-span-2">
          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="w-full sm:w-1/3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2 capitalize">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Chọn loại" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {types &&
                    types.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Tìm kiếm sản phẩm..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {/* Product table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Ảnh</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("code")}>
                    Mã
                    {sortColumn === "code" && <ArrowUpDown className={`ml-1 h-4 w-4 inline ${sortDirection === "desc" ? "rotate-180" : ""}`} />}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                    Tên
                    {sortColumn === "name" && <ArrowUpDown className={`ml-1 h-4 w-4 inline ${sortDirection === "desc" ? "rotate-180" : ""}`} />}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("type")}>
                    Loại
                    {sortColumn === "type" && <ArrowUpDown className={`ml-1 h-4 w-4 inline ${sortDirection === "desc" ? "rotate-180" : ""}`} />}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 hidden md:table-cell">
                    Giá
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 hidden md:table-cell">
                    Chất liệu
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedProducts.map((product) => (
                    <TableRow key={product.id} className={`cursor-pointer hover:bg-muted/50 ${selectedProduct && selectedProduct.id === product.id ? "bg-primary/10" : ""}`} onClick={() => setSelectedProduct(product)}>
                      <TableCell className="p-2">
                        <div className="relative rounded overflow-hidden border">
                          <img src={product.images[0] || "/placeholder.svg"} className="object-cover" />
                        </div>
                      </TableCell>
                      <TableCell>{product.code || "-"}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="capitalize">{product.type}</TableCell>
                      <TableCell className="hidden md:table-cell whitespace-nowrap truncate max-w-[200px]">{product.price}</TableCell>
                      <TableCell className="hidden md:table-cell whitespace-nowrap truncate max-w-[200px]">{product.material}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          {/* Detail Column */}
          <Card>
            <CardContent className="space-y-6 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Giá</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(selectedProduct.price, "Price");
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label="Copy price to clipboard"
                  >
                    {copiedField === "Price" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                <p>
                  {selectedProduct.price.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Chất Liệu</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(selectedProduct.material, "Material");
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label="Copy material to clipboard"
                  >
                    {copiedField === "Material" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                <p>{selectedProduct.material}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Ảnh</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-center items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyImageToClipboard(image, index);
                      }}
                    >
                      <ImageHover imgUrl={image} width={200} height={150} isHoverable={true} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Links</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.links.map((link, index) => (
                    <div key={index} className="relative group">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 border rounded-md hover:bg-muted transition-colors">
                        <ExternalLink className="h-5 w-5 mb-1 text-primary" />
                        <span className="text-xs">
                          Link {selectedProduct.name} {index + 1}
                        </span>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(link, `Link ${index + 1}`);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-muted/80 hover:bg-muted transition-opacity opacity-0 group-hover:opacity-100"
                        aria-label={`Copy link ${index + 1} to clipboard`}
                      >
                        {copiedField === `Link ${index + 1}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Column */}
          <Card className="mt-4">
            <CardContent className="space-y-6 p-4">
              {chats &&
                chats
                  .filter((chat) => chat.id <= 2)
                  .map((chat) => (
                    <div className="space-y-2" key={chat.id}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{chat.title}</h3>
                      </div>
                      <ul className="list-disc pl-5">
                        {chat.contents.map((content, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(content, `content ${index + 1} ${chat.title}`);
                              }}
                              className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              aria-label="Copy price to clipboard"
                            >
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <span className="text-sm">{content}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
