import * as React from "react";
import { recursiveCloneChildren } from "@/utils/recursive-clone-children";
import { tv, type VariantProps } from "@/utils/tv";

const HINT_ROOT_NAME = "HintRoot";

export const hintVariants = tv({
  slots: {
    root: "group flex items-center gap-1 text-paragraph-xs font-styrene uppercase text-text-strong-950",
  },
  variants: {
    disabled: {
      true: {
        root: "text-text-disabled-300",
      },
    },
    hasError: {
      true: {
        root: "text-text-strong-950",
      },
    },
  },
});

type HintSharedProps = VariantProps<typeof hintVariants>;

type HintRootProps = VariantProps<typeof hintVariants> &
  React.HTMLAttributes<HTMLDivElement>;

function HintRoot({
  children,
  hasError,
  disabled,
  className,
  ...rest
}: HintRootProps) {
  const uniqueId = React.useId();
  const { root } = hintVariants({ hasError, disabled });

  const sharedProps: HintSharedProps = {
    hasError,
    disabled,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [],
    uniqueId,
  );

  return (
    <div className={root({ class: className })} {...rest}>
      {extendedChildren}
    </div>
  );
}
HintRoot.displayName = HINT_ROOT_NAME;

export { HintRoot as Root };
