import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Bank App",
  description: "Sign in to Bank App",
};

// Login page uses root AuthProvider — no Navbar/Sidebar needed here
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
