import {Component, inject, OnInit, signal} from '@angular/core';
import {PocketbaseService} from './services/pocketbase.service';
import {ListResult, RecordModel} from 'pocketbase';
import {AsyncPipe, DecimalPipe, JsonPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    JsonPipe,
    DecimalPipe,
    FormsModule
  ],
  styleUrl: './app.css'
})
export class App implements OnInit {
  // what does | null = null?
  inventory = signal<RecordModel[]>([])
  search = ""
  private pocketbaseService = inject(PocketbaseService)

  tableHeaders = ['Name', 'Anzahl', 'Beschreibung', 'Lagerort', 'Kategorie']


  getInventory() {
    this.pocketbaseService.getInventory().then(result => {
      this.inventory.set(result.items)
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
