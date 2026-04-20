import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Ticket, Award } from 'lucide-react';

interface ProfileInfoProps {
  name: string;
  email: string;
  roleID: number | string;
  ordersCount: number;
  bio?: string;
}

const ROLE_MAP: Record<string, string> = {
  '1': 'Quản trị',
  '2': 'Nhân viên',
  '3': 'Thành viên',
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
};

const ProfileInfo: React.FC<ProfileInfoProps> = ({ name, email, roleID, ordersCount, bio }) => {
  const isDesktop = useIsDesktop();
  const roleLabel = ROLE_MAP[String(roleID)] ?? 'Thành viên';

  const slideInitial = isDesktop ? { opacity: 0, x: 30, y: 0 } : { opacity: 0, x: 0, y: 20 };

  const stats = [
    { label: 'ĐƠN HÀNG', value: ordersCount, icon: <ShoppingBag size={14} /> },
    { label: 'VOUCHER', value: '—', icon: <Ticket size={14} /> },
    { label: 'ĐIỂM', value: '—', icon: <Award size={14} /> },
  ];

  return (
    <motion.div
      initial={slideInitial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3"
    >
      {/* Role badge */}
      <span
        style={{
          background: 'linear-gradient(135deg, #e5c18b, #c5a370)',
          color: '#0e0e0e',
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700,
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '999px',
          alignSelf: 'center',
        }}
        className="lg:self-start"
      >
        {roleLabel.toUpperCase()}
      </span>

      {/* Name */}
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          color: '#e5e2e1',
          fontWeight: 800,
          fontSize: 'clamp(1.3rem, 5vw, 2rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {name || 'Guest User'}
      </h1>

      {/* Email */}
      <p
        style={{
          color: '#d1c5b6',
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
          opacity: 0.8,
        }}
      >
        {email}
      </p>

      {/* Bio */}
      {bio && (
        <p
          style={{
            color: '#d1c5b6',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.82rem',
            opacity: 0.7,
            maxWidth: '36ch',
          }}
          className="mx-auto lg:mx-0"
        >
          {bio}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-center lg:justify-start gap-6 pt-1">
        {stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && <div style={{ width: 1, height: 28, background: '#e5e2e115' }} />}
            <div className="flex flex-col items-center lg:items-start gap-0.5">
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  color: '#e5e2e1',
                  fontWeight: 800,
                  fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  color: '#d1c5b6',
                  fontSize: '0.62rem',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  opacity: 0.65,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ color: '#e5c18b70' }}>{stat.icon}</span>
                {stat.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileInfo;
