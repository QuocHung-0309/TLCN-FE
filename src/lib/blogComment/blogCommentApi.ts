import axios from "axios";

const API_URL = "http://localhost:4000/api/comments";

// Lấy tất cả comment theo blogId
export const fetchCommentsByBlog = async (blogId: string) => {
  const res = await axios.get(`${API_URL}/${blogId}`);
  return res.data.data; // BE trả {success, data}
};

// Tạo comment mới
export const createComment = async (blogId: string, content: string, token: string) => {
  const res = await axios.post(
    `${API_URL}/${blogId}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

// Cập nhật comment
export const updateComment = async (id: string, content: string, token: string) => {
  const res = await axios.patch(
    `${API_URL}/${id}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

// Xóa comment
export const deleteComment = async (id: string, token: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

// Like / Unlike comment
export const likeComment = async (id: string, token: string) => {
  const res = await axios.patch(
    `${API_URL}/like/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};
