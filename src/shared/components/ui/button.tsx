import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@shared/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 border-0",
  {
    variants: {
      variant: {
        default: '!bg-black !text-white hover:!bg-gray-800 transition-colors',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 neumorphism',
        outline:
          'neumorphism hover:neumorphism-pressed text-foreground',
        secondary: 'neumorphism text-secondary-foreground hover:neumorphism-pressed',
        ghost: 'hover:bg-accent/50 hover:text-accent-foreground transition-colors',
        link: 'text-primary underline-offset-4 hover:underline bg-transparent shadow-none',
      },
      size: {
        default: 'h-11 min-h-[44px] px-4 py-2 has-[>svg]:px-3 sm:h-9 sm:min-h-[36px]',
        sm: 'h-10 min-h-[44px] rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5 sm:h-8 sm:min-h-[32px]',
        lg: 'h-12 min-h-[44px] rounded-xl px-6 has-[>svg]:px-4 sm:h-10 sm:min-h-[40px]',
        icon: 'size-11 min-h-[44px] min-w-[44px] sm:size-9',
        'icon-sm': 'size-10 min-h-[44px] min-w-[44px] sm:size-8',
        'icon-lg': 'size-12 min-h-[44px] min-w-[44px] sm:size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
