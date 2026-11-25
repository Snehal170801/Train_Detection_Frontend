// client/src/components/assets/detail/AssetPhysicalInfo.jsx

import { AssetInfoCard, DetailRow, IconSvg } from "./AssetInfoCard";
import AssetConditionBadge from "../AssetConditionBadge";
import AssetStatusBadge from "../AssetStatusBadge";

export default function AssetPhysicalInfo({ asset }) {
  return (
    <AssetInfoCard
      title="Physical Details"
      icon={
        <IconSvg d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      }
    >
      <DetailRow idx={0} label="Status" value={<AssetStatusBadge status={asset.status} />} />
      <DetailRow idx={1} label="Condition" value={<AssetConditionBadge condition={asset.condition} />} />
      <DetailRow idx={2} label="Serial Number" value={asset.serial_number} />
      <DetailRow idx={3} label="Model Number" value={asset.model_number} />
      <DetailRow idx={4} label="Brand" value={asset.brand} />
      <DetailRow idx={5} label="Color" value={asset.color} />
    </AssetInfoCard>
  );
}
