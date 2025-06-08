"use client";

import * as NextThemes from "next-themes";
import { Toaster as SonnerLib } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerLib>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = NextThemes.useTheme();

  return (
    <SonnerLib
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
