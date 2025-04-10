import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";

const categoryCollection = collection(db, "categories");

// Lấy tất cả sản phẩm
export const getAllCategories = async () => {
  try {
    const snapshot = await getDocs(categoryCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting categories: ", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getCategoryById = async (id) => {
  try {
    const docRef = doc(db, "categories", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("category not found");
    }
  } catch (error) {
    console.error("Error getting product: ", error);
    throw error;
  }
};

// Thêm sản phẩm mới
export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(categoryCollection, categoryData);
    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error("Error adding category: ", error);
    throw error;
  }
};

// Cập nhật sản phẩm
export const updateCategory = async (id, updatedData) => {
  try {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating category: ", error);
    throw error;
  }
};

// Xóa sản phẩm
export const deleteCategory = async (id) => {
  try {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting categories: ", error);
    throw error;
  }
};
