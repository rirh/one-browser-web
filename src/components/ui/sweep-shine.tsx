import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

import styles from "./sweep-shine.module.css"

type SweepShineProps = React.ComponentProps<"span"> & {
  active?: boolean
  asChild?: boolean
}

function SweepShine({
  active = true,
  asChild = false,
  className,
  ...props
}: SweepShineProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="sweep-shine"
      className={cn(active && styles.sweepShine, className)}
      {...props}
    />
  )
}

export { SweepShine }
