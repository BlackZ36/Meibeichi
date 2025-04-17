import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const categoryCollection = collection(db, "chats");

// Lấy tất cả sản phẩm
export const getAllChats = async () => {
  try {
    const snapshot = await getDocs(categoryCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting categories: ", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getChatById = async (id) => {
  try {
    const docRef = doc(db, "chats", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("chat not found");
    }
  } catch (error) {
    console.error("Error getting chat: ", error);
    throw error;
  }
};

// Thêm sản phẩm mới
export const addChat = async (chatData) => {
  try {
    const docRef = await addDoc(categoryCollection, chatData);
    return { id: docRef.id, ...chatData };
  } catch (error) {
    console.error("Error adding chat: ", error);
    throw error;
  }
};

// Cập nhật sản phẩm
export const updateChat = async (id, updatedData) => {
  try {
    const docRef = doc(db, "chats", id);
    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating chat: ", error);
    throw error;
  }
};

// Xóa sản phẩm
export const deleteChat = async (id) => {
  try {
    const docRef = doc(db, "chats", id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting chat: ", error);
    throw error;
  }
};
