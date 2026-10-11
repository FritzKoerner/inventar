import { Routes } from '@angular/router';
import { InventoryPage } from './pages/inventory/inventory-page';
import { ItemFormPage } from './pages/item-form/item-form-page';

export const routes: Routes = [
  { path: '', component: InventoryPage, title: 'Inventar' },
  { path: 'hinzufuegen', component: ItemFormPage, title: 'Hinzufügen · Inventar' },
  { path: '**', redirectTo: '' },
];
