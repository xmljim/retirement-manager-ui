export function LimitsDisplay() {
  // TODO: Fetch limits from API with TanStack Query

  const limits = [
    { name: '401(k) Employee Contribution', under50: '$23,500', over50: '$31,000' },
    { name: '401(k) Total Limit', under50: '$70,000', over50: '$77,500' },
    { name: 'IRA Contribution', under50: '$7,000', over50: '$8,000' },
    { name: 'HSA Individual', under50: '$4,300', over50: '$5,300' },
    { name: 'HSA Family', under50: '$8,550', over50: '$9,550' },
  ]

  return (
    <div>
      <h1 className="font-[--font-display] text-3xl mb-6">2025 Contribution Limits</h1>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-100">
            <tr>
              <th className="text-left px-6 py-4 font-medium text-stone-700">Account Type</th>
              <th className="text-right px-6 py-4 font-medium text-stone-700">Under 50</th>
              <th className="text-right px-6 py-4 font-medium text-stone-700">50 and Over</th>
            </tr>
          </thead>
          <tbody>
            {limits.map((limit, index) => (
              <tr key={limit.name} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                <td className="px-6 py-4 font-medium">{limit.name}</td>
                <td className="px-6 py-4 text-right font-[--font-display] text-teal-600">
                  {limit.under50}
                </td>
                <td className="px-6 py-4 text-right font-[--font-display] text-teal-600">
                  {limit.over50}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> These are the IRS limits for 2025. Catch-up contributions are
          available for those aged 50 and over.
        </p>
      </div>
    </div>
  )
}
