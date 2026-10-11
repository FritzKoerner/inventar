import {inject, Injectable} from '@angular/core';
import {PocketbaseService} from './pocketbase.service';
import {ClientResponseError} from 'pocketbase';
import {Item, ItemAvailability, ItemDraft} from '../models';
import {newRecordId} from './record-id';
import {unwrapBatchError} from './batch-error';

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

  // newLookups holds names of categories/locations to create along with the item. They go
  // into the same batch (one transaction), so a rejected item doesn't leave them behind.
  // On failure the error's data is keyed by item field; a failed new category/location is
  // reported under "category"/"location".
  async create(draft: ItemDraft, newLookups: {category?: string; location?: string} = {}) {
    const batch = this.pb.createBatch();
    const item = {...draft};
    const requestFields: string[] = [];
    for (const [field, collection] of [['category', 'categories'], ['location', 'locations']] as const) {
      const name = newLookups[field];
      if (name) {
        item[field] = newRecordId();
        batch.collection(collection).create({id: item[field], name});
        requestFields.push(field);
      }
    }
    // The SDK sends multipart form data automatically when the body contains a File.
    batch.collection('items').create(item);

    try {
      const results = await batch.send();
      return results[results.length - 1].body as Item;
    } catch (err) {
      const failed = unwrapBatchError(err);
      if (!failed) {
        throw err;
      }
      const lookupField = requestFields[failed.index];
      if (lookupField === undefined) {
        throw failed.error;
      }
      throw new ClientResponseError({
        status: failed.error.status,
        response: {
          message: failed.error.message,
          data: {[lookupField]: failed.error.response['data']?.name},
        },
      });
    }
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
