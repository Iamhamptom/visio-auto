"use client";

import Link from "next/link";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
  label?: string;
}

/**
 * POPIA-compliant consent checkbox.
 *
 * Required on every public form that collects PII (name, phone, email).
 * We pair this with `consent_version="v1"` and a server-side timestamp +
 * IP capture in the API handler.
 */
export function PopiaConsent({ checked, onChange, className, label }: Props) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className ?? ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/40"
      />
      <span className="text-xs leading-relaxed text-zinc-400">
        {label ?? (
          <>
            I consent to Visio Auto using my contact details to match me with vehicles and to share these details with the
            assigned dealership for follow-up. I understand I can opt out at any time. See our{" "}
            <Link
              href="/legal/popia"
              target="_blank"
              className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300"
            >
              POPIA notice
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/privacy"
              target="_blank"
              className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300"
            >
              privacy policy
            </Link>
            .
          </>
        )}
      </span>
    </label>
  );
}
