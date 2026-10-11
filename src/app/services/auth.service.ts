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

  // Stopgap until there is a login page: in development, sign in as the superuser from
  // environment.development.ts so the app has data. Remove together with those credentials.
  async loginFromEnvironment() {
    if (environment.production || this.pb.authStore.isValid) {
      return;
    }
    await this.pb
      .collection('_superusers')
      .authWithPassword(environment.pocketbaseSuperuser, environment.pocketbasePassword);
  }
}
