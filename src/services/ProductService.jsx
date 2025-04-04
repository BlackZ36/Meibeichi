import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";

const productCollection = collection(db, "products");

// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(productCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting products: ", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error getting product: ", error);
    throw error;
  }
};

// Thêm sản phẩm mới
export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(productCollection, productData);
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product: ", error);
    throw error;
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id, updatedData) => {
  try {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw error;
  }
};

// Lọc sản phẩm theo loại (ví dụ: "bạc")
export const getProductsByType = async (type) => {
  try {
    const q = query(productCollection, where("type", "==", type));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error filtering products: ", error);
    throw error;
  }
};

