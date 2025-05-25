import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from '@/utils/tv';

const BUTTON_ROOT_NAME = 'ButtonRoot';

export const buttonVariants = tv({
  slots: {
    root: [
      // base structure
      'relative inline-flex items-center gap-3 z-0',
      'transition-opacity duration-300 ease-out',
      // capsule styles
      'font-styrene text-paragraph-md-bold uppercase',
      'py-3 px-8 rounded-full overflow-hidden',
      'bg-bg-strong-950 text-text-white-0',
      'transition-colors duration-300 ease-out',
      // before element for fill animation (translate from bottom)
      'before:content-[""] before:absolute before:inset-0 before:w-full before:h-full',
      'before:bg-white before:translate-y-full before:transition-transform before:duration-600 before:ease-out before:-z-20',
      // after element for border
      'after:content-[""] after:absolute after:inset-0 after:w-full after:h-full',
      'after:border after:border-stroke-soft-200 after:opacity-0 after:rounded-full after:pointer-events-none after:z-10',
      'after:transition-opacity after:duration-300',
      // hover states
      'hover:text-bg-strong-950 hover:before:translate-y-0 hover:after:opacity-100',
      // focus
      'focus:outline-none',
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
