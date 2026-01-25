// File: src/app/[locale]/not-found.tsx
import ErrorState from "@/components/ui/ErrorState";

export default function NotFound() {
   return (
      // mt-20 agar tidak tertutup navbar fixed
      <div className="container mx-auto px-4 mt-20">
         <ErrorState
            isNotFound={true}
            title="Halaman Tidak Ditemukan"
            description="Sepertinya Anda tersesat. Halaman yang Anda cari mungkin sudah dihapus, dipindahkan, atau tautan yang Anda tuju salah."
         />
      </div>
   );
}