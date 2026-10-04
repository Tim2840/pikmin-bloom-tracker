export type ItemType = 'postcard' | 'mushroom';
export type ActionType = 'sent' | 'received' | 'helped';

export interface Person {
  id: string;
  name: string;
  nickname?: string;
  color?: string;
  country?: string; // ISO 3166-1 alpha-2
  icon?: string;
  sortOrder: number;
  createdAt: string;
}

export interface RecordItem {
  id: string;
  personId: string | null;
  personNameSnapshot: string;
  date: string; // YYYY-MM-DD
  itemType: ItemType;
  actionType: ActionType;
  note?: string;
  createdAt: string;
}

export interface RecordFormValues {
  personId: string;
  personNameSnapshot: string;
  date: string;
  itemType: ItemType;
  actionType: ActionType;
  note?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  personId: string;
  itemType: ItemType;
  actionType: ActionType;
  useToday: boolean;
  sortOrder: number;
  createdAt: string;
}
