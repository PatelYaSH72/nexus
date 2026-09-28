"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

/**
 * Resolves an icon by string name (as stored in data/*.ts files) so content
 * files never need to import React components directly. Falls back to a
 * generic circle if the name doesn't match a real lucide-react export —
 * fails visibly (an odd icon) rather than crashing the page on a typo.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];

  if (!Icon) {
    return <LucideIcons.Circle {...props} />;
  }

  return <Icon {...props} />;
}