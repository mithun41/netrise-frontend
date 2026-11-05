"use client";

import React, { useState } from "react";
import { ShoppingCart, Store, Wallet } from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import FormModal from "@/components/common/FormModal";
import { ErrorNote, ListTable, PageShell, SectionTitle, StatGrid } from "@/components/common/PagePieces";
import AgreementForm from "@/components/supershop/AgreementForm";
import { useAction, useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatDate, formatTaka, statusVariant } from "@/lib/utils";

const APPLY_FIELDS = [
  { name: "shop_name", label: "Shop name", required: true },
  { name: "owner_name", label: "Owner name", required: true },
  { name: "phone", label: "Mobile number", required: true },
  { name: "address", label: "Address", type: "textarea", required: true },
  { name: "division", label: "Division (বিভাগ)", required: true },
  { name: "district", label: "District (জেলা)", required: true },
  { name: "upazila", label: "Upazila (উপজেলা)", required: true },
  { name: "trade_license", label: "Trade license number" },
  { name: "merchant_code", label: "Merchant owner's referral code", help: "Leave empty to use your sponsor." },
];

const DOCUMENT_TYPES = [
  { value: "NID", label: "National ID" },
  { value: "TRADE_LICENSE", label: "Trade License" },
  { value: "AGREEMENT", label: "Signed Agreement" },
  { value: "OTHER", label: "Other" },
];

const statusColumn = {
  key: "status",
  header: "Status",
  render: (value, row) => <Badge variant={statusVariant(value)} size="sm">{row.status_display}</Badge>,
};

const ORDER_COLUMNS = [
  { key: "order_number", header: "Order" },
  { key: "items", header: "Items", render: (items) => items.map((i) => `${i.quantity}× ${i.name}`).join(", ") },
  { key: "total_amount", header: "Total", render: (value) => formatTaka(value) },
  statusColumn,
  { key: "created_at", header: "Date", render: (value) => formatDate(value) },
];

const DIRECTORY_COLUMNS = [
  { key: "shop_code", header: "Code" },
  { key: "shop_name", header: "Shop" },
  { key: "division", header: "Division" },
  { key: "district", header: "District" },
  { key: "upazila", header: "Upazila" },
  { key: "phone", header: "Mobile" },
];

