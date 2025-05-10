import React from "react";
import { useState, useEffect } from "react";
import { ExternalLink, Search, Copy, Check, Filter, ChevronRight, ChevronLeft, Pencil, Trash2, ArrowUpNarrowWide, ArrowDownNarrowWide, Medal, Pin, PinOff, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ImageHover from "./image-hover";
import { Button } from "./ui/button";
import { deleteProduct, updateProduct } from "@/services/ProductService";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Spinner } from "./ui/spinner";
import convertVietnamese from "@/lib/convert-vietnamese";
import PropTypes from "prop-types";

export default function ProductPage({ products = [], categories = [], chats = [], loading = false, refresh }) {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [copiedField, setCopiedField] = useState(null);
  const [copyingImage, setCopyingImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState([]);

  // Set types when categories or products change
  useEffect(() => {
    const allType = { id: "abc", name: "Tất Cả", value: "all" };
    setTypes([allType, ...(Array.isArray(categories) ? categories : [])]);
  }, [categories, products]);

  // Set selected product when products change
  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedProduct(products[0]);
    } else {
      setSelectedProduct(null);
    }
  }, [products]);

  // Update filtered and sorted products
  useEffect(() => {
    if (!products) return;
    let filtered = [...products];
    if (selectedType !== "all") {
      filtered = filtered.filter((product) => product.type === selectedType);
    }
    if (searchTerm.trim()) {
      const searchSlug = convertVietnamese(searchTerm.toLowerCase());
      filtered = filtered.filter(
        (product) =>
          convertVietnamese(product.name?.toLowerCase()).includes(searchSlug) ||
          convertVietnamese(product.code?.toLowerCase()).includes(searchSlug) ||
          convertVietnamese(product.type?.toLowerCase()).includes(searchSlug)
      );
    }
    const sorted = filtered.sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";
      if (sortColumn.includes("date") || sortColumn.includes("Date") || sortColumn.includes("time") || sortColumn.includes("Time")) {
        const dateA = aValue?.seconds ? new Date(aValue.seconds * 1000) : new Date(aValue);
        const dateB = bValue?.seconds ? new Date(bValue.seconds * 1000) : new Date(bValue);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    setFilteredAndSortedProducts(sorted);
    if (sorted.length > 0) {
      setSelectedProduct(sorted[0]);
    }
    setCurrentPage(1);
  }, [products, sortColumn, sortDirection, selectedType, searchTerm]);

  const firestoreToDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return new Date();
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  };

  const formatDateTime = (date) => {
    const d = firestoreToDate(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const copyImageToClipboard = async (imageUrl, index) => {
    try {
      setCopyingImage(index);
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          const item = new window.ClipboardItem({ "image/png": blob });
          await window.navigator.clipboard.write([item]);
          setCopiedField(`Image ${index + 1}`);
          toast.success(`đã copy ảnh ${index + 1}`);
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
    window.navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        toast.success(`đã copy ${fieldName}`);
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
    setCurrentPage(1);
  };

  //handle confirm delete
  const handleConfirmDelete = async (productId) => {
    await deleteProduct(productId);
    toast.success("Xóa sản phầm thành công");
    refresh && refresh();
  };
  //handle open dialog
  const handleOpenDialog = (id) => {
    setIsDeleteOpen(true);
    setDeleteId(id);
  };

  const handlePin = async (id, type) => {
    try {
      const updatedOrder = type === "pin" ? 99 : 0;
      // Tìm product cần update
      const productToUpdate = products.find((p) => p.id === id);
      if (!productToUpdate) return toast.error("Không tìm thấy sản phẩm");
      const productUpdate = {
        ...productToUpdate,
        order: updatedOrder,
      };
      await updateProduct(id, productUpdate);
      toast.success(type === "pin" ? "Đã ghim sản phẩm" : "Đã bỏ ghim sản phẩm");
      refresh && refresh();
    } catch (error) {
      console.error("Lỗi khi cập nhật order:", error);
      toast.error("Không thể cập nhật trạng thái ghim");
    }
  };

  return (
    <div className=" py-8 px-4">
      {loading && (
        <div className="fixed inset-0 top-0 left-0 w-full h-full z-50 bg-muted-foreground/20 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4 col-span-2">
          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="w-full sm:w-1/3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full rounded-3xl">
                  <div className="flex items-center gap-2 capitalize">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Chọn loại" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {types &&
                    types.map((type) => {
                      return (
                        <SelectItem key={type.id} value={type.value} className="capitalize rounded-3xl">
                          {type.name}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full p-0">
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-primary cursor-pointer text-primary-foreground border border-primary-foreground rounded-full p-1 hover:bg-primary/80 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              )}

              <Input type="text" placeholder="Tìm kiếm sản phẩm..." className={`w-full rounded-3xl ${searchTerm ? "pl-10 border border-primary" : "pl-8"} `} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            {/* paging and rows */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Hiển thị:</span>
                <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger className="h-8 w-[70px] rounded-3xl">
                    <SelectValue placeholder={rowsPerPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="rounded-3xl">
                      5
                    </SelectItem>
                    <SelectItem value="10" className="rounded-3xl">
                      10
                    </SelectItem>
                    <SelectItem value="20" className="rounded-3xl">
                      20
                    </SelectItem>
                    <SelectItem value="50" className="rounded-3xl">
                      50
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 rounded-3xl">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Trước</span>
                </Button>

                <span className="text-sm">
                  Trang {currentPage} của {totalPages || 1}
                </span>

                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8 rounded-3xl">
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Sau</span>
                </Button>
              </div>
            </div>
            {/* Product table */}
            <div className="border rounded-md w-full overflow-x-auto">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ảnh</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50 w-24" onClick={() => handleSort("code")}>
                      Mã
                      {sortColumn === "code" ? sortDirection === "desc" ? <ArrowDownNarrowWide className="ml-1 h-4 w-4 inline" /> : <ArrowUpNarrowWide className="ml-1 h-4 w-4 inline" /> : null}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                      Tên
                      {sortColumn === "name" ? sortDirection === "desc" ? <ArrowDownNarrowWide className="ml-1 h-4 w-4 inline" /> : <ArrowUpNarrowWide className="ml-1 h-4 w-4 inline" /> : null}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50 hidden md:table-cell" onClick={() => handleSort("type")}>
                      Loại
                      {sortColumn === "type" ? sortDirection === "desc" ? <ArrowDownNarrowWide className="ml-1 h-4 w-4 inline" /> : <ArrowUpNarrowWide className="ml-1 h-4 w-4 inline" /> : null}
                    </TableHead>
                    {/* <TableHead className="hidden md:table-cell">Báo giá</TableHead>*/}
                    {/* <TableHead className="hidden md:table-cell">Chất liệu</TableHead>  */}
                    <TableHead className="cursor-pointer hover:bg-muted/50 hidden md:table-cell" onClick={() => handleSort("date")}>
                      Ngày Thêm
                      {sortColumn === "date" ? sortDirection === "desc" ? <ArrowDownNarrowWide className="ml-1 h-4 w-4 inline" /> : <ArrowUpNarrowWide className="ml-1 h-4 w-4 inline" /> : null}
                    </TableHead>
                    <TableHead></TableHead>
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
                        <TableCell className="p-2 overflow-hidden">
                          <div className="relative rounded overflow-hidden border w-24">
                            <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="object-cover h-full w-full" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.order === 99 ? (
                            <div className="flex items-center gap-1">
                              <span>{product.code || "-"}</span>
                              <Pin className="w-5 h-5 rotate-45 text-green-600" />
                            </div>
                          ) : (
                            product.code || "-"
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{product.name}</TableCell>
                        <TableCell className="hidden md:table-cell capitalize">{product.type}</TableCell>
                        <TableCell className="hidden md:table-cell capitalize"> {formatDateTime(product.date)} </TableCell>
                        {/* <TableCell className="hidden md:table-cell whitespace-nowrap truncate max-w-[200px]">{product.price.replace(/\\n/g, "")}</TableCell> */}
                        {/* <TableCell className="hidden md:table-cell whitespace-nowrap truncate max-w-[200px]">{product.material.replace(/\\n/g, "")}</TableCell> */}
                        <TableCell>
                          <div className="flex flex-col md:flex-row items-center justify-end gap-1">
                            {product.order === 99 ? (
                              <Button size="icon" className="rounded-3xl text-white bg-red-500 hover:bg-red-700" onClick={() => handlePin(product.id, "unpin")}>
                                <PinOff className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button size="icon" variant="outline" className="rounded-3xl text-blue-500  hover:text-white hover:bg-blue-500" onClick={() => handlePin(product.id, "pin")}>
                                <Pin className="w-4 h-4" />
                              </Button>
                            )}

                            <Link to={`/dashboard/edit/${product.id}`}>
                              <Button size="icon" variant="outline" className="rounded-3xl text-green-500 dark:text-primary hover:text-white hover:bg-green-600">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button size="icon" variant="outline" className="rounded-3xl text-red-500 hover:text-white hover:bg-red-600" onClick={() => handleOpenDialog(product.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          {/* Detail Column */}
          <Card>
            <CardContent className="space-y-6 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Giá</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(selectedProduct.price, "báo giá");
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label="Copy price to clipboard"
                  >
                    {copiedField === "báo giá" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                <p>
                  {selectedProduct?.price &&
                    selectedProduct.price
                      .replace(/\\n/g, "\n")
                      .split("\n")
                      .map((line, index) => (
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
                      copyToClipboard(selectedProduct.material, "chất liệu");
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label="Copy material to clipboard"
                  >
                    {copiedField === "chất liệu" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                <p>
                  {selectedProduct?.material &&
                    selectedProduct.material
                      .replace(/\\n/g, "\n")
                      .split("\n")
                      .map((line, index) => (
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
                  {selectedProduct?.images &&
                    selectedProduct?.images.map((image, index) => (
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
                  {selectedProduct?.links &&
                    selectedProduct.links.map((linkObject, index) => {
                      // Lấy key và value từ đối tượng trong mảng
                      const [key, value] = Object.entries(linkObject)[0]; // Lấy ra cặp key-value đầu tiên trong đối tượng

                      return (
                        <div key={index} className="flex flex-col items-center">
                          <a
                            href={value} // value là URL
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-3 border rounded-md hover:bg-muted transition-colors w-full max-w-full overflow-hidden"
                          >
                            <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{key.replace(/link/gi, "")}</span>
                            <ExternalLink className="w-4 h-4 text-primary ml-2" />
                          </a>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Column */}
          <Card className="mt-4">
            <CardContent className="space-y-6 p-4">
              {chats &&
                chats
                  .filter((chat) => chat.pin === true)
                  .map((chat) => (
                    <div className="space-y-2" key={chat.id}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{chat.title}</h3>
                      </div>
                      <ul className="list-disc pl-5">
                        {chat.values.map((item, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(item, `: ${item}`);
                              }}
                              className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              aria-label="Copy price to clipboard"
                            >
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* delete dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa Sản Phẩm</DialogTitle>
            <DialogDescription>Không thể thôi phục sau khi xóa.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleConfirmDelete(deleteId);
                setIsDeleteOpen(false);
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

ProductPage.propTypes = {
  products: PropTypes.array,
  categories: PropTypes.array,
  chats: PropTypes.array,
  loading: PropTypes.bool,
  refresh: PropTypes.func,
};
