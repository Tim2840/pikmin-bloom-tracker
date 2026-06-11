export type ItemType = 'postcard' | 'mushroom';
export type ActionType = 'sent' | 'received' | 'helped';

export interface Person {
  id: string;
  name: string;
  nickname?: string;
  color?: string;
  createdAt: string;
}

export interface RecordItem {
  id: string;
  personId: string;
  date: string; // YYYY-MM-DD
  itemType: ItemType;
  actionType: ActionType;
  note?: string;
  createdAt: string;
}

export interface QuickAction {
  id: string;
  label: string;
  personId: string;
  itemType: ItemType;
  actionType: ActionType;
  useToday: boolean;
}
