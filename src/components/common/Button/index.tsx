import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <button type={rest.type ?? "button"} {...rest}>
      {children}
    </button>
  );
};

export default Button;

