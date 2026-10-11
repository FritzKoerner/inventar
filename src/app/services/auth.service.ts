import {computed, inject, Injectable, signal} from '@angular/core';
import {AuthRecord} from 'pocketbase';
import {PocketbaseService} from './pocketbase.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private pb = inject(PocketbaseService).pb;

  readonly user = signal<AuthRecord>(this.pb.authStore.record);
  readonly isLoggedIn = computed(() => this.user() !== null);

  constructor() {
    this.pb.authStore.onChange((_token, record) => this.user.set(record));
  }

  login(email: string, password: string) {
    return this.pb.collection('users').authWithPassword(email, password);
  }

  logout() {
    this.pb.authStore.clear();
  }

  // Stopgap until there is a login page: sign in with the credentials from the environment
  // file so the app has data. `production` picks the collection (users vs. _superusers).
  // Remove together with those credentials.
  async loginFromEnvironment() {
    if (!environment.pocketbaseSuperuser || this.pb.authStore.isValid) {
      return;
    }
    await this.pb
      .collection(environment.production ? 'users' : '_superusers')
      .authWithPassword(environment.pocketbaseSuperuser, environment.pocketbasePassword);
  }
}
