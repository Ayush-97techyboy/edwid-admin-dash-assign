import React from 'react';
import { AlertCircle } from 'lucide-react';
const InputField = ({ label, name, type = 'text', value, onChange, error, placeholder, disabled, required, icon: Icon }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Icon size={16} /></div>}
      <input type={type} name={name} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`w-full ${Icon ? 'pl-10' : 'px-3'} py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${error ? 'border-red-300' : 'border-gray-300'}`} />
    </div>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
  </div>
);
export default InputField;
