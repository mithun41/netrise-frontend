# 🚀 NetRise Frontend

একটি আধুনিক, স্কেলেবল এবং ক্লিন আর্কিটেকচারে তৈরি **Next.js + Tailwind CSS + Zustand + JavaScript** স্টার্টার প্রজেক্ট।

---

## 🛠️ টেকনোলজি স্ট্যাক (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight & Reactive)
- **Language**: JavaScript (Clean ES6+ with `@/*` path aliasing)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `clsx`, `tailwind-merge`

---

## 📁 ফোল্ডার স্ট্রাকচার (Folder Structure)

```text
NetRise-Frontend/
├── public/                 # স্ট্যাটিক অ্যাসেট (ছবির ফাইল, আইকন ইত্যাদি)
├── src/
│   ├── app/                # Next.js App Router (পেজ, লেআউট ও রুট হ্যান্ডলার)
│   │   ├── (auth)/         # Auth রুট গ্রুপ (লগইন, রেজিস্ট্রেশন ইত্যাদি)
│   │   │   └── login/      # /login পেজ
│   │   ├── (dashboard)/    # ড্যাশবোর্ড রুট গ্রুপ
│   │   │   └── dashboard/  # /dashboard পেজ
│   │   ├── api/            # ব্যাকএন্ড API এন্ডপয়েন্ট
│   │   │   └── health/     # /api/health (সিস্টেম হেলথ চেক)
│   │   ├── error.js        # এরর হ্যান্ডলিং বাউন্ডারি
│   │   ├── loading.js      # লোডিং স্টেট UI
│   │   ├── not-found.js    # কাস্টম 404 পেজ
│   │   ├── globals.css     # Tailwind গ্লোবাল সিএসএস
│   │   ├── layout.js       # রুট লেআউট (Navbar + Footer)
│   │   └── page.js         # হোম পেজ (Landing Page)
│   │
│   ├── components/         # রিইউজেবল কম্পোনেন্টসমূহ
│   │   ├── common/         # জেনেরিক UI কম্পোনেন্ট (Button, Card, Input, Modal)
│   │   ├── layout/         # সাইট লেআউট কম্পোনেন্ট (Navbar, Footer, Sidebar)
│   │   └── modules/        # ফিচার/ডোমেন ভিত্তিক কম্পোনেন্ট (home, auth, etc.)
│   │       └── home/       # হোমপেজের সেকশনগুলো (Hero, Demo, Features)
│   │
│   ├── store/              # Zustand গ্লোবাল স্টেট ম্যানেজমেন্ট
│   │   ├── useAppStore.js     # থিম, সাইডবার ও নোটিফিকেশন স্টেট
│   │   ├── useAuthStore.js    # ইউজার অথেনটিকেশন ও টোকেন স্টেট
│   │   ├── useCounterStore.js # সিঙ্ক ও অ্যাসিঙ্ক অ্যাকশনসহ ডেমো স্টোর
│   │   └── index.js           # ব্যারেল এক্সপোর্ট
│   │
│   ├── hooks/              # কাস্টম রিঅ্যাক্ট হুক্স
│   │   ├── useLocalStorage.js # ব্রাউজার লোকাল স্টোরেজ সিঙ্ক
│   │   ├── useMediaQuery.js   # রেসপনসিভ স্ক্রিন ডিটেকশন
│   │   └── useDebounce.js     # সার্চ ও ফাস্ট ইনপুট ডিবউন্স
│   │
│   ├── lib/                # হেল্পার ফাংশন ও কনস্ট্যান্ট
│   │   ├── utils.js        # cn (clsx + tailwind-merge) ও ফরম্যাটিং
│   │   └── constants.js    # সাইটের কনফিগারেশন ও নেভিগেশন লিংক
│   │
│   └── services/           # API ক্লায়েন্ট ও ডেটা ফেচিং ফাংশন
│       └── api.js          # Reusable fetch client (GET, POST, PUT, DELETE)
│
├── jsconfig.json           # Absolute Path Mapping (@/* -> ./src/*)
├── next.config.mjs         # Next.js কনফিগারেশন
└── package.json            # ডিপেন্ডেন্সি ও স্ক্রিপ্টসমূহ
```

---

## 🏃‍♂️ কীভাবে প্রজেক্ট চালাবেন (Getting Started)

### ১. ডেভেলপমেন্ট সার্ভার চালু করুন:
```bash
npm run dev
```
ব্রাউজারে [http://localhost:3000](http://localhost:3000) ওপেন করুন।

### ২. প্রোডাকশন বিল্ড তৈরি করুন:
```bash
npm run build
npm run start
```

### ৩. কোড লিন্ট চেক করুন:
```bash
npm run lint
```

---

## 🧠 Zustand স্টেট কীভাবে ব্যবহার করবেন?

নতুন কোনো কম্পোনেন্টে স্টেট ব্যবহার করতে চাইলে:

```jsx
"use client";

import { useCounterStore } from "@/store/useCounterStore";

export default function MyComponent() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Add +1</button>
    </div>
  );
}
```

---

## 🧩 রিইউজেবল বাটন বা ইনপুট কম্পোনেন্ট ব্যবহার

```jsx
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

export default function FormExample() {
  return (
    <div className="space-y-4">
      <Input label="Username" placeholder="Enter your username" />
      <Button variant="primary" size="md">
        Submit
      </Button>
    </div>
  );
}
```

---

## 📊 স্ট্যান্ডার্ড রিইউজেবল ডাটা টেবিল (DataTable Usage)

প্রজেক্টের প্রতিটি টেবিল যাতে **একই স্ট্যান্ডার্ড ডিজাইন** বজায় রাখে এবং **ফাস্ট ডাটা লোডিং** নিশ্চিত করে, সেজন্য `DataTable` এবং `useDataTable` হুক তৈরি করা হয়েছে:

```jsx
"use client";

import { DataTable } from "@/components/common/table";
import { useDataTable } from "@/hooks/useDataTable";
import Badge from "@/components/common/Badge";

const columns = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email" },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (status) => (
      <Badge variant={status === "Active" ? "success" : "warning"} dot>
        {status}
      </Badge>
    ),
  },
];

export default function MyTablePage() {
  const table = useDataTable({
    data: myDataList,
    searchKeys: ["name", "email"],
    initialPageSize: 10,
  });

  return (
    <DataTable
      columns={columns}
      data={table.data}
      isLoading={false}
      sortKey={table.sortKey}
      sortDirection={table.sortDirection}
      onSort={table.handleSort}
      searchValue={table.searchTerm}
      onSearchChange={table.setSearchTerm}
      pagination={{
        currentPage: table.currentPage,
        totalPages: table.totalPages,
        totalItems: table.totalItems,
        pageSize: table.pageSize,
        onPageChange: table.setCurrentPage,
        onPageSizeChange: table.setPageSize,
      }}
    />
  );
}
```

