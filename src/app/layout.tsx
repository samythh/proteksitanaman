// File: src/app/layout.tsx
import { ReactNode } from "react";

// Tipe props yang eksplisit
type Props = {
  children: ReactNode;
};

// Root Layout ini bertugas sebagai "Shell" atau pembungkus luar.
// Karena kita menggunakan i18n, pengaturan HTML dan BODY akan dipindah 
// ke dalam folder [locale]/layout.tsx.
export default function RootLayout({ children }: Props) {
  return children;
}