import Image from "next/image";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { RESOURCE_META } from "@/lib/utils/forgeHelpers";
import type { RateTableProps } from "@/types/components/forge";

export const RateTable = ({ title, rates }: RateTableProps) => {
  return (
    <div className="rounded-xl border border-secondary/80 bg-primary overflow-hidden">
      <div className="px-4 py-3 border-b border-secondary/80">
        <h3 className="text-sm font-extrabold text-white">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-secondary/80">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-accent">
                Resource
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-accent">
                Cost
              </th>
              <th className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end">
                  <div className="relative h-4 w-4">
                    <Image
                      src={toPublicImageUrl("images/other/gold-c.png")}
                      alt="Capital Gold"
                      fill
                      sizes="16px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => {
              const meta = RESOURCE_META[rate.resourceType];
              return (
                <tr
                  key={rate.resourceType}
                  className={`border-b border-secondary/80 last:border-0 ${rate.available ? "" : "opacity-40"}`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="relative h-5 w-5 shrink-0">
                        <Image
                          src={toPublicImageUrl(meta.image)}
                          alt={meta.label}
                          fill
                          sizes="20px"
                          className={`object-contain${rate.available ? "" : " grayscale"}`}
                        />
                      </div>
                      <span className="text-white/80">{meta.label}</span>
                      {!rate.available && rate.requiresTH && (
                        <span className="text-[10px] text-white/80">(TH{rate.requiresTH}+)</span>
                      )}
                      {!rate.available && rate.requiresBH && (
                        <span className="text-[10px] text-white/80">(BH{rate.requiresBH}+)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-white/80">
                    {rate.available && rate.cost > 0
                      ? rate.cost >= 1_000_000
                        ? `${(rate.cost / 1_000_000).toFixed(1)}M`
                        : rate.cost.toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {rate.available && rate.capitalGold > 0 ? (
                      <span className="font-bold text-accent">{rate.capitalGold.toLocaleString()}</span>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
