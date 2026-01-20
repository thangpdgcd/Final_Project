import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiProfile, UserProfile } from "../../../api/profileApi";
import { Card, Descriptions, Spin, Alert } from "antd";
import "./index.scss";
const Profile: React.FC = () => {
  const { userid } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userid) {
      setError("Không có ID người dùng trong URL");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await apiProfile(userid);
        setUser(userData);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Lỗi khi tải thông tin người dùng",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userid]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size='large' tip='Đang tải thông tin người dùng...' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message='Lỗi'
        description={error}
        type='error'
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <Card
        title='Thông tin người dùng'
        bordered
        style={{
          width: 600,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}>
        {/* Avatar user */}

        {/* Thông tin user */}
        {user ? (
          <Descriptions bordered column={1} size='middle'>
            <Descriptions.Item label='ID'>{user.user_ID}</Descriptions.Item>
            <Descriptions.Item label='Tên'>{user.name}</Descriptions.Item>
            <Descriptions.Item label='Email'>{user.email}</Descriptions.Item>
            <Descriptions.Item label='Địa chỉ'>
              {user.address}
            </Descriptions.Item>
            <Descriptions.Item label='Số điện thoại'>
              {user.phoneNumber}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Không tìm thấy thông tin người dùng</p>
        )}
      </Card>
    </div>
  );
};

export default Profile;
