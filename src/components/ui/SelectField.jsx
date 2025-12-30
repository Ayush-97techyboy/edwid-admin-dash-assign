import React from 'react';
const SelectField = ({ label, name, value, onChange, options, error }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium theme-text-primary mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange} className="w-full px-3 py-2 theme-border border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-[#ff8449] theme-bg-secondary theme-text-primary">
      {options.map((opt) => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);
export default SelectField;
