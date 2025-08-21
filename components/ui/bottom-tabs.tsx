"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, SquarePlus, Map, SquareUser } from "lucide-react"
import { cn } from "@/lib/utils"
 

type TabItem = {
  key: "home" | "plans" | "create" | "map" | "profile"
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export function BottomTabs() {
  const pathname = usePathname()

  const items: TabItem[] = [
    { key: "home", label: "Home", icon: Home, href: "/" },
    { key: "plans", label: "Plans", icon: Calendar, href: "/plans" },
    { key: "create", label: "Create", icon: SquarePlus, href: "/planner/new" },
    { key: "map", label: "Map", icon: Map, href: "/map" },
    { key: "profile", label: "Profile", icon: SquareUser, href: "/profile" },
  ]

  const isActive = (key: TabItem["key"], href: string) => {
    if (key === "home") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:hidden">
      <div className="mx-auto flex justify-evenly gap-2 px-4 py-2">
        {items.map(({ key, label, icon: Icon, href }) => {
          const active = isActive(key, href)

          if (key === "create") {
            return (
              <Link
                key={key}
                href="/planner/new"
                className="flex flex-col items-center justify-center text-[13px] bg-teal-600 w-[4rem] rounded-lg"
              >
                <Icon className="h-6 w-6 text-white" />
                <span className="leading-none text-white pt-1">{label}</span>
              </Link>
            )
          }
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 text-[13px]",
                active ? "text-teal-600" : "text-gray-900"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-6 w-6", active ? "text-teal-600" : "text-gray-900")} />
              <span className="leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


