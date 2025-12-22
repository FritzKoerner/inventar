import {Injectable} from '@angular/core';
import Pocketbase from 'pocketbase';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PocketbaseService {
  private urlPocketbase: string = 'http://127.0.0.1:8090/'
  async getInventory() {
    const pb = new Pocketbase(this.urlPocketbase)

    const userCollection = environment.production?  'users' : '_superusers'

    await pb.collection(userCollection).authWithPassword(environment.pocketbaseSuperuser, environment.pocketbasePassword,
    );
    return pb.collection('items').getList(1, 25, {
      expand: 'category_id'
    });
  }
}
