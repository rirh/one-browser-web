import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ReactNode } from 'react';

export function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: ReactNode;
  description: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">{description}</CardContent>
    </Card>
  );
}
