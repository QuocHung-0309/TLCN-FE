"use client";
import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  className = "flex-1",
}: DropdownProps) {
  return (
    <div className={` ${className}`}>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          {/* Nút dropdown */}
          <Listbox.Button className="relative flex-1 w-full cursor-default rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 sm:text-sm">
            <span className="block truncate">{value}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>

          {/* Menu */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-99">
              {options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  value={option}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
