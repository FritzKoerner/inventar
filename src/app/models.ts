import { RecordModel } from 'pocketbase';

// Mirrors the collections in backend/pb_migrations. Dates are PocketBase date strings
// ("2026-10-11 08:00:00.000Z"); empty relations, files and dates are "".

export interface Category extends RecordModel {
  name: string;
}

// Not "Location", which would shadow the DOM's global Location type.
export interface StorageLocation extends RecordModel {
  name: string;
}

export interface Item extends RecordModel {
  name: string;
  quantity: number;
  quantity_broken: number;
  description: string;
  location: string;
  category: string;
  picture: string;
  archived: boolean;
  expand?: {
    location?: StorageLocation;
    category?: Category;
  };
}

export interface ItemDraft {
  name: string;
  quantity: number;
  quantity_broken?: number;
  description?: string;
  location?: string;
  category?: string;
  picture?: File | null;
}

export interface ItemAvailability extends RecordModel {
  quantity: number;
  quantity_broken: number;
  rented: number;
  available: number;
}

export interface Rental extends RecordModel {
  borrower: string;
  contact: string;
  start_date: string;
  due_date: string;
  note: string;
  created_by: string;
  expand?: {
    rental_items_via_rental?: RentalItem[];
  };
}

export interface RentalDraft {
  borrower: string;
  contact?: string;
  start_date: string;
  due_date?: string;
  note?: string;
}

export interface RentalWithStatus extends Rental {
  outstanding: number;
}

export interface RentalItem extends RecordModel {
  rental: string;
  item: string;
  quantity: number;
  returned_quantity: number;
  returned_at: string;
  expand?: {
    item?: Item;
  };
}

export interface RentalLineDraft {
  item: string;
  quantity: number;
}

export interface RentalStatus extends RecordModel {
  outstanding: number;
  last_returned_at: string;
}
