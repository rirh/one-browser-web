import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  ApiIcon,
  BrowserIcon,
  PaintBoardIcon,
  Refresh01Icon,
  Route01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { CSSProperties, ComponentProps, ReactNode } from 'react';

export type SettingsSectionId =
  | 'general'
  | 'egress'
  | 'appearance'
  | 'local-api'
  | 'client';

type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  icon: ComponentProps<typeof HugeiconsIcon>['icon'];
};

const sections: SettingsSection[] = [
  {
    id: 'general',
    label: '常规',
    icon: BrowserIcon,
  },
  {
    id: 'egress',
    label: '线路',
    icon: Route01Icon,
  },
  {
    id: 'appearance',
    label: '外观与语言',
    icon: PaintBoardIcon,
  },
  {
    id: 'local-api',
    label: '本地 API',
    icon: ApiIcon,
  },
  {
    id: 'client',
    label: '客户端',
    icon: Refresh01Icon,
  },
];

export function SettingsWorkspace({
  children,
  onSectionChange,
  section,
}: {
  children: ReactNode;
  onSectionChange: (section: SettingsSectionId) => void;
  section: SettingsSectionId;
}) {
  const activeSection =
    sections.find((candidate) => candidate.id === section) ?? sections[0];

  return (
    <SidebarProvider
      className="h-full min-h-0 items-stretch overflow-hidden"
      style={{ '--sidebar-width': '176px' } as CSSProperties}
    >
      <Sidebar
        collapsible="none"
        className="hidden border-r border-sidebar-border md:flex"
      >
        <SidebarHeader className="h-[52px] justify-center px-4 py-0">
          <span className="font-heading text-[12px] font-semibold">设置</span>
        </SidebarHeader>
        <SidebarContent className="px-2 pb-3 pt-0.5">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {sections.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      className="h-8 px-2.5 text-[13px] font-normal data-active:font-medium"
                      isActive={item.id === activeSection.id}
                      onClick={() => onSectionChange(item.id)}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] shrink-0 items-center border-b border-border/70 px-4 pr-12 md:px-6">
          <h2 className="font-heading text-[14px] font-semibold">
            {activeSection.label}
          </h2>
        </header>
        <div className="shrink-0 border-b border-border/70 px-3 py-2 md:hidden">
          <Select
            value={activeSection.id}
            onValueChange={(value) =>
              onSectionChange(value as SettingsSectionId)
            }
          >
            <SelectTrigger className="h-8 w-full" aria-label="设置分类">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectGroup>
                {sections.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain px-4 py-4 [scrollbar-gutter:stable] md:px-6 md:py-5">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
