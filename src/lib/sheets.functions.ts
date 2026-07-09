import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ── Google Sheets config ─────────────────────────────────────────────────────
// Spreadsheet: TechnoSports_Marathon_Registrations_2026
// To switch which tab receives live registrations, set SHEETS_TAB env var to
// "Demo testing", "NewDavangere", or "Mysore Road" (defaults to "Demo testing").
const SPREADSHEET_ID = "1-uRKLxII6jKdclfR5kunARFjp7wBESFsgvE5GhGNLoI";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets";

// Row 1 column order in the Tirupur tab (sequential):
// 1. BIB Number | 2. Full Name | 3. Mail ID (Email) | 4. Phone Number | 5. Age | 6. Gender
// 7. Run Category | 8. T-Shirt Size | 9. Blood Group | 10. Emergency Contact
// 11. Check-in Status | 12. Registration Timestamp

const payloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(4).max(40),
  age: z.union([z.number().int(), z.string()]),
  gender: z.string().trim().max(40),
});

export const appendRegistrationRow = createServerFn({ method: "POST" })
  .inputValidator(payloadSchema)
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY || process.env.GOOGLE_SHEETS_API_KEY;
    const connKey = process.env.GOOGLE_SHEETS_API_KEY || process.env.LOVABLE_API_KEY;
    if (!lovableKey && !connKey) {
      throw new Error("Google Sheets connection is not configured.");
    }

    const sheetTab = process.env.SHEETS_TAB || "Tirupur";
    const range = `'${sheetTab}'!A:L`;

    const url =
      `${GATEWAY}/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    // Timestamp in IST — the event is India-based, so admins read local time.
    const timestamp = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());

    // Sequential structure matching the Tirupur sheet columns exactly:
    const row = [
      "", // BIB Number: leave blank
      data.name, // Full Name: user input
      data.email, // Mail ID (Email): user input
      data.phone, // Phone Number: user input
      String(data.age), // Age: user input
      data.gender, // Gender: user input
      "5K", // Run Category: hardcoded as "5K"
      "NA", // T-Shirt Size: hardcoded as "NA"
      "NA", // Blood Group: hardcoded as "NA"
      "NA", // Emergency Contact: hardcoded as "NA"
      "Pending", // Check-in Status: hardcoded as "Pending"
      timestamp, // Registration Timestamp
    ];

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (lovableKey) {
      headers["Authorization"] = `Bearer ${lovableKey}`;
    }
    if (connKey) {
      headers["X-Connection-Api-Key"] = connKey;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ values: [row] }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Sheets append failed [${response.status}]: ${body}`);
      throw new Error(
        `Google Sheets rejected the row (${response.status}). ` +
          `Confirm the sheet is shared with the connected Google account and the tab "${sheetTab}" exists.`,
      );
    }

    return { ok: true as const, sheet: sheetTab, timestamp };
  });
