import React from 'react';

type Props = {
  children: React.ReactNode;
  /** Extra classes on the outer Highland editorial wrapper */
  className?: string;
  /** Extra classes on the inner z-stacking container */
  innerClassName?: string;
};

/**
 * Shared “Highland editorial” canvas (same system as About / Contact):
 * animated cream surface, CSS variables, typography and button utilities.
 */
const EditorialPageShell: React.FC<Props> = ({ children, className = '', innerClassName = '' }) => (
  <div
    className={`about-page about-page--bg-animate min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)] ${className}`.trim()}
  >
    <div className={`relative z-[1] ${innerClassName}`.trim()}>{children}</div>
  </div>
);

export default EditorialPageShell;
