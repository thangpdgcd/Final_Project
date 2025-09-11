import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById, UserProfile } from "../../../api/profileApi";

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Không có ID người dùng trong URL");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getUserById(id); // ✅ không dùng .data nữa
        setUser(userData);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Lỗi khi tải thông tin người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Thông tin người dùng</h1>
      {user ? (
        <div>
          <p>
            <strong>ID:</strong> {user.user_ID}
          </p>
          <p>
            <strong>Tên:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {user.address}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {user.phoneNumber}
          </p>
        </div>
      ) : (
        <p>Không tìm thấy thông tin người dùng</p>
      )}
    </div>
  );
};

export default Profile;
