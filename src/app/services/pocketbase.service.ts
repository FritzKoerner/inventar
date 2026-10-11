import {Injectable} from '@angular/core';
import Pocketbase from 'pocketbase';
import {environment} from '../../environments/environment';

// One client for the whole app: the auth token lives in its authStore, so every service
// must share this instance instead of creating its own.
@Injectable({
  providedIn: 'root',
})
export class PocketbaseService {
  readonly pb = new Pocketbase(environment.pocketbaseUrl);
}
