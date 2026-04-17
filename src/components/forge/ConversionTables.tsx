import { getForgeRates, getAutoForgeRates } from "@/lib/utils/forgeHelpers";
import { RateTable } from "@/components/forge/RateTable";
import type { ConversionTablesProps } from "@/types/components/forge";

export function ConversionTables({ thLevel, bhLevel, autoForgeUnlocked }: ConversionTablesProps) {
  return (
    <div className="flex flex-col gap-4">
      <RateTable title="Forge Rates" rates={getForgeRates(thLevel, bhLevel)} />
      {autoForgeUnlocked && (
        <RateTable title="Auto Forge Rates" rates={getAutoForgeRates(thLevel, bhLevel)} />
      )}
    </div>
  );
}