function DocumentUpload({ documents, onUploaded }) {
  const [docType, setDocType] = useState("NID");
  const { isBusy, error, run } = useAction(onUploaded);

  const upload = (file) => {
    const body = new FormData();
    body.append("file", file);
    body.append("doc_type", docType);
    run(() => api.upload("/api/super-shop/documents/", body));
  };

  return (
    <div className="space-y-2">
      <SectionTitle>Documents</SectionTitle>
      <ErrorNote message={error} />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={isBusy}
          onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
          className="text-xs dark:text-zinc-300"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-zinc-400">PDF, JPG or PNG, up to 5 MB.</p>
      <ul className="text-sm text-gray-700 dark:text-zinc-300 space-y-1">
        {documents.map((document) => (
          <li key={document.id}>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => api.download(`/api/super-shop/documents/${document.id}/download/`, document.filename)}
            >
              {document.doc_type_display}: {document.filename}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShopPanel({ mine, onChanged }) {
  const { shop, stats, qr } = mine;
  const [isOrdering, setIsOrdering] = useState(false);
  const orders = useApi("/api/super-shop/orders/");
  const products = useApi("/api/products/");
  const productOptions = (products.data?.results || []).map((product) => ({
    value: product.id,
    label: `${product.name} (${formatTaka(product.wholesale_price || product.dp)})`,
  }));
  const isOpen = shop.status === "APPROVED";

  const placeOrder = (values) =>
    api
      .post("/api/super-shop/orders/", {
        items: [{ product_id: Number(values.product_id), quantity: Number(values.quantity) }],
        note: values.note,
      })
      .then(() => {
        orders.reload();
        onChanged();
      });

  return (
    <div className="space-y-6">
      <StatGrid
        items={[
          { label: "Status", value: shop.status_display, hint: shop.admin_note || `Code: ${shop.shop_code}` },
          { label: "Orders", value: stats.orders },
          { label: "Purchases", value: formatTaka(stats.purchases) },
          { label: "Payments Received", value: formatTaka(stats.payments_received) },
        ]}
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 text-center">
          <SectionTitle>Shop QR Code</SectionTitle>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI, nothing to optimise */}
          <img src={qr} alt={`QR code for ${shop.shop_code}`} className="mx-auto my-3 h-40 w-40 rounded bg-white" />
          <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{shop.shop_code}</p>
        </div>
        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <DocumentUpload documents={shop.documents} onUploaded={onChanged} />
        </div>
      </div>

      <AgreementForm shop={shop} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionTitle>Wholesale Orders</SectionTitle>
          <Button size="sm" disabled={!isOpen} onClick={() => setIsOrdering(true)}>
            <ShoppingCart className="h-3.5 w-3.5" /> New Order
          </Button>
        </div>
        <ListTable
          columns={ORDER_COLUMNS}
          rows={orders.data?.results}
          isLoading={orders.isLoading}
          emptyTitle="No orders yet"
        />
      </div>

      <FormModal
        isOpen={isOrdering}
        onClose={() => setIsOrdering(false)}
        title="New Wholesale Order"
        description="Paid from your E-Wallet at wholesale price. Your merchant owner then orders it from the company."
        submitLabel="Place Order"
        fields={[
          { name: "product_id", label: "Product", type: "select", options: productOptions, required: true },
          { name: "quantity", label: "Quantity", type: "number", min: "1", required: true, defaultValue: "1" },
          { name: "note", label: "Note" },
        ]}
        onSubmit={placeOrder}
      />
    </div>
  );
}

function MerchantPanel() {
  const { data, isLoading, reload } = useApi("/api/super-shop/merchant/orders/");
  const { isBusy, error, run } = useAction(reload);
  const act = (order, action) => run(() => api.post(`/api/super-shop/merchant/orders/${order.id}/${action}/`, {}));

  if (!isLoading && !data?.shops?.length) return null;

  const columns = [
    { key: "shop_name", header: "Shop" },
    ...ORDER_COLUMNS.filter((column) => column.key !== "created_at"),
    {
      key: "owner_profit",
      header: "My Profit",
      render: (value) => formatTaka(value),
    },
    {
      key: "actions",
      header: "",
      render: (_, row) =>
        row.status === "PENDING" && (
          <div className="flex gap-1.5">
            <Button size="sm" disabled={isBusy} onClick={() => act(row, "accept")}>
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={isBusy} onClick={() => act(row, "reject")}>
              Reject
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-2">
      <SectionTitle>Orders From My Shops (Merchant Owner)</SectionTitle>
      <ErrorNote message={error} />
      <ListTable columns={columns} rows={data?.results} isLoading={isLoading} emptyTitle="No shop orders yet" />
    </div>
  );
}

export default function SuperShopPage() {
  const mine = useApi("/api/super-shop/mine/");
  const directory = useApi("/api/super-shop/directory/");
  const [openForm, setOpenForm] = useState(null);
  const close = () => setOpenForm(null);

  return (
    <PageShell
      title="Super Shop (সুপার শপ)"
      description="Shop profile, wholesale orders, QR payments and shop directory."
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => setOpenForm("pay")}>
            <Wallet className="h-3.5 w-3.5" /> Pay a Shop
          </Button>
          {mine.data && !mine.data.shop && (
            <Button size="sm" onClick={() => setOpenForm("apply")}>
              <Store className="h-3.5 w-3.5" /> Open a Super Shop
            </Button>
          )}
        </>
      }
    >
      <ErrorNote message={mine.error} />
      {mine.data?.shop && <ShopPanel mine={mine.data} onChanged={mine.reload} />}
      <MerchantPanel />

      <div className="space-y-2">
        <SectionTitle>Shop Directory</SectionTitle>
        <ListTable
          columns={DIRECTORY_COLUMNS}
          rows={directory.data?.results}
          isLoading={directory.isLoading}
          searchKeys={["shop_name", "shop_code", "division", "district", "upazila"]}
          emptyTitle="No shops are open yet"
        />
      </div>

      <FormModal
        isOpen={openForm === "apply"}
        onClose={close}
        title="Open a Super Shop"
        submitLabel="Apply"
        fields={APPLY_FIELDS}
        onSubmit={(values) => api.post("/api/super-shop/mine/", values).then(mine.reload)}
      />
      <FormModal
        isOpen={openForm === "pay"}
        onClose={close}
        title="Pay a Shop"
        description="Paid from your E-Wallet."
        submitLabel="Pay"
        fields={[
          { name: "shop_code", label: "Shop code", required: true },
          { name: "amount", label: "Amount (৳)", type: "number", required: true },
        ]}
        onSubmit={(values) => api.post("/api/super-shop/pay/", values)}
      />
    </PageShell>
  );
}
