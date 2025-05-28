import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from '@/utils/tv';

const ICON_BUTTON_ROOT_NAME = 'IconButtonRoot';

export const iconButtonVariants = tv({
  slots: {
    root: [
      'group',
      'relative',
      'flex',
      'items-center',
      'gap-2',
      'font-styrene',
      'text-paragraph-md',
      'font-bold',
      'uppercase',
      'text-adaptive',
      'transition-all',
      'duration-300',
    ],
    text: [
    ],
    icon: [
      'transition-transform',
    ],
    underline: [
      'absolute',
      'bottom-0',
      'h-[2px]',
      'w-0',
      'translate-y-1',
      'transform',
      'bg-adaptive-text',
      'transition-all',
      'duration-700',
      'ease-[cubic-bezier(0.22,0.61,0.36,1)]',
      'group-hover:w-1/2',
    ],
    underlineLeft: [
      'left-0',
    ],
    underlineRight: [
      'right-0',
    ],
  },
  variants: {
    position: {
      relative: {},
      absolute: {
        root: [
          'absolute',
          'bottom-8',
          'right-8',
          'z-10',
        ],
      },
    },
    iconPosition: {
      start: {
        icon: [
          'group-hover:-translate-x-1',
        ],
      },
      end: {
        icon: [
          'group-hover:translate-x-1',
        ],
      },
    },
  },
  defaultVariants: {
    position: 'relative',
    iconPosition: 'end',
  },
});

type IconButtonRootProps = VariantProps<typeof iconButtonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
  };

const IconButtonRoot = React.forwardRef<HTMLButtonElement, IconButtonRootProps>(
  (
    { children, icon, asChild, className, position, iconPosition, ...rest },
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : 'button';
    const styles = iconButtonVariants({ position, iconPosition });

    const iconElement = icon && (
      <span className={styles.icon()}>
        {icon}
      </span>
    );

    return (
      <Component
        ref={forwardedRef}
        className={styles.root({ className })}
        {...rest}
      >
        {iconPosition === 'start' && iconElement}
        <span className={styles.text()}>
          {children}
        </span>
        {iconPosition === 'end' && iconElement}
        {/* Левая линия - появляется слева и движется к центру */}
        <span className={`${styles.underline()} ${styles.underlineLeft()}`} />
        {/* Правая линия - появляется справа и движется к центру */}
        <span className={`${styles.underline()} ${styles.underlineRight()}`} />
      </Component>
    );
  },
);
IconButtonRoot.displayName = ICON_BUTTON_ROOT_NAME;

export { IconButtonRoot as Root }; 