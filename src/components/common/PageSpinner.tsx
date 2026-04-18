import React from 'react';
import { Spin } from 'antd';

type Props = {
  label?: string;
  className?: string;
};

const PageSpinner: React.FC<Props> = ({ label = 'Loading...', className = '' }) => (
  <div className={['grid min-h-[60vh] place-items-center', className].filter(Boolean).join(' ')}>
    <Spin size="large" tip={label}>
      <div className="min-h-6 min-w-6" />
    </Spin>
  </div>
);

export default PageSpinner;

