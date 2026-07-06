import type { FormErrors, FormHelpers, FormOptions, FormTouched, YupLikeError } from './types.js';

function isYupLikeError(error: unknown): error is YupLikeError {
	return typeof error === 'object' && error !== null && 'message' in error;
}

function clone<T>(value: T): T {
	// structuredClone is available in all modern browsers & Node 18+, and
	// safely handles Dates, Maps, Sets, etc. Fall back to JSON for
	// environments where it might be polyfilled poorly with class instances.
	try {
		return structuredClone(value);
	} catch {
		return JSON.parse(JSON.stringify(value));
	}
}

export class Form<T extends Record<string, unknown>> {
	#initialValues!: T;
	#options: FormOptions<T>;

	values = $state<T>() as T;
	errors = $state<FormErrors<T>>({}) as FormErrors<T>;
	touched = $state<FormTouched<T>>({}) as FormTouched<T>;
	isSubmitting = $state(false);
	/** Increments on every successful submit. Handy as a UI signal. */
	submitCount = $state(0);

	isValid = $derived(Object.keys(this.errors).length === 0);
	isDirty = $derived(JSON.stringify(this.values) !== JSON.stringify(this.#initialValues));

	constructor(options: FormOptions<T>) {
		this.#options = options;
		this.#initialValues = clone(options.initialValues);
		this.values = clone(options.initialValues);
	}

	/** Run `validationSchema` and/or `validate`, merging their results. */
	async validate(): Promise<FormErrors<T>> {
		const errors: FormErrors<T> = {} as FormErrors<T>;

		if (this.#options.validationSchema) {
			try {
				await this.#options.validationSchema.validate(this.values, { abortEarly: false });
			} catch (error) {
				if (isYupLikeError(error)) {
					const issues = error.inner && error.inner.length > 0 ? error.inner : [error];

					for (const issue of issues) {
						const path = issue.path ?? undefined;
						if (path && !(path in errors)) {
							(errors as Record<string, string>)[path] = issue.message;
						}
					}
				} else {
					throw error;
				}
			}
		}

		if (this.#options.validate) {
			const customErrors = await this.#options.validate(this.values);
			if (customErrors) {
				Object.assign(errors, customErrors);
			}
		}

		this.errors = errors;

		return errors;
	}

	/** Update a single field's value, then optionally re-validate. */
	setFieldValue<K extends keyof T>(field: K, value: T[K]): void {
		this.values[field] = value;

		if (this.#options.validateOnChange !== false) {
			void this.validate();
		}
	}

	setFieldError(field: keyof T | (string & {}), message: string | undefined): void {
		const key = field as string;

		if (message) {
			(this.errors as Record<string, string>)[key] = message;
		} else {
			delete (this.errors as Record<string, string>)[key];
		}
	}

	setFieldTouched(field: keyof T | (string & {}), isTouched = true): void {
		const key = field as string;

		if (isTouched) {
			(this.touched as Record<string, boolean>)[key] = true;
		} else {
			delete (this.touched as Record<string, boolean>)[key];
		}

		if (isTouched && this.#options.validateOnBlur !== false) {
			void this.validate();
		}
	}

	setErrors(errors: FormErrors<T>): void {
		this.errors = errors;
	}

	setValues(values: T): void {
		this.values = clone(values);
	}

	setSubmitting(isSubmitting: boolean): void {
		this.isSubmitting = isSubmitting;
	}

	/** Reset back to the original `initialValues` (or a new set of values). */
	resetForm(nextValues?: T): void {
		this.#initialValues = clone(nextValues ?? this.#initialValues);
		this.values = clone(this.#initialValues);
		this.errors = {} as FormErrors<T>;
		this.touched = {} as FormTouched<T>;
		this.isSubmitting = false;
	}

	#helpers(): FormHelpers<T> {
		return {
			setFieldValue: this.setFieldValue.bind(this),
			setFieldError: this.setFieldError.bind(this),
			setFieldTouched: this.setFieldTouched.bind(this),
			setErrors: this.setErrors.bind(this),
			setValues: this.setValues.bind(this),
			setSubmitting: this.setSubmitting.bind(this),
			resetForm: this.resetForm.bind(this),
			validate: this.validate.bind(this)
		};
	}

	/**
	 * Bind directly to `<form onsubmit={form.handleSubmit}>`. Prevents the
	 * default browser submission, validates, and calls `onSubmit` only if
	 * validation passes.
	 */
	handleSubmit = async (event?: SubmitEvent): Promise<void> => {
		event?.preventDefault();

		this.isSubmitting = true;

		try {
			const errors = await this.validate();

			if (Object.keys(errors).length > 0) {
				return;
			}

			await this.#options.onSubmit(this.values, this.#helpers());
			this.submitCount += 1;
		} finally {
			this.isSubmitting = false;
		}
	};

	/** Convenience `onblur` handler: `<input onblur={form.handleBlur('email')}>`. */
	handleBlur = (field: keyof T | (string & {})) => () => {
		this.setFieldTouched(field, true);
	};

	/**
	 * Convenience `onchange`/`oninput` handler for plain inputs:
	 * `<input oninput={form.handleChange('email')}>`.
	 */
	handleChange =
		(field: keyof T) =>
		(event: Event & { currentTarget: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }) => {
			const target = event.currentTarget;
			const value =
				target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;

			this.setFieldValue(field, value as T[keyof T]);
		};
}

/**
 * Create a new reactive form.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createForm } from '@whizzes/svelte-forms';
 *   import * as yup from 'yup';
 *
 *   const form = createForm({
 *     initialValues: { email: '', password: '' },
 *     validationSchema: yup.object({
 *       email: yup.string().email().required(),
 *       password: yup.string().min(8).required()
 *     }),
 *     onSubmit: async (values) => {
 *       await login(values);
 *     }
 *   });
 * </script>
 *
 * <form onsubmit={form.handleSubmit}>
 *   <input bind:value={form.values.email} onblur={form.handleBlur('email')} />
 *   {#if form.touched.email && form.errors.email}
 *     <p>{form.errors.email}</p>
 *   {/if}
 *
 *   <button disabled={form.isSubmitting}>Submit</button>
 * </form>
 * ```
 */
export function createForm<T extends Record<string, unknown>>(options: FormOptions<T>): Form<T> {
	return new Form(options);
}
