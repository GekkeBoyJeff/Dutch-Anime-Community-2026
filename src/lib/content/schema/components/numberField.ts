import { z } from 'zod';

// Localised strings for the NumberField step buttons.
export const NumberFieldTranslations = z
	.object({
		decrementLabel: z.string().optional().describe('Label for the decrement button; defaults to \'Decrease\''),
		incrementLabel: z.string().optional().describe('Label for the increment button; defaults to \'Increase\''),
	})
	.meta({ title: 'NumberFieldTranslations' });
export type NumberFieldTranslations = z.infer<typeof NumberFieldTranslations>;

// Mirrors Intl.NumberFormatOptions; controls currency/percent/unit formatting, fraction digits and rounding.
export const NumberFieldFormat = z
	.object({
		localeMatcher: z.enum(['lookup', 'best fit']).optional().describe('Locale matching algorithm to use'),
		style: z.enum(['decimal', 'percent', 'currency', 'unit']).optional().describe('The formatting style to use'),
		currency: z.string().optional().describe('The currency to use in currency formatting, e.g. \'EUR\''),
		currencyDisplay: z.enum(['code', 'symbol', 'narrowSymbol', 'name']).optional().describe('How to display the currency in currency formatting'),
		currencySign: z.enum(['standard', 'accounting']).optional().describe('How to render negative currency amounts'),
		unit: z.string().optional().describe('The unit to use in unit formatting, e.g. \'kilometer-per-hour\''),
		unitDisplay: z.enum(['short', 'long', 'narrow']).optional().describe('How to display the unit in unit formatting'),
		useGrouping: z
			.union([z.boolean(), z.enum(['always', 'auto', 'min2', 'true', 'false'])])
			.optional()
			.describe('Whether to use grouping separators such as thousands separators'),
		minimumIntegerDigits: z.number().optional().describe('The minimum number of integer digits to use'),
		minimumFractionDigits: z.number().optional().describe('The minimum number of fraction digits to use'),
		maximumFractionDigits: z.number().optional().describe('The maximum number of fraction digits to use'),
		minimumSignificantDigits: z.number().optional().describe('The minimum number of significant digits to use'),
		maximumSignificantDigits: z.number().optional().describe('The maximum number of significant digits to use'),
		numberingSystem: z.string().optional().describe('The numbering system to use, e.g. \'arab\''),
		compactDisplay: z.enum(['short', 'long']).optional().describe('How to display the compact notation'),
		notation: z.enum(['standard', 'scientific', 'engineering', 'compact']).optional().describe('The formatting notation to use'),
		signDisplay: z.enum(['auto', 'never', 'always', 'exceptZero', 'negative']).optional().describe('When to display the sign for the number'),
		roundingPriority: z.enum(['auto', 'morePrecision', 'lessPrecision']).optional().describe('Which rounding constraint takes priority when both fraction and significant digits are set'),
		roundingIncrement: z
			.union([
				z.literal(1),
				z.literal(2),
				z.literal(5),
				z.literal(10),
				z.literal(20),
				z.literal(25),
				z.literal(50),
				z.literal(100),
				z.literal(200),
				z.literal(250),
				z.literal(500),
				z.literal(1000),
				z.literal(2000),
				z.literal(2500),
				z.literal(5000),
			])
			.optional()
			.describe('The increment to round to'),
		roundingMode: z
			.enum(['ceil', 'floor', 'expand', 'trunc', 'halfCeil', 'halfFloor', 'halfExpand', 'halfTrunc', 'halfEven'])
			.optional()
			.describe('The rounding strategy to use'),
		trailingZeroDisplay: z.enum(['auto', 'stripIfInteger']).optional().describe('Whether to strip trailing zeroes when they would otherwise appear on an integer'),
	})
	.meta({ title: 'NumberFieldFormat' });
export type NumberFieldFormat = z.infer<typeof NumberFieldFormat>;

// Props for the NumberField component: a locale-aware stepper input for quantities, bookings and donations.
export const NumberFieldProps = z
	.object({
		label: z.string().optional().describe('Visible label; bound to the input via htmlFor'),
		description: z.string().optional().describe('Helper text under the field'),
		error: z.string().optional().describe('Error message; also flips the invalid state'),
		value: z.number().nullable().optional().describe('Controlled value (null = empty)'),
		defaultValue: z.number().optional().describe('Uncontrolled initial value'),
		min: z.number().optional().describe('Smallest allowed value'),
		max: z.number().optional().describe('Largest allowed value'),
		step: z.number().optional().describe('Base increment for the buttons, arrows and scrub; defaults to 1'),
		smallStep: z.number().optional().describe('Step used while Alt is held'),
		largeStep: z.number().optional().describe('Step used while Shift is held'),
		snapOnStep: z.boolean().optional().describe('Snap to the nearest step multiple when stepping'),
		allowWheelScrub: z.boolean().optional().describe('Let the mouse wheel change the value while focused'),
		format: NumberFieldFormat.optional().describe('Intl number formatting (currency/percent/unit, fraction digits, …)'),
		locale: z.union([z.string(), z.array(z.string())]).optional().describe('Formatting + parsing locale; defaults to the runtime locale'),
		scrub: z.boolean().optional().describe('Show the drag-to-scrub handle on the label; defaults to false'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		readOnly: z.boolean().optional().describe('Visible but not editable'),
		required: z.boolean().optional().describe('Marks the field required for native form submission'),
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		id: z.string().optional().describe('The id applied to the input (auto-generated when omitted)'),
		translations: NumberFieldTranslations.optional().describe('Localised strings for the step buttons; defaults to English'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'NumberField' });
export type NumberFieldProps = z.infer<typeof NumberFieldProps>;
