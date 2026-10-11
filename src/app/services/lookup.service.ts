import {inject, Injectable} from '@angular/core';
import {PocketbaseService} from './pocketbase.service';
import {Category, StorageLocation} from '../models';

// Categories and locations have the same shape (just a unique name), so one service
// serves both.
type LookupCollection = 'categories' | 'locations';
type LookupRecord<C extends LookupCollection> = C extends 'categories' ? Category : StorageLocation;

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  private pb = inject(PocketbaseService).pb;

  list<C extends LookupCollection>(collection: C) {
    return this.pb.collection<LookupRecord<C>>(collection).getFullList({sort: 'name'});
  }

  create<C extends LookupCollection>(collection: C, name: string) {
    return this.pb.collection<LookupRecord<C>>(collection).create({name});
  }

  rename<C extends LookupCollection>(collection: C, id: string, name: string) {
    return this.pb.collection<LookupRecord<C>>(collection).update(id, {name});
  }
}
