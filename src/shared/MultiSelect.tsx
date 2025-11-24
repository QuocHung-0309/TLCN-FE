import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import CustomDropdown from "@/shared/CustomDropdown";

export interface MultiSelectProps<T> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getLabel: (option: T) => string;
}

export function MultiSelect<T>({
  options,
  value,
  onChange,
  getLabel,
}: MultiSelectProps<T>) {

  const removeOption = (option: T) => {
    onChange(value.filter(v => getLabel(v) !== getLabel(option)));
  };

  return (
    <Listbox
    value={value}
    onChange={(newValue: T[]) => onChange(newValue)}
    multiple
    >
    <div className="relative">
      <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 sm:text-sm flex flex-wrap gap-1">
        {value.length > 0 ? (
          value.map(option => (
            <span
              key={getLabel(option)}
              className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
              onClick={e => {
                e.stopPropagation(); 
                removeOption(option);
              }}
            >
              {getLabel(option)}
              <XMarkIcon className="h-4 w-4 cursor-pointer hover:text-red-500" />
            </span>
          ))
        ) : (
          <span className="text-gray-400">Chọn mục</span>
        )}
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </span>
      </Listbox.Button>
  
      <Transition as={Fragment}>
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-gray-300 ring-opacity-5 sm:text-sm">
          {options.map(option => {
            const label = getLabel(option);
            const isSelected = value.some(v => getLabel(v) === label);
            return (
              <Listbox.Option
                key={label}
                value={option}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                  }`
                }
              >
                <>
                  <span
                    className={`block truncate ${
                      isSelected ? "font-medium" : "font-normal"
                    }`}
                  >
                    {label}
                  </span>
                  {isSelected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                      <CheckIcon className="h-5 w-5" />
                    </span>
                  )}
                </>
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </Transition>
    </div>
  </Listbox>
  
  );
}
