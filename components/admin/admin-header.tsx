'use client'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface AdminHeaderProps {
  title: string
  subtitle: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-teal-200 bg-white/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-teal-700 hover:bg-teal-50" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 border-teal-200"
        />
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-teal-950">
            {title}
          </h1>
          <p className="text-xs text-teal-700">{subtitle}</p>
        </div>
      </div>
    </header>
  )
}












