"use client";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface FilterDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterDropdown({ options, value, onChange }: FilterDropdownProps) {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          {/* Nút bấm */}
          <Popover.Button className="flex gap-2 border border-gray-200 rounded-md py-2 px-3 items-center bg-white shadow-sm">
            <span>{value || "Bộ lọc"}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Popover.Button>

          {/* Menu xổ xuống */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
                <p className="text-[#848484] text-xs px-4 pt-1">Lọc theo</p>
              <div className="py-1">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChange(opt)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      value === opt ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
