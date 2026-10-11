import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export const notBlank: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value !== '' && control.value.trim() === ''
    ? {blank: true}
    : null;

// Empty values are left to Validators.required.
export const integer: ValidatorFn = (control) =>
  control.value === null || control.value === '' || Number.isInteger(control.value)
    ? null
    : {integer: true};

export function imageFile(mimeTypes: string[], maxBytes: number): ValidatorFn {
  return (control) => {
    const file: File | null = control.value;
    if (!file) {
      return null;
    }
    if (!mimeTypes.includes(file.type)) {
      return {fileType: true};
    }
    return file.size > maxBytes ? {fileSize: {max: maxBytes}} : null;
  };
}

// Case-insensitive, like the unique indexes on categories and locations.
export function uniqueName(existing: () => {name: string}[]): ValidatorFn {
  return (control) => {
    const name = String(control.value ?? '').trim().toLowerCase();
    return name && existing().some((e) => e.name.toLowerCase() === name) ? {duplicate: true} : null;
  };
}

// Group validator; mirrors the backend hook so the form rejects it before saving.
export function brokenWithinQuantity(group: AbstractControl): ValidationErrors | null {
  const quantity = group.get('quantity')?.value;
  const broken = group.get('quantity_broken')?.value;
  return typeof quantity === 'number' && typeof broken === 'number' && broken > quantity
    ? {brokenAboveQuantity: true}
    : null;
}
