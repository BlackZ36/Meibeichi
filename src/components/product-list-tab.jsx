import React from "react";
import { useState, useMemo, useEffect } from "react";
import { ExternalLink, ArrowUpDown, Search, Copy, Check, Loader2, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ProductService from "@/services/ProductService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ChatService from "@/services/ChatService";
import ImageHover from "./image-hover";
import data from "../lib/database.json";
import { Button } from "./ui/button";
import convertVietnamese from "@/lib/convert-vietnamese";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState([]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setProducts(data.products);
    setSelectedProduct(data.products[0]);
    setChats(data.chats);
    setFilteredAndSortedProducts(data.products);
    if (products && products.length > 0) {
      setTypes(["all", ...Array.from(new Set(products.map((product) => product?.type || "")))]);
    } else {
      setTypes(["all"]);
    }
  }, [products]);

  useEffect(() => {}, [products]); // Theo dõi sự thay đổi của `products`

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

  // Update filtered and sorted products
  useEffect(() => {
    if (!products) return;
    // First filter by type and search term
    let filtered = [...products];

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((product) => product.type === selectedType);
    }

    if (searchTerm.trim()) {
      const searchSlug = convertVietnamese(searchTerm.toLowerCase());
      filtered = filtered.filter(
        (product) => convertVietnamese(product.name?.toLowerCase()).includes(searchSlug) || convertVietnamese(product.code?.toLowerCase()).includes(searchSlug) || convertVietnamese(product.type?.toLowerCase()).includes(searchSlug)
      );
    }

    // Then sort
    const sorted = filtered.sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0;
    });

    setFilteredAndSortedProducts(sorted);
    if (sorted.length > 0) {
      setSelectedProduct(sorted[0]);
    }
    setCurrentPage(1);
  }, [products, sortColumn, sortDirection, selectedType, searchTerm]);

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

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing rows per page
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
                    types.map((type) => {
                      const typeValue = type.toLowerCase();
                      if (typeValue) {
                        return (
                          <SelectItem key={type} value={typeValue} className="capitalize">
                            {type}
                          </SelectItem>
                        );
                      }
                      return null; // Bỏ qua nếu value là chuỗi rỗng
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Tìm kiếm sản phẩm..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Hiển thị:</span>
                <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={rowsPerPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Sản phẩm</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Trước</span>
                </Button>

                <span className="text-sm">
                  Trang {currentPage} của {totalPages || 1}
                </span>

                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Sau</span>
                </Button>
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
                    <TableHead className="cursor-pointer hover:bg-muted/50 hidden md:table-cell">Giá</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50 hidden md:table-cell">Chất liệu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentProducts.map((product) => (
                      <TableRow key={product.id} className={`cursor-pointer hover:bg-muted/50 ${selectedProduct && selectedProduct.id === product.id ? "bg-primary/10" : ""}`} onClick={() => setSelectedProduct(product)}>
                        <TableCell className="p-2">
                          <div className="relative rounded overflow-hidden border w-24">
                            <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="object-cover h-full w-full" />
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
                <p>
                  {/* {selectedProduct.material} */}
                  {selectedProduct.material.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
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
