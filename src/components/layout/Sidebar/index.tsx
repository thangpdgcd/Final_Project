import React from "react";

type SidebarProps = {
  children?: React.ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return <aside className='system-sidebar'>{children}</aside>;
};

export default Sidebar;

