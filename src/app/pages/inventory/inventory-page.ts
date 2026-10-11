import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ItemService} from '../../services/item.service';
import {Item} from '../../models';

@Component({
  selector: 'app-inventory-page',
  templateUrl: './inventory-page.html',
  imports: [
    DecimalPipe,
    FormsModule
  ],
  styleUrl: './inventory-page.css'
})
export class InventoryPage implements OnInit {
  // what does | null = null?
  inventory = signal<Item[]>([])
  search = signal('')
  // Matches the visible fields only, case-insensitive.
  filteredInventory = computed(() => {
    const query = this.search().trim().toLowerCase()
    if (!query) {
      return this.inventory()
    }
    return this.inventory().filter(item =>
      [item.name, item.description, item.expand?.location?.name, item.expand?.category?.name]
        .some(field => field?.toLowerCase().includes(query))
    )
  })
  removeError = signal('')
  private itemService = inject(ItemService)

  tableHeaders = ['Name', 'Anzahl', 'Beschreibung', 'Lagerort', 'Kategorie', '']


  getInventory() {
    this.itemService.list().then(items => {
      this.inventory.set(items)
    })
  }

  async remove(item: Item) {
    if (!confirm(`„${item.name}“ wirklich entfernen?`)) {
      return
    }
    this.removeError.set('')
    try {
      await this.itemService.archive(item.id)
      this.inventory.update(items => items.filter(i => i.id !== item.id))
    } catch {
      this.removeError.set(`„${item.name}“ konnte nicht entfernt werden.`)
    }
  }

  ngOnInit() {
    this.getInventory();
    console.log('getInventory');
    console.log(this.inventory)
  }
}
