import {Component, inject, OnInit, signal} from '@angular/core';
import {ItemService} from './services/item.service';
import {Item} from './models';
import {AsyncPipe, DecimalPipe, JsonPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    DecimalPipe,
    FormsModule
  ],
  styleUrl: './app.css'
})
export class App implements OnInit {
  // what does | null = null?
  inventory = signal<Item[]>([])
  search = ""
  private itemService = inject(ItemService)

  tableHeaders = ['Name', 'Anzahl', 'Beschreibung', 'Lagerort', 'Kategorie']


  getInventory() {
    this.itemService.list().then(items => {
      this.inventory.set(items)
    })
  }

  updateTable(searchString: string) {
    const queryTableItems = "table tr.table-items"
    if (searchString.length < 3) {
      document.querySelectorAll(queryTableItems).forEach(item => {
        item.classList.remove('hidden')

      })
    } else {
      document.querySelectorAll(queryTableItems).forEach(item => {
        if (!item.innerHTML.includes(searchString)) {
          item.classList.add('hidden')
        } else {
          item.classList.remove('hidden')
        }
      })
    }
  }

  ngOnInit() {
    this.getInventory();
    console.log('getInventory');
    console.log(this.inventory)
  }
}
