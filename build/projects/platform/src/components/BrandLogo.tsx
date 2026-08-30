"use client";

import clsx from "clsx";

type BrandLogoProps = {
  size?: number;
  className?: string;
};

/** SVG gradient mark in light mode; solid dark tile in dark mode. */
export default function BrandLogo({ size = 56, className }: BrandLogoProps) {
  const useFavicon = size <= 32;

  return (
    <>
      <img
        src="/logo-mark.svg"
        alt=""
        width={size}
        height={size}
        className={clsx(
          "shrink-0 block dark:hidden",
          useFavicon ? "rounded" : "rounded-xl",
          className
        )}
      />
      <img
        src={useFavicon ? "/favicon-32.png" : "/icon-512.png"}
        alt=""
        width={size}
        height={size}
        className={clsx(
          "shrink-0 hidden dark:block",
          useFavicon ? "rounded" : "rounded-xl",
          className
        )}
      />
    </>
  );
}
