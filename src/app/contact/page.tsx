"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FormState = "idle" | "submitting" | "success";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const subjects = [
  "Allgemeine Anfrage",
  "Event / Gathering",
  "Community & Onboarding",
  "Presse & Kooperation",
  "Technisches Feedback",
  "Sonstiges",
];

function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-semibold uppercase tracking-widest mb-2 transition-colors duration-200 ${
          focused ? "text-oe-spirit-cyan" : "text-oe-pure-light/40"
        }`}
      >
        {label}
        {required && <span className="ml-1 text-oe-solar-gold">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-oe-aurora-violet/5 border rounded-xl px-5 py-3.5 text-sm text-oe-pure-light placeholder-oe-pure-light/25 outline-none transition-all duration-200 ${
          focused
            ? "border-oe-spirit-cyan/50 ring-1 ring-oe-spirit-cyan/20"
            : "border-oe-aurora-violet/20 hover:border-oe-aurora-violet/40"
        }`}
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  onChange,
  options,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-semibold uppercase tracking-widest mb-2 transition-colors duration-200 ${
          focused ? "text-oe-spirit-cyan" : "text-oe-pure-light/40"
        }`}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-oe-aurora-violet/5 border rounded-xl px-5 py-3.5 text-sm text-oe-pure-light outline-none transition-all duration-200 appearance-none cursor-pointer ${
          focused
            ? "border-oe-spirit-cyan/50 ring-1 ring-oe-spirit-cyan/20"
            : "border-oe-aurora-violet/20 hover:border-oe-aurora-violet/40"
        }`}
        style={{ colorScheme: "dark" }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0a0a12] text-oe-pure-light">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-[2.85rem] text-oe-pure-light/30">
        ↓
      </div>
    </div>
  );
}

function TextareaField({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-semibold uppercase tracking-widest mb-2 transition-colors duration-200 ${
          focused ? "text-oe-spirit-cyan" : "text-oe-pure-light/40"
        }`}
      >
        {label}
        {required && <span className="ml-1 text-oe-solar-gold">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        rows={6}
        className={`w-full bg-oe-aurora-violet/5 border rounded-xl px-5 py-3.5 text-sm text-oe-pure-light placeholder-oe-pure-light/25 outline-none transition-all duration-200 resize-none ${
          focused
            ? "border-oe-spirit-cyan/50 ring-1 ring-oe-spirit-cyan/20"
            : "border-oe-aurora-violet/20 hover:border-oe-aurora-violet/40"
        }`}
      />
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: subjects[0],
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    // Simulate async submission
    setTimeout(() => setState("success"), 1200);
  }

  function handleReset() {
    setForm({ name: "", email: "", subject: subjects[0], message: "" });
    setState("idle");
  }

  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[50vh] px-6 pt-24 pb-12 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet"
        >
          Kontakt
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl leading-tight text-oe-solar-gold md:text-6xl"
        >
          Schreib uns.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 max-w-md text-base leading-relaxed text-oe-pure-light/60"
        >
          Wir lesen jede Nachricht persönlich. Kein Bot, keine Autoresponder —
          nur echte Menschen.
        </motion.p>
      </section>

      {/* Form Section */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {state === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-oe-spirit-cyan/30 bg-oe-spirit-cyan/5 px-6 py-12 sm:px-10 sm:py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-oe-spirit-cyan/50 flex items-center justify-center"
                >
                  <span className="text-2xl text-oe-spirit-cyan">✓</span>
                </motion.div>
                <h2 className="font-serif text-3xl text-oe-pure-light mb-4">
                  Danke, {form.name || "du"}!
                </h2>
                <p className="text-base text-oe-pure-light/60 mb-8">
                  Deine Nachricht ist bei uns angekommen. Wir melden uns in der
                  Regel innerhalb von 48 Stunden.
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl border border-oe-aurora-violet/30 text-sm text-oe-pure-light/70 hover:border-oe-aurora-violet/60 hover:text-oe-pure-light transition-colors duration-200"
                >
                  Neue Nachricht
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6 }}
                onSubmit={handleSubmit}
                className="rounded-2xl border border-oe-aurora-violet/20 bg-oe-aurora-violet/5 px-5 py-8 sm:px-8 sm:py-10 md:px-12 space-y-7"
              >
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                  <InputField
                    label="Name"
                    id="name"
                    value={form.name}
                    onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                    placeholder="Dein Name"
                    required
                  />
                  <InputField
                    label="E-Mail"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    placeholder="deine@email.de"
                    required
                  />
                </div>

                <SelectField
                  label="Betreff"
                  id="subject"
                  value={form.subject}
                  onChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                  options={subjects}
                />

                <TextareaField
                  label="Nachricht"
                  id="message"
                  value={form.message}
                  onChange={(v) => setForm((f) => ({ ...f, message: v }))}
                  placeholder="Was liegt dir auf dem Herzen?"
                  required
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <p className="text-xs text-oe-pure-light/30">
                    Felder mit{" "}
                    <span className="text-oe-solar-gold">*</span> sind
                    Pflichtfelder.
                  </p>
                  <motion.button
                    type="submit"
                    disabled={state === "submitting"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-oe-aurora-violet/20 border border-oe-aurora-violet/40 text-sm font-semibold text-oe-pure-light hover:bg-oe-aurora-violet/35 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {state === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full border-2 border-oe-pure-light/60 border-t-transparent animate-spin" />
                        Sende…
                      </span>
                    ) : (
                      "Nachricht senden"
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact info strip */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-10 text-center"
          >
            {[
              { label: "E-Mail", value: "hello@oneemergence.com" },
              { label: "Antwortzeit", value: "max. 48 Stunden" },
              { label: "Sprachen", value: "Deutsch · English" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet mb-1">
                  {item.label}
                </p>
                <p className="text-sm text-oe-pure-light/60">{item.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
