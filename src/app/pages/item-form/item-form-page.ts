import {Component, DestroyRef, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ClientResponseError} from 'pocketbase';
import {ItemService} from '../../services/item.service';
import {LookupService} from '../../services/lookup.service';
import {Category, Item, StorageLocation} from '../../models';
import {brokenWithinQuantity, imageFile, integer, notBlank, uniqueName} from '../../validators';

// Select value for "create a new category/location".
const NEW = '__new__';
const PICTURE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PICTURE_MAX_BYTES = 5 * 1024 * 1024;

const errorMessages: Record<string, (params: any) => string> = {
  required: () => 'Pflichtfeld.',
  blank: () => 'Darf nicht nur aus Leerzeichen bestehen.',
  maxlength: (p) => `Höchstens ${p.requiredLength} Zeichen.`,
  min: (p) => `Mindestens ${p.min}.`,
  integer: () => 'Nur ganze Zahlen.',
  brokenAboveQuantity: () => 'Nicht mehr als die Anzahl.',
  duplicate: () => 'Existiert bereits.',
  fileType: () => 'Nur JPEG, PNG oder WebP.',
  fileSize: () => 'Höchstens 5 MB.',
  server: (message) => message,
};

// PocketBase's own field messages are English; translate the ones the form can trigger.
const serverMessages: Record<string, string> = {
  validation_not_unique: 'Existiert bereits.',
  validation_required: 'Pflichtfeld.',
};

@Component({
  selector: 'app-item-form-page',
  templateUrl: './item-form-page.html',
  imports: [ReactiveFormsModule],
  styleUrl: './item-form-page.css',
})
export class ItemFormPage implements OnInit {
  private itemService = inject(ItemService);
  private lookupService = inject(LookupService);
  private destroyRef = inject(DestroyRef);
  private nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  private pictureInput = viewChild.required<ElementRef<HTMLInputElement>>('pictureInput');

  readonly NEW = NEW;
  readonly pictureTypes = PICTURE_TYPES.join(',');

  categories = signal<Category[]>([]);
  locations = signal<StorageLocation[]>([]);
  submitted = signal(false);
  saving = signal(false);
  savedName = signal('');
  serverError = signal('');
  picturePreview = signal('');

  form = new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notBlank, Validators.maxLength(200)],
      }),
      // nonNullable so reset() restores these defaults instead of null.
      quantity: new FormControl<number | null>(1, {
        nonNullable: true,
        validators: [Validators.required, integer, Validators.min(1)],
      }),
      quantity_broken: new FormControl<number | null>(0, {
        nonNullable: true,
        validators: [Validators.required, integer, Validators.min(0)],
      }),
      description: new FormControl('', {nonNullable: true, validators: [Validators.maxLength(2000)]}),
      location: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      newLocation: new FormControl(
        {value: '', disabled: true},
        {
          nonNullable: true,
          validators: [Validators.required, notBlank, Validators.maxLength(100), uniqueName(this.locations)],
        },
      ),
      category: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      newCategory: new FormControl(
        {value: '', disabled: true},
        {
          nonNullable: true,
          validators: [Validators.required, notBlank, Validators.maxLength(100), uniqueName(this.categories)],
        },
      ),
      picture: new FormControl<File | null>(null, [imageFile(PICTURE_TYPES, PICTURE_MAX_BYTES)]),
    },
    {validators: brokenWithinQuantity},
  );

  constructor() {
    // The "new" text field only exists (and is only validated) while "Neu…" is selected.
    for (const [select, input] of [['location', 'newLocation'], ['category', 'newCategory']] as const) {
      this.form.controls[select].valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
        const control = this.form.controls[input];
        value === NEW ? control.enable() : control.disable();
      });
    }
    this.destroyRef.onDestroy(() => URL.revokeObjectURL(this.picturePreview()));
  }

  async ngOnInit() {
    try {
      await this.loadLookups();
    } catch {
      this.serverError.set('Lagerorte und Kategorien konnten nicht geladen werden.');
    }
  }

  // Message for the first error of a field, once the user has touched it or tried to save.
  error(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (!control.touched && !this.submitted()) {
      return '';
    }
    const errors =
      name === 'quantity_broken' && this.form.hasError('brokenAboveQuantity')
        ? {...control.errors, brokenAboveQuantity: true}
        : control.errors;
    const [key, params] = Object.entries(errors ?? {})[0] ?? [];
    return key ? (errorMessages[key]?.(params) ?? 'Ungültiger Wert.') : '';
  }

  onPictureChange() {
    const file = this.pictureInput().nativeElement.files?.[0] ?? null;
    const control = this.form.controls.picture;
    control.setValue(file);
    control.markAsTouched();
    URL.revokeObjectURL(this.picturePreview());
    this.picturePreview.set(file && control.valid ? URL.createObjectURL(file) : '');
  }

  removePicture() {
    this.pictureInput().nativeElement.value = '';
    this.onPictureChange();
  }

  async save() {
    this.submitted.set(true);
    this.savedName.set('');
    this.serverError.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const v = this.form.getRawValue();
    const newCategory = v.category === NEW ? v.newCategory.trim() : undefined;
    const newLocation = v.location === NEW ? v.newLocation.trim() : undefined;
    this.saving.set(true);
    try {
      const item = await this.itemService.create(
        {
          name: v.name.trim(),
          quantity: v.quantity!,
          quantity_broken: v.quantity_broken!,
          description: v.description.trim(),
          category: newCategory ? '' : v.category,
          location: newLocation ? '' : v.location,
          picture: v.picture,
        },
        {category: newCategory, location: newLocation},
      );
      if (newCategory || newLocation) {
        await this.loadLookups();
      }
      this.savedName.set(item.name);
      this.resetForNextItem(item);
    } catch (err) {
      this.showServerError(err);
    } finally {
      this.saving.set(false);
    }
  }

  private async loadLookups() {
    const [locations, categories] = await Promise.all([
      this.lookupService.list('locations'),
      this.lookupService.list('categories'),
    ]);
    this.locations.set(locations);
    this.categories.set(categories);
  }

  // Keeps location and category: items are usually entered shelf by shelf.
  private resetForNextItem(item: Item) {
    this.form.reset({location: item.location, category: item.category});
    this.submitted.set(false);
    this.removePicture();
    this.form.controls.picture.markAsUntouched();
    this.nameInput().nativeElement.focus();
  }

  private showServerError(err: unknown) {
    if (!(err instanceof ClientResponseError) || err.status === 0) {
      this.serverError.set('Keine Verbindung zum Server. Bitte später erneut versuchen.');
      return;
    }
    const fields: Record<string, {code: string; message: string}> = err.response['data'] ?? {};
    for (const [field, fieldError] of Object.entries(fields)) {
      const name = this.controlForServerField(field);
      if (name && fieldError) {
        this.form.controls[name].setErrors({
          server: serverMessages[fieldError.code] ?? fieldError.message,
        });
      }
    }
    // Hook errors carry a German message and no field data; field errors are shown inline.
    this.serverError.set(
      Object.keys(fields).length ? 'Bitte die markierten Felder prüfen.' : err.message,
    );
  }

  private controlForServerField(field: string): keyof typeof this.form.controls | null {
    if (field === 'category' || field === 'location') {
      const select = this.form.controls[field];
      return select.value === NEW ? (field === 'category' ? 'newCategory' : 'newLocation') : field;
    }
    return field in this.form.controls ? (field as keyof typeof this.form.controls) : null;
  }
}
