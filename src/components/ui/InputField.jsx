import React from 'react';
import { AlertCircle } from 'lucide-react';
const InputField = ({ label, name, type = 'text', value, onChange, error, placeholder, disabled, required, icon: Icon }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium theme-text-primary mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none theme-text-secondary"><Icon size={16} /></div>}
      <input type={type} name={name} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`w-full ${Icon ? 'pl-10' : 'px-3'} py-2 theme-border border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-[#ff8449] transition-colors theme-bg-secondary theme-text-primary ${error ? 'border-red-300' : 'theme-border'}`} />
    </div>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
  </div>
);
export default InputField;
