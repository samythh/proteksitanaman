import Link from "next/link";

interface StaffFilterProps {
  currentCategory: string;
  locale: string;
}

export default function StaffFilter({
  currentCategory,
  locale,
}: StaffFilterProps) {
  // Helper styling tombol
  const getButtonStyle = (category: string) => {
    const isActive = currentCategory === category;
    return `
      px-6 py-2.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 border
      ${
        isActive
          ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105"
          : "bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600"
      }
    `;
  };

  return (
    <div className="flex justify-center items-center gap-4 mb-10">
      <Link
        href={`/${locale}/profil/staf/akademik`}
        className={getButtonStyle("akademik")}
        scroll={false}
      >
        Staf Akademik
      </Link>

      <Link
        href={`/${locale}/profil/staf/administrasi`}
        className={getButtonStyle("administrasi")}
        scroll={false}
      >
        Staf Administrasi
      </Link>
    </div>
  );
}
