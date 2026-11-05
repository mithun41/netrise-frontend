"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

const CONTROL_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

function initialValues(fields, initial) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = initial?.[field.name];
      if (field.type === "checkbox") return [field.name, Boolean(value)];
      return [field.name, value ?? field.defaultValue ?? ""];
    })
  );
}

function Field({ field, value, onChange }) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
        {field.label}
      </label>
    );
  }

  if (field.type === "select" || field.type === "textarea") {
    return (
      <div className="flex flex-col space-y-1.5">
        <label htmlFor={field.name} className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          {field.label}
        </label>
        {field.type === "select" ? (
          <select
            id={field.name}
            value={value}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="">Select...</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <textarea
            id={field.name}
            value={value}
            required={field.required}
            rows={3}
            onChange={(e) => onChange(e.target.value)}
            className={CONTROL_CLASS}
          />
        )}
      </div>
    );
  }

  return (
    <Input
      id={field.name}
      label={field.label}
      type={field.type || "text"}
      step={field.type === "number" ? "0.01" : undefined}
      min={field.type === "number" ? (field.min ?? "0") : undefined}
      value={value}
      required={field.required}
      helperText={field.help}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Form({ isOpen, onClose, title, fields, initial, submitLabel, description, onSubmit }) {
  const [values, setValues] = useState(() => initialValues(fields, initial));
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError("");
    Promise.resolve()
      .then(() => onSubmit(values))
      .then(onClose)
      .catch((err) => setError(err.message || "Something went wrong."))
      .finally(() => setIsBusy(false));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {description && <p className="text-sm text-gray-500 dark:text-zinc-400">{description}</p>}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value) => setValues((prev) => ({ ...prev, [field.name]: value }))}
          />
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isBusy}>
            {submitLabel || "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** A modal form built from a field list. onSubmit may return a promise; rejecting shows the error. */
export default function FormModal({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <Form isOpen={isOpen} {...props} />;
}
