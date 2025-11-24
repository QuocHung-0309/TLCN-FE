'use client';

import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="bg-[var(--gray-6)] text-[var(--gray-2)] text-[8px] sm:text-sm">
      <div className="w-full max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-14 py-10">
        <div className="grid grid-cols-3 gap-6 sm:gap-8 mb-6">
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-500 mb-3 text-xs sm:text-sm">Explore program</h4>
            <ul className="space-y-2 leading-relaxed">
              <li className="min-w-0 break-words">
                <a href="#" className="hover:underline">Cashback</a>
              </li>
              <li className="min-w-0 break-words">
                <a href="#" className="hover:underline">Corporate</a>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-gray-500 mb-3 text-xs sm:text-sm">DUDI SOFTWARE</h4>
            <ul className="space-y-2 leading-relaxed">
              <li className="min-w-0 break-words">
                <a href="#" className="hover:underline">About us</a>
              </li>
              <li className="min-w-0 break-words">
                <a href="#" className="hover:underline">Contact us</a>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-gray-500 mb-3 text-xs sm:text-sm">Contact</h4>
            <ul className="space-y-3 leading-relaxed">
              <li className="flex items-start gap-2 min-w-0">
                <HiOutlineLocationMarker className="mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">
                  232 Nguyen Thi Minh Khai Street,<br />
                  Vo Thi Sau Ward, District 3, HCM City
                </span>
              </li>
              <li className="flex items-center gap-2 min-w-0">
                <HiOutlinePhone className="shrink-0" />
                <span className="min-w-0 break-words">(+84) 909 163 821</span>
              </li>
              <li className="flex items-center gap-2 min-w-0">
                <HiOutlineMail className="shrink-0" />
                <span className="min-w-0 break-all">contact@dudisoftware.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border border-[var(--gray-5)] my-6" />

        <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center md:justify-end leading-relaxed">
          <a href="#" className="hover:underline">Privacy</a>
          <span className="text-gray-4">•</span>
          <a href="#" className="hover:underline">Terms</a>
          <span className="text-gray-4">•</span>
          <a href="#" className="hover:underline">Payment methods</a>
          <span className="text-gray-4">•</span>
          <a href="#" className="hover:underline">Check-in</a>
          <span className="text-gray-4">•</span>
          <a href="#" className="hover:underline">Change & refund</a>
          <span className="text-gray-4">•</span>
          <a href="#" className="hover:underline">eCommerce</a>
          <span className="text-gray-4">•</span>
          <a href="#" className="hover:underline">Dispute Resolution</a>
        </div>
      </div>
    </footer>
  );
}
