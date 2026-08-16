// Tier for the form field primitives (Base UI Field/Form parts, themed). One barrel like every other
// tier; in a 'use client' file import the component directly instead of this barrel.
export { default as Form } from '@/components/forms/Form';
export { default as Field } from '@/components/forms/Field';
export { default as FieldGroup } from '@/components/forms/FieldGroup';
export { default as FieldLabel } from '@/components/forms/FieldLabel';
export { default as FieldDescription } from '@/components/forms/FieldDescription';
export { default as FieldError } from '@/components/forms/FieldError';
export { default as FieldLegend } from '@/components/forms/FieldLegend';
export { default as FieldSet, FieldSetContext } from '@/components/forms/FieldSet';
export { default as TextInput } from '@/components/forms/TextInput';
export { default as TextArea } from '@/components/forms/TextArea';
export { default as Select } from '@/components/forms/Select';
export { default as Slider } from '@/components/forms/Slider';
export { default as Checkbox } from '@/components/forms/Checkbox';
export { default as CheckboxGroup } from '@/components/forms/CheckboxGroup';
export { default as Radio } from '@/components/forms/Radio';
export { default as RadioGroup } from '@/components/forms/RadioGroup';
export { default as FileUpload } from '@/components/forms/FileUpload';
export { default as NumberField } from '@/components/forms/NumberField';

// Public types consumers need to build typed field data.
export type { FieldValidationMode } from '@/components/forms/Field';
export type { FieldErrorValidity } from '@/components/forms/FieldError';
export type { FieldOrientation } from '@/components/forms/FieldSet';
export type { RadioOption } from '@/components/forms/RadioGroup';
export type { SelectOption, SelectOptionGroup } from '@/components/forms/Select';
