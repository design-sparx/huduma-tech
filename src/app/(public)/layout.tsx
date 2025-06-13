import { PublicLayout } from "@/layouts/public";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "HudumaTech - Kenya's Premier Service Platform",
  description:
    "Find verified electricians, plumbers, mechanics, and more across Kenya",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
