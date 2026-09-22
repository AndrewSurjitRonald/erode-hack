import { IconGraduationCap } from "@/lib/icons";
import { PRODUCT_NAME } from "@/lib/brand";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-lg shadow-xs ${
          light ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}
      >
        <IconGraduationCap className="w-5 h-5" />
      </span>
      <span
        className={`font-extrabold text-xl tracking-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {PRODUCT_NAME}
      </span>
    </div>
  );
}
