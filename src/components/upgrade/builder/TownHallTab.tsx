"use client";

import { UpgradeRow } from "@/components/upgrade/UpgradeRow";
import {
  getTownHallUpgradeStep,
  getTownHallWeaponInfo,
  getTownHallWeaponUpgradeSteps,
  getTownHallImageUrl,
  getTownHallMaxLevel,
} from "@/lib/utils/upgradeHelpers";
import {
  startTownHallUpgrade,
  finishTownHallUpgrade,
  cancelTownHallUpgrade,
  adjustTownHallUpgrade,
  startTownHallWeaponUpgrade,
  finishTownHallWeaponUpgrade,
  cancelTownHallWeaponUpgrade,
  adjustTownHallWeaponUpgrade,
} from "@/lib/utils/upgradeActions";
import type { HomeVillageData } from "@/types/app/game";
import type { BuilderSlot } from "@/types/app/upgrade";

interface Props {
  hv: HomeVillageData;
  thLevel: number;
  slots: BuilderSlot[];
  onSave: (newHv: HomeVillageData) => void;
}

export function TownHallTab({ hv, thLevel, slots, onSave }: Props) {
  const maxTH = getTownHallMaxLevel();
  const thImageUrl = getTownHallImageUrl(thLevel);
  const nextStep = thLevel < maxTH ? getTownHallUpgradeStep(thLevel) : null;
  const weaponInfo = getTownHallWeaponInfo(thLevel);
  const weaponLevel = hv.townHallWeaponLevel ?? (thLevel === 17 ? 1 : 0);

  return (
    <div className="flex flex-col gap-2">
      {/* TH weapon upgrade — only for THs with upgradeable weapons (currently TH17) */}
      {weaponInfo && weaponLevel < weaponInfo.maxLevel && (
        <UpgradeRow
          name={`${weaponInfo.name} (TH${thLevel})`}
          imageUrl={weaponInfo.imageUrl}
          instances={[{
            currentLevel: weaponLevel,
            maxLevel: weaponInfo.maxLevel,
            upgradeState: hv.townHallWeaponUpgrade,
          }]}
          getAllSteps={() => getTownHallWeaponUpgradeSteps(thLevel, weaponLevel)}
          slots={slots}
          onStartUpgrade={(_idx, step, builderId) =>
            onSave(startTownHallWeaponUpgrade(hv, step, builderId))
          }
          onFinishUpgrade={() => onSave(finishTownHallWeaponUpgrade(hv))}
          onCancelUpgrade={() => onSave(cancelTownHallWeaponUpgrade(hv))}
          onAdjustUpgrade={(_idx, finishesAt) =>
            onSave(adjustTownHallWeaponUpgrade(hv, finishesAt))
          }
        />
      )}

      {/* TH upgrade to next level */}
      {nextStep && (
        <UpgradeRow
          name={`Town Hall ${thLevel + 1}`}
          imageUrl={getTownHallImageUrl(thLevel + 1) || thImageUrl}
          instances={[{
            currentLevel: thLevel,
            maxLevel: maxTH,
            upgradeState: hv.townHallUpgrade,
          }]}
          getAllSteps={() => (nextStep ? [nextStep] : [])}
          slots={slots}
          onStartUpgrade={(_idx, step, builderId) =>
            onSave(startTownHallUpgrade(hv, step, builderId))
          }
          onFinishUpgrade={() => onSave(finishTownHallUpgrade(hv))}
          onCancelUpgrade={() => onSave(cancelTownHallUpgrade(hv))}
          onAdjustUpgrade={(_idx, finishesAt) =>
            onSave(adjustTownHallUpgrade(hv, finishesAt))
          }
        />
      )}

      {/* Max TH reached */}
      {thLevel >= maxTH && !weaponInfo && (
        <p className="py-8 text-center text-sm text-white/80">
          Town Hall {thLevel} is the maximum level.
        </p>
      )}

      {/* TH17 at max weapon, max TH */}
      {thLevel >= maxTH && weaponInfo && weaponLevel >= weaponInfo.maxLevel && (
        <p className="py-8 text-center text-sm text-white/80">
          All Town Hall upgrades are complete.
        </p>
      )}
    </div>
  );
}
