// Button: the one action control. Variants are what the action is (primary,
// secondary, ghost, danger, link); sizes are its box. `buttonVariants()` is a
// plain function, callable on the server, for a Link or a <summary> that must
// look like a button without being one.
// The classes are recipes/button.ts, which the sites' Button.astro reads too.
import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { buttonVariants, type ButtonVariant } from "../recipes/button";
import { cn } from "./cn";

export { buttonVariants, type ButtonVariant };

/** shape and block are the sites' (Button.astro); an app's button is drawn by variant and size. */
export type ButtonProps = React.ComponentProps<"button"> & Pick<VariantProps<typeof buttonVariants>, "variant" | "size"> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
