"use client";

import * as React from "react";
import * as LabelPrimitives from "@radix-ui/react-label";

import { cn } from "@/utils/cn";

const LabelRoot = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitives.Root> & {
    disabled?: boolean;
  }
>(({ className, disabled, ...rest }, forwardedRef) => {
  return (
    <LabelPrimitives.Root
      ref={forwardedRef}
      className={cn(
        "text-paragraph-md font-bold font-styrene uppercase text-text-strong-950",
        "flex items-center gap-px",
        className,
      )}
      aria-disabled={disabled}
      {...rest}
    />
  );
});
LabelRoot.displayName = "LabelRoot";

export { LabelRoot as Root };
