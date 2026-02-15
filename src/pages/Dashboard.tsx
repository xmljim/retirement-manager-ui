export function Dashboard() {
  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <h1 className="font-[--font-display] text-3xl">
          Good morning, <span className="text-stone-500 font-normal">User</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
            U
          </div>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Portfolio" value="$0" change="Get started" />
        <StatCard label="YTD Contributions" value="$0" change="0% of max" highlight />
        <StatCard label="Employer Match" value="$0" change="Add accounts" />
        <StatCard label="Remaining Room" value="$0" change="View limits" />
      </section>

      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-[--font-display] text-lg">Your Accounts</h2>
            <a href="/accounts" className="text-sm text-teal-600">
              View All
            </a>
          </div>
          <p className="text-stone-500">No accounts yet. Add your first account to get started.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-[--font-display] text-lg mb-5">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <QuickActionButton title="Set Up Profile" description="Add your information" />
            <QuickActionButton title="View Limits" description="2025 contribution limits" />
            <QuickActionButton title="Add Account" description="Track your accounts" />
          </div>
        </div>
      </section>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  change: string
  highlight?: boolean
}

function StatCard({ label, value, change, highlight }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-stone-500 mb-2">{label}</p>
      <p
        className={`font-[--font-display] text-2xl font-semibold ${highlight ? 'text-teal-600' : ''}`}
      >
        {value}
      </p>
      <p className="text-xs text-emerald-500 mt-1">{change}</p>
    </div>
  )
}

interface QuickActionButtonProps {
  title: string
  description: string
}

function QuickActionButton({ title, description }: QuickActionButtonProps) {
  return (
    <button className="flex items-center gap-3 w-full p-4 border border-stone-200 rounded-xl bg-white hover:border-teal-500 hover:bg-stone-50 transition-all text-left">
      <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
        +
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-stone-500">{description}</div>
      </div>
    </button>
  )
}
