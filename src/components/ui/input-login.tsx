import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import { tv, type VariantProps } from '@/utils/tv';
import type { PolymorphicComponentProps } from '@/utils/polymorphic';

const INPUT_ROOT_NAME = 'InputRoot';
const INPUT_WRAPPER_NAME = 'InputWrapper';
const INPUT_EL_NAME = 'InputEl';
const INPUT_ICON_NAME = 'InputIcon';

export const inputVariants = tv({
  slots: {
    root: [
      // base
      'group relative flex w-full overflow-hidden bg-bg-weak-50 text-text-strong-950',
      'min-w-[360px] rounded-8',
      'transition duration-200 ease-out',
      // before pseudo-element
      'before:absolute before:inset-0 before:pointer-events-none before:rounded-[inherit]',
      'before:transition before:duration-200 before:ease-out',
    ],
    wrapper: [
      // base
      'group/input-wrapper flex w-full cursor-text items-center bg-bg-weak-50',
      'transition duration-200 ease-out gap-2 px-4',
    ],
    input: [
      // base
      'w-full bg-bg-weak-50 text-paragraph-md uppercase font-styrene font-bold text-text-strong-950',
      'h-12 outline-none transition duration-200 ease-out',
      // placeholder
      'placeholder:select-none placeholder:text-text-disabled-300',
      'placeholder:transition placeholder:duration-200 placeholder:ease-out',
      // hover & focus placeholder
      'group-hover/input-wrapper:placeholder:text-text-soft-400',
      'group-has-[input:focus]:placeholder:text-text-soft-400',
    ],
    icon: [
      // base
      'flex size-5 shrink-0 select-none items-center justify-center',
      'transition duration-200 ease-out',
      // placeholder state
      'group-has-[:placeholder-shown]:text-text-disabled-300',
      // filled state
      'text-text-soft-400',
      // hover
      'group-has-[:placeholder-shown]:group-hover/input-wrapper:text-text-soft-400',
    ],
  },
});

type InputSharedProps = VariantProps<typeof inputVariants>;

function InputRoot({
  className,
  children,
  asChild,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> &
  InputSharedProps & {
    asChild?: boolean;
  }) {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : 'div';

  const { root } = inputVariants();

  const sharedProps: InputSharedProps = {};

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [
      INPUT_WRAPPER_NAME,
      INPUT_EL_NAME,
      INPUT_ICON_NAME,
    ],
    uniqueId,
    asChild,
  );

  return (
    <Component className={root({ class: className })} {...rest}>
      {extendedChildren}
    </Component>
  );
}
InputRoot.displayName = INPUT_ROOT_NAME;

function InputWrapper({
  className,
  children,
  asChild,
  ...rest
}: React.HTMLAttributes<HTMLLabelElement> &
  InputSharedProps & {
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : 'label';

  const { wrapper } = inputVariants();

  return (
    <Component className={wrapper({ class: className })} {...rest}>
      {children}
    </Component>
  );
}
InputWrapper.displayName = INPUT_WRAPPER_NAME;

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> &
    InputSharedProps & {
      asChild?: boolean;
    }
>(
  (
    { className, type = 'text', asChild, ...rest },
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : 'input';

    const { input } = inputVariants();

    return (
      <Component
        type={type}
        className={input({ class: className })}
        ref={forwardedRef}
        {...rest}
      />
    );
  },
);
Input.displayName = INPUT_EL_NAME;

function InputIcon<T extends React.ElementType = 'div'>({
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, InputSharedProps>) {
  const Component = as || 'div';
  const { icon } = inputVariants();
  
  return <Component className={icon({ class: className })} {...rest} />;
}
InputIcon.displayName = INPUT_ICON_NAME;

export {
  InputRoot as Root,
  InputWrapper as Wrapper,
  Input,
  InputIcon as Icon,
};