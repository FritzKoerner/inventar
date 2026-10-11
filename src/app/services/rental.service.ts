import {inject, Injectable} from '@angular/core';
import {PocketbaseService} from './pocketbase.service';
import {
  Rental,
  RentalDraft,
  RentalItem,
  RentalLineDraft,
  RentalStatus,
  RentalWithStatus,
} from '../models';
import {newRecordId} from './record-id';

@Injectable({
  providedIn: 'root',
})
export class RentalService {
  private pb = inject(PocketbaseService).pb;
  private rentals = this.pb.collection<Rental>('rentals');

  // Merged client-side: a view can't be expanded from rentals, and the list stays small.
  async list(): Promise<RentalWithStatus[]> {
    const [rentals, statuses] = await Promise.all([
      this.rentals.getFullList({sort: '-start_date'}),
      this.pb.collection<RentalStatus>('rental_status').getFullList(),
    ]);
    const outstanding = new Map(statuses.map((s) => [s.id, s.outstanding]));
    return rentals.map((r) => ({...r, outstanding: outstanding.get(r.id) ?? 0}));
  }

  get(id: string) {
    return this.rentals.getOne(id, {expand: 'rental_items_via_rental.item'});
  }

  // One transaction: if any line fails validation (e.g. not enough available),
  // nothing is saved.
  async create(draft: RentalDraft, lines: RentalLineDraft[]) {
    const id = newRecordId();
    const user = this.pb.authStore.record;
    const batch = this.pb.createBatch();
    batch.collection('rentals').create({
      ...draft,
      id,
      // created_by points to users; the dev superuser isn't one.
      created_by: user?.collectionName === 'users' ? user.id : '',
    });
    for (const line of lines) {
      batch.collection('rental_items').create({...line, rental: id});
    }
    await batch.send();
    return this.get(id);
  }

  // returned_quantity is the running total per line, not the amount returned this time.
  async returnItems(returns: {rentalItemId: string; returnedQuantity: number}[]) {
    const now = new Date().toISOString();
    const batch = this.pb.createBatch();
    for (const r of returns) {
      batch.collection('rental_items').update(r.rentalItemId, {
        returned_quantity: r.returnedQuantity,
        returned_at: now,
      });
    }
    const results = await batch.send();
    return results.map((r) => r.body as RentalItem);
  }
}
