import React from "react";
import "./index.scss";

interface SystemCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const SystemCard: React.FC<SystemCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <div className='system-card' onClick={onClick}>
      <div className='system-card__icon'>{icon}</div>
      <div className='system-card__content'>
        <h3 className='system-card__title'>{title}</h3>
        <p className='system-card__desc'>{description}</p>
      </div>
    </div>
  );
};

export default SystemCard;
