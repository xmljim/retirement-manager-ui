import { NavLink } from 'react-router'

interface NavItem {
  path: string
  label: string
  icon: string
}

const mainNavItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'H' },
  { path: '/profile', label: 'Profile', icon: 'P' },
  { path: '/accounts', label: 'Accounts', icon: 'A' },
]

const planningNavItems: NavItem[] = [
  { path: '/contributions', label: 'Contributions', icon: 'C' },
  { path: '/limits', label: 'Limits', icon: 'L' },
  { path: '/projections', label: 'Projections', icon: 'P' },
]

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
          isActive ? 'bg-teal-600 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <span className="w-5 text-center font-medium">{item.icon}</span>
      {item.label}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="bg-stone-900 w-60 min-h-screen p-4 flex flex-col">
      <div className="font-[--font-display] text-xl text-white px-3 py-2 mb-8">RetireWise</div>

      <nav className="flex flex-col gap-1">
        {mainNavItems.map(item => (
          <NavItemLink key={item.path} item={item} />
        ))}

        <div className="text-xs uppercase tracking-wider text-stone-500 px-4 pt-6 pb-2">
          Planning
        </div>

        {planningNavItems.map(item => (
          <NavItemLink key={item.path} item={item} />
        ))}
      </nav>
    </aside>
  )
}
