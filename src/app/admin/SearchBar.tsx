"use client"
import React, { ReactNode, KeyboardEvent} from "react";


interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  filterSlot?: ReactNode;
}

const SearchBar = ({ placeholder = '', onSearch, filterSlot }: SearchBarProps) => {

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        onSearch?.(target.value);
      }
    }

  return (
    <>
    <div className='flex justify-between h-15 items-center my-8'>
        <div className="search__bar relative gap-4">
                <span className='flex items-center absolute inset-y-0 left-4'><i className="ri-search-line"></i></span>
                <input type="text" placeholder={placeholder} onKeyDown={handleKeyDown}
                className='border border-gray-300 rounded-xl my-4 py-2 pl-12 w-[400px]'/>
        </div>
        {filterSlot}
    </div>
   </>
  )
}

export default SearchBar