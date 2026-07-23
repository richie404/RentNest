import React from "react";
import { cn } from "@/lib/utils";

export const Heading: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 }
> = ({ level = 1, className, children, ...props }) => {
  const Component = `h${level}` as React.ElementType;
  const levelStyles = {
    1: "text-4xl font-extrabold tracking-tight lg:text-5xl font-heading",
    2: "text-3xl font-bold tracking-tight lg:text-4xl font-heading",
    3: "text-2xl font-bold tracking-tight font-heading",
    4: "text-xl font-semibold tracking-tight font-heading",
    5: "text-lg font-semibold tracking-tight font-heading",
  };

  return (
    <Component className={cn(levelStyles[level], "text-foreground", className)} {...props}>
      {children}
    </Component>
  );
};

export const Text: React.FC<
  React.HTMLAttributes<HTMLParagraphElement> & { size?: "sm" | "md" | "lg"; muted?: boolean }
> = ({ size = "md", muted = false, className, children, ...props }) => {
  const sizeStyles = {
    sm: "text-xs leading-normal",
    md: "text-sm leading-relaxed",
    lg: "text-base leading-relaxed",
  };

  return (
    <p
      className={cn(
        sizeStyles[size],
        muted ? "text-muted-foreground" : "text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export const Code: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className,
  children,
  ...props
}) => (
  <code
    className={cn(
      "rounded-lg bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-primary",
      className
    )}
    {...props}
  >
    {children}
  </code>
);
