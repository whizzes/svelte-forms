/**
 * A plain object of field errors, keyed by field name. Nested/array fields
 * use dot notation (e.g. `"address.city"`, `"tags.0"`) to mirror how Yup
 * reports paths.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>> & Record<string, string>;

/** Which fields the user has interacted with (blurred or changed). */
export type FormTouched<T> = Partial<Record<keyof T, boolean>> & Record<string, boolean>;

/**
 * Minimal shape of a Yup schema (or anything API-compatible with it, such
 * as `yup.object(...)`). We only depend on `validate`, so any validation
 * library that exposes this shape can be used as a `validationSchema`.
 */
export interface YupLikeSchema<T> {
	validate(values: T, options?: { abortEarly?: boolean }): Promise<T>;
}

/** A Yup-style validation error shape (`ValidationError`). */
export interface YupLikeError {
	inner?: Array<{ path?: string | null; message: string }>;
	path?: string | null;
	message: string;
}

/** A plain validation function, as an alternative to `validationSchema`. */
export type ValidateFn<T> = (
	values: T
) => FormErrors<T> | undefined | void | Promise<FormErrors<T> | undefined | void>;

export interface FormHelpers<T extends Record<string, unknown>> {
	/** Overwrite a single field's value. */
	setFieldValue<K extends keyof T>(field: K, value: T[K]): void;
	/** Set (or clear, with `undefined`) a single field's error message. */
	setFieldError(field: keyof T | (string & {}), message: string | undefined): void;
	/** Mark a single field as touched/untouched. */
	setFieldTouched(field: keyof T | (string & {}), touched?: boolean): void;
	/** Replace the entire errors map. */
	setErrors(errors: FormErrors<T>): void;
	/** Replace the entire values object. */
	setValues(values: T): void;
	/** Toggle the `isSubmitting` flag manually. */
	setSubmitting(isSubmitting: boolean): void;
	/** Reset the form back to its initial values (or new ones, if given). */
	resetForm(nextValues?: T): void;
	/** Re-run validation without submitting. */
	validate(): Promise<FormErrors<T>>;
}

export interface FormOptions<T extends Record<string, unknown>> {
	/** The form's starting values. Required so field types can be inferred. */
	initialValues: T;
	/** A Yup schema (or compatible) used to validate `values` on submit/change. */
	validationSchema?: YupLikeSchema<T>;
	/** A plain function alternative to `validationSchema`. */
	validate?: ValidateFn<T>;
	/** Re-validate on every value change. Defaults to `true`. */
	validateOnChange?: boolean;
	/** Re-validate when a field is blurred. Defaults to `true`. */
	validateOnBlur?: boolean;
	/** Called with the current values once validation passes. */
	onSubmit: (values: T, helpers: FormHelpers<T>) => unknown | Promise<unknown>;
}
