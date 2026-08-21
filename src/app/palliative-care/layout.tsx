import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aegis Care OS | Shift-Handover, PRN Safety & Comfort Management",
  description: "High-safety, offline-first multi-carer shift handover and care coordination platform for families managing palliative care, post-op rehab, shared pets, and joint custody.",
  keywords: [
    "Palliative Care Shift Handover",
    "PRN Medication Safety",
    "Carer Handover App",
    "SBAR Clinical Handover",
    "Shared Pet Care",
    "Joint Custody Handover",
    "Care OS"
  ],
  openGraph: {
    title: "Aegis Care OS | Multi-Carer Shift Handover & Comfort OS",
    description: "5-second rapid bedside logging, PRN medication interval lockout watchdog, and automated audio SBAR shift handovers.",
    type: "website",
  },
};

export default function PalliativeCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
