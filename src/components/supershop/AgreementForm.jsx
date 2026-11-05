"use client";

import React from "react";
import { Printer } from "lucide-react";
import Button from "@/components/common/Button";
import { SectionTitle } from "@/components/common/PagePieces";
import { formatDate } from "@/lib/utils";

const blank = "____________________";

/** The written agreement both sides sign. Prints alone, without the rest of the page. */
export default function AgreementForm({ shop }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #shop-agreement, #shop-agreement * { visibility: visible; color: #000; }
          #shop-agreement { position: absolute; inset: 0; padding: 32px; background: #fff; }
        }
      `}</style>
      <div className="flex items-center justify-between">
        <SectionTitle>Super Shop Agreement (চুক্তিপত্র)</SectionTitle>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
      </div>
      <div id="shop-agreement" className="space-y-3 text-sm text-gray-700 dark:text-zinc-300">
        <h3 className="text-center text-base font-bold text-gray-900 dark:text-white">
          NetRise BOB সুপার শপ চুক্তিপত্র
        </h3>
        <p>
          দোকানের নাম: <strong>{shop.shop_name}</strong> ({shop.shop_code}) &bull; মালিক: <strong>{shop.owner_name}</strong>
        </p>
        <p>
          ঠিকানা: {shop.address}, {shop.upazila}, {shop.district}, {shop.division} &bull; মোবাইল: {shop.phone}
        </p>
        <p>
          পণ্যের বিক্রয়ের উপর লাভের হার: <strong>{Number(shop.profit_percent) > 0 ? `${shop.profit_percent}%` : blank}</strong>
        </p>
        {shop.agreement_terms && <p className="whitespace-pre-line">{shop.agreement_terms}</p>}
        <div className="grid grid-cols-2 gap-8 pt-10 text-center">
          <div>
            <div className="border-t border-gray-400 pt-1">{shop.shop_signatory || "সুপার শপের পক্ষে স্বাক্ষর"}</div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-1">{shop.company_signatory || "কোম্পানির পক্ষে স্বাক্ষর"}</div>
          </div>
        </div>
        {shop.agreement_signed_at && (
          <p className="text-center text-xs text-gray-500">তারিখ: {formatDate(shop.agreement_signed_at)}</p>
        )}
      </div>
    </div>
  );
}
