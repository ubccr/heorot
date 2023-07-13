import React from "react";

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  addClasses?: string;
}

const Button = ({ children, addClasses, ...props }: IProps) => {
  return (
    <button
      type="button"
      className={
        "rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-700 " +
        (addClasses ?? "")
      }
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
