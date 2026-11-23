import { ListSummaryData, ListDetailData, ListItemData } from '../../../services/listsServices';
import { ListGroup, ListItemEntry, ListType } from './types';
import { LIST_TYPE_CONFIG } from './mockData';

export const mapBackendListTypeToUi = (typeStr?: string): ListType => {
  if (!typeStr) return 'grocery';
  const norm = typeStr.toLowerCase().trim();
  if (norm.includes('grocer')) return 'grocery';
  if (norm.includes('pack')) return 'packing';
  if (norm.includes('school')) return 'school';
  if (norm.includes('party')) return 'party';
  return 'custom';
};

export const mapUiListTypeToBackend = (
  type: ListType
): 'GROCERY' | 'PACKING' | 'SCHOOL' | 'PARTY' | 'CUSTOM' => {
  switch (type) {
    case 'grocery':
      return 'GROCERY';
    case 'packing':
      return 'PACKING';
    case 'school':
      return 'SCHOOL';
    case 'party':
      return 'PARTY';
    case 'custom':
    default:
      return 'CUSTOM';
  }
};

export const mapApiListItemToUiEntry = (item: ListItemData): ListItemEntry => {
  const memberName = item.assignedTo?.fullName || undefined;
  const initial = memberName
    ? (memberName.trim()[0] || 'M').toUpperCase()
    : undefined;

  return {
    id: item.id,
    title: item.name,
    quantity: item.note || undefined,
    isCompleted: item.done,
    assignedTo: memberName,
    assignedInitial: initial,
    assignedAvatarBg: item.assignedTo?.avatarColor || undefined,
  };
};

export const mapApiListSummaryToUiList = (
  summary: ListSummaryData,
  existingItems?: ListItemEntry[]
): ListGroup => {
  const uiType = mapBackendListTypeToUi(summary.type);
  const config = LIST_TYPE_CONFIG[uiType] || LIST_TYPE_CONFIG.custom;

  // Synthesize items from summary counts if items not provided
  let items: ListItemEntry[] = existingItems || [];
  if (items.length === 0 && summary.counts && summary.counts.total > 0) {
    const leftCount = summary.counts.left ?? summary.counts.total;
    const doneCount = summary.counts.done ?? 0;
    const synth: ListItemEntry[] = [];
    for (let i = 0; i < leftCount; i++) {
      synth.push({
        id: `synth-${summary.id}-left-${i}`,
        title: `Item ${i + 1}`,
        isCompleted: false,
      });
    }
    for (let i = 0; i < doneCount; i++) {
      synth.push({
        id: `synth-${summary.id}-done-${i}`,
        title: `Done Item ${i + 1}`,
        isCompleted: true,
      });
    }
    items = synth;
  }

  return {
    id: summary.id,
    title: summary.name,
    type: uiType,
    typeLabel: config.label,
    items,
    sharedWith: (summary.members || []).map((m) => m.fullName || 'Member'),
    isSharedWithAll: summary.sharedWithAll ?? true,
    isArchived: Boolean(summary.archivedAt),
  };
};

export const mapApiListDetailToUiList = (detail: ListDetailData): ListGroup => {
  const toBuyEntries = (detail.items?.toBuy || []).map(mapApiListItemToUiEntry);
  const doneEntries = (detail.items?.done || []).map(mapApiListItemToUiEntry);
  const uiType = mapBackendListTypeToUi(detail.type);
  const config = LIST_TYPE_CONFIG[uiType] || LIST_TYPE_CONFIG.custom;

  return {
    id: detail.id,
    title: detail.name,
    type: uiType,
    typeLabel: config.label,
    items: [...toBuyEntries, ...doneEntries],
    sharedWith: (detail.members || []).map((m) => m.fullName || 'Member'),
    isSharedWithAll: detail.sharedWithAll ?? true,
    isArchived: Boolean(detail.archivedAt),
  };
};
