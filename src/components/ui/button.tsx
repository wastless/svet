import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from '@/utils/tv';

const BUTTON_ROOT_NAME = 'ButtonRoot';

export const buttonVariants = tv({
  slots: {
    root: [
      // Use btn-adaptive class for all adaptive styling
      'btn-adaptive',
    ],
  },
});

type ButtonRootProps = VariantProps<typeof buttonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  (
    { children, asChild, className, ...rest },
    forwardedRef,
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';
    const styles = buttonVariants();

    return (
      <Component
        ref={forwardedRef}
        className={styles.root({ className })}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
ButtonRoot.displayName = BUTTON_ROOT_NAME;

export { ButtonRoot as Root };
