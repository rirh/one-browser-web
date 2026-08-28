import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

import type { HealthSnapshot } from '../types';
import { InfoRow } from './info-row';

export function DependencyStatusCard({ status }: { status: HealthSnapshot }) {
  const dependencies = [
    ['Backend', status.status],
    ['PostgreSQL', status.postgres],
    ['SeaORM', status.sea_orm],
    ['Redis', status.redis],
  ] as const;

  return (
    <Card className="dark:border-border/40 border-none shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Database className="text-muted-foreground size-5" />
          依赖状态
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {status.service} · {status.environment}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dependencies.map(([label, value]) => {
          const healthy = value.toLowerCase() === 'ok';
          return (
            <div
              key={label}
              className="border-border/60 bg-muted/10 dark:border-border/30 rounded-2xl border p-4"
            >
              <InfoRow
                label={label}
                value={
                  <Badge variant={healthy ? 'success' : 'destructive'}>
                    {value}
                  </Badge>
                }
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
