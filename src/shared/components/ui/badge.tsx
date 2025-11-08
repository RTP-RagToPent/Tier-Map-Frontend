import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@shared/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 border-0',
  {
    variants: {
      variant: {
        default: 'neumorphism text-primary-foreground',
        secondary: 'neumorphism text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground neumorphism',
        outline: 'neumorphism text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
