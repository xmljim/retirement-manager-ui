import { Link } from 'react-router'

export function PersonForm() {
  // TODO: Implement form with TanStack Query mutation

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/profile" className="text-stone-500 hover:text-stone-700">
          &larr; Back
        </Link>
        <h1 className="font-[--font-display] text-3xl">Edit Profile</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl">
        <form className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block font-medium text-sm mb-1.5 text-stone-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block font-medium text-sm mb-1.5 text-stone-700">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block font-medium text-sm mb-1.5 text-stone-700"
            >
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="filingStatus"
              className="block font-medium text-sm mb-1.5 text-stone-700"
            >
              Filing Status
            </label>
            <select
              id="filingStatus"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
            >
              <option value="">Select filing status</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED_FILING_JOINTLY">Married Filing Jointly</option>
              <option value="MARRIED_FILING_SEPARATELY">Married Filing Separately</option>
              <option value="HEAD_OF_HOUSEHOLD">Head of Household</option>
            </select>
          </div>

          <div>
            <label htmlFor="state" className="block font-medium text-sm mb-1.5 text-stone-700">
              State (Optional)
            </label>
            <input
              id="state"
              type="text"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
              placeholder="Enter state"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Save Profile
            </button>
            <Link
              to="/profile"
              className="px-6 py-3 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
