import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Zap, Download, CheckCircle2, User, Shirt } from "lucide-react";
import { toPng } from "html-to-image";

import { appendRegistrationRow } from "@/lib/sheets.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import logoAsset from "@/assets/technosport-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tirupur Runners Training Session — July 19th, 2026" },
      {
        name: "description",
        content:
          "Register for the Tirupur Runners Training Session on Sunday, July 19th, 2026. Timing: 05:45 AM. Category: 5K Community Run.",
      },
      { property: "og:title", content: "Tirupur Runners Training Session" },
      {
        property: "og:description",
        content: "Sunday, July 19th 2026 · 05:45 AM · 5K Community Run. Keep Moving.",
      },
    ],
  }),
  component: Index,
});

const GENDERS = ["Male", "Female", "Other"] as const;
const RACE_LOCATION = "Tirupur";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  age: z.coerce.number().int().min(5, "Must be 5+").max(99),
  gender: z.enum(GENDERS),
});

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
};

const initialState: FormState = {
  full_name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
};

const INPUT_CLASS =
  "h-12 text-base !text-base bg-input/60 border-border focus-visible:ring-2 focus-visible:ring-[var(--ember)] focus-visible:border-[var(--ember)]";
const SELECT_TRIGGER_CLASS =
  "h-12 text-base bg-input/60 border-border data-[state=open]:border-[var(--ember)] focus:ring-2 focus:ring-[var(--ember)]";

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-16" : size === "sm" ? "h-9" : "h-12";
  return (
    <img
      src={logoAsset.url}
      alt="TechnoSport"
      className={`${h} w-auto select-none`}
      draggable={false}
    />
  );
}

function Index() {
  return <Registration />;
}

