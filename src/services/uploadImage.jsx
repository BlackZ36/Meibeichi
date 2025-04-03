export const UploadImageToStorage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
  formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_NAME);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    return null;
  }
};
