import { IconGraduationCap } from "@/lib/icons";
import { PRODUCT_NAME } from "@/lib/brand";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-lg ${
          light ? "bg-white/10 text-accent" : "bg-primary/10 text-primary"
        }`}
      >
        <IconGraduationCap className="w-5 h-5" />
      </span>
      <span className={`font-extrabold text-lg tracking-tight ${light ? "text-white" : "text-dark"}`}>
        {PRODUCT_NAME}
      </span>
    </div>
  );
}