function Registration() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [pass, setPass] = useState<FormState | null>(null);
  const appendRow = useServerFn(appendRegistrationRow);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the form");
      return;
    }
    setSubmitting(true);

    try {
      await appendRow({
        data: {
          name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          age: parsed.data.age,
          gender: parsed.data.gender,
        },
      });

      setSubmitting(false);
      toast.success("You're in! Entry pass generated.");
      setPass(form);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitting(false);
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not write to the roster sheet. Please try again.",
      );
    }
  };

  if (pass) return <EntryPass data={pass} />;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-16">
      <Toaster theme="dark" position="top-center" richColors />
      <header className="flex flex-col items-center text-center">
        <Logo size="lg" />
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <Zap className="h-3.5 w-3.5" style={{ color: "var(--ember)" }} />
          Tirupur Runners · Community Run
        </div>
        <h1 className="brand-glow mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-white">
          Tirupur Runners Training Session
        </h1>

        {/* Prominent Subtext details */}
        <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-md bg-card/40 border border-border rounded-xl p-3 text-center">
          <div>
            <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">Date</p>
            <p className="text-sm font-semibold text-white mt-0.5">19/07/2026</p>
          </div>
          <div className="border-x border-border">
            <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">Timing</p>
            <p className="text-sm font-semibold text-white mt-0.5">05:45 AM</p>
          </div>
          <div>
            <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">
              Category
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">5K Run</p>
          </div>
        </div>

        <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
          Lace up. Reserve your slot for the Tirupur Runners Training Session. Reporting starts at
          05:15 AM. <span className="text-foreground">Keep Moving.</span>
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-xl sm:p-7 space-y-5">
          <Field label="Full Name">
            <Input
              className={INPUT_CLASS}
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Your name as it appears on the pass"
              maxLength={80}
              autoComplete="name"
              required
            />
          </Field>

          <Field label="Mail ID">
            <Input
              className={INPUT_CLASS}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Enter your email address"
              maxLength={120}
              autoComplete="email"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone Number">
              <Input
                className={INPUT_CLASS}
                type="tel"
                inputMode="numeric"
                pattern="[0-9+\s-]*"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Enter phone number"
                maxLength={20}
                autoComplete="tel"
                required
              />
            </Field>
            <Field label="Age">
              <Input
                className={INPUT_CLASS}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={5}
                max={99}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="Enter age"
                required
              />
            </Field>
          </div>

          <Field label="Gender">
            <SelectRow
              value={form.gender}
              onChange={(v) => update("gender", v)}
              options={[...GENDERS]}
              placeholder="Select Gender"
            />
          </Field>
        </section>

        <Button
          type="submit"
          disabled={submitting}
          className="h-14 w-full text-base font-semibold uppercase tracking-wider"
          style={{
            background: "linear-gradient(135deg, var(--ember), #ff9447)",
            color: "#1a0a00",
            boxShadow: "0 12px 40px -10px rgba(255,122,26,0.55)",
          }}
        >
          {submitting ? "Securing your slot…" : "Confirm Entry"}
        </Button>
      </form>

      <footer className="mt-10 text-center text-xs uppercase tracking-[0.35em] text-muted-foreground">
        Keep Moving
      </footer>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SelectRow({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={SELECT_TRIGGER_CLASS}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="text-base">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Digital Entry Pass ──────────────────────────────────────────────────────
function generateRegistrationId(name: string) {
  const seed = `${name}-${Date.now()}`;
  let h = 5381;
  for (const c of seed) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  const alpha = h.toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return `TR-26-${alpha}`;
}

function Barcode() {
  const bars = useMemo(() => {
    const widths = [
      2, 3, 1, 2, 4, 1, 2, 3, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3,
      1, 2, 4, 1, 3, 2, 1, 3, 2, 4, 1,
    ];
    return widths;
  }, []);
  return (
    <div className="flex h-14 items-end justify-center gap-[3px]">
      {bars.map((w, i) => (
        <span
          key={i}
          className="block h-full rounded-sm"
          style={{ width: `${w}px`, background: i % 7 === 0 ? "var(--ember)" : "#f5f5f5" }}
        />
      ))}
    </div>
  );
}

function EntryPass({ data }: { data: FormState }) {
  const passRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const registrationId = useMemo(() => generateRegistrationId(data.full_name), [data.full_name]);

  const savePassPng = async () => {
    if (!passRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(passRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0a0d12",
        style: { transform: "none" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `TirupurRunners-Pass-${data.full_name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Pass saved. A screenshot works just as well!");
    } catch (err) {
      console.error(err);
      toast.error("Save failed — please take a screenshot instead.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-4 pb-6">
      <Toaster theme="dark" position="top-center" richColors />

      <div className="mb-2 flex items-center justify-center gap-2 text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
        <CheckCircle2 className="h-3 w-3" style={{ color: "var(--ember)" }} />
        <span>Confirmed — screenshot this pass</span>
      </div>

      <div
        ref={passRef}
        className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10"
        style={{
          background: "linear-gradient(160deg, #0e1116 0%, #12161c 55%, #1a0f08 100%)",
          boxShadow:
            "0 30px 60px -20px rgba(255,122,26,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,122,26,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-24 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,122,26,0.18), transparent 70%)" }}
        />

        <div className="relative flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoAsset.url} alt="TechnoSport" className="h-6 w-auto" />
              <span
                className="text-[0.55rem] font-bold uppercase tracking-[0.28em]"
                style={{ color: "var(--ember)" }}
              >
                Entry Pass
              </span>
            </div>
            <div className="text-right">
              <p className="text-[0.5rem] uppercase tracking-[0.25em] text-white/50">Reg ID</p>
              <p className="font-mono text-[0.7rem] font-semibold text-white">{registrationId}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[0.55rem] uppercase tracking-[0.3em] text-white/50">Runner</p>
            <h1 className="mt-1 break-words text-[1.75rem] font-black leading-[1.05] tracking-tight text-white">
              {data.full_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span
                className="rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider"
                style={{
                  background: "var(--ember)",
                  color: "#160800",
                  boxShadow: "0 0 20px rgba(255,122,26,0.45)",
                }}
              >
                5K Run
              </span>
              <span className="text-[0.68rem] uppercase tracking-[0.2em] text-white/60">
                {RACE_LOCATION}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
            <Barcode />
            <p className="mt-2 text-center font-mono text-[0.6rem] tracking-[0.35em] text-white/60">
              {registrationId}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniMeta label="Date" value="Jul 19" sub="Sun · 2026" />
            <MiniMeta label="Flag-Off" value="5:45 AM" sub="Report 5:15" />
            <MiniMeta label="Category" value="5K" sub="Community" />
          </div>

          <div
            className="mt-3 rounded-2xl border p-3"
            style={{
              borderColor: "var(--ember)",
              background: "linear-gradient(135deg, rgba(255,122,26,0.18), rgba(255,122,26,0.05))",
              boxShadow: "0 0 24px rgba(255,122,26,0.25)",
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                style={{ background: "var(--ember)", color: "#160800" }}
              >
                <Shirt className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[0.62rem] font-black uppercase tracking-[0.22em]"
                  style={{ color: "var(--ember)" }}
                >
                  🏃 Training Session
                </p>
                <p className="mt-1 text-[0.72rem] leading-snug text-white/90">
                  Show this pass at the gathering point on{" "}
                  <span className="font-semibold text-white">July 19th, 2026 at 05:15 AM</span> to
                  report and receive your entry clearance.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 text-[0.55rem] uppercase tracking-[0.28em] text-white/45">
            <span>#TR-RUN-2026</span>
            <span style={{ color: "var(--ember)" }}>Keep Moving</span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-center text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
          📸 Take a screenshot now — that's your ticket
        </p>
        <button
          type="button"
          onClick={savePassPng}
          disabled={busy}
          className="mx-auto flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
        >
          <Download className="h-3 w-3" />
          {busy ? "Saving…" : "or save as image"}
        </button>
      </div>
    </main>
  );
}

function MiniMeta({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2 text-center">
      <p className="text-[0.5rem] uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-0.5 text-lg font-black leading-none" style={{ color: "var(--ember)" }}>
        {value}
      </p>
      <p className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-white/50">{sub}</p>
    </div>
  );
}
