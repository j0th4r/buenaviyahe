import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  LayoutDashboard,
  MapPin,
  MessageSquare,
  BarChart3,
  Upload,
  LogOut,
  Menu,
} from 'lucide-react'
import { AdminUser } from '@/lib/auth/admin'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

interface AdminLayoutProps {
  children: ReactNode
  user: AdminUser
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Listings', href: '/admin/listings', icon: MapPin },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  // { name: 'Upload', href: '/admin/upload', icon: Upload },
]

function NavigationItems() {
  return (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-teal-50 transition-all hover:text-teal-200 hover:bg-teal-700"
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </>
  )
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-teal-600/70 md:block">
        <div className="relative flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-semibold text-teal-50"
            >
              <span>LGU Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavigationItems />
            </nav>
          </div>
          <div className="fixed bottom-0 left-0 w-[220px] lg:w-[280px] p-4 z-10">
            <div className="flex items-center gap-3 rounded-lg bg-background p-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile.avatar_url} />
                <AvatarFallback>
                  {user.profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.profile.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header & Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col bg-teal-600/70"
            >
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-lg font-semibold mb-6"
                >
                  <MapPin className="h-6 w-6" />
                  <span>Buena Viyahe Admin</span>
                </Link>
                <NavigationItems />
              </nav>
              <div className="mt-auto">
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile.avatar_url} />
                    <AvatarFallback>
                      {user.profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.profile.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold text-teal-950">
              Management Center
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profile.avatar_url} />
              <AvatarFallback>
                {user.profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
