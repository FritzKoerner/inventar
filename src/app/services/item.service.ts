import {inject, Injectable} from '@angular/core';
import {PocketbaseService} from './pocketbase.service';
import {Item, ItemAvailability, ItemDraft} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private pb = inject(PocketbaseService).pb;
  private items = this.pb.collection<Item>('items');

  list() {
    return this.items.getFullList({
      filter: 'archived = false',
      expand: 'category,location',
      sort: 'name',
    });
  }

  get(id: string) {
    return this.items.getOne(id, {expand: 'category,location'});
  }

  // The SDK sends multipart form data automatically when the body contains a File.
  create(draft: ItemDraft) {
    return this.items.create(draft, {expand: 'category,location'});
  }

  // Pass picture: null to remove the current picture.
  update(id: string, changes: Partial<ItemDraft>) {
    return this.items.update(id, changes, {expand: 'category,location'});
  }

  // Items are never deleted (see deleteRule in the schema), only hidden.
  archive(id: string) {
    return this.items.update(id, {archived: true});
  }

  availability() {
    return this.pb.collection<ItemAvailability>('item_availability').getFullList();
  }

  availabilityOf(itemId: string) {
    return this.pb.collection<ItemAvailability>('item_availability').getOne(itemId);
  }

  pictureUrl(item: Item, thumb?: '100x100' | '400x0') {
    return item.picture ? this.pb.files.getURL(item, item.picture, {thumb}) : '';
  }
}
