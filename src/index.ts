/* eslint-disable @typescript-eslint/no-explicit-any */

import { derived, get, writable } from 'svelte/store';
import { isSchema, ValidationError } from 'yup';

import { clone } from './utils';

import type { Readable, Writable } from 'svelte/store';
import type { Schema } from 'yup';

export { field } from './action';

export type FormErrors<T> = Record<keyof T, string | undefined>;

export type SetFieldError<T> = (field: keyof T, message?: string) => void;

export type SetFieldTouched<T> = (field: keyof T, value: boolean) => void;

export type SetFieldValue<T> = (field: keyof T, value: unknown) => void;

export type SetInitialValues<T> = (initialValues: T) => void;

export type OnSubmitHelpers<T> = {
  setFieldError: SetFieldError<T>;
  setFieldValue: SetFieldValue<T>;
};

export type FormInstance<T extends object> = {
  /**
   * Form errors.
   *
   * A readable store that holds form validation errors.
   */
  errors: Readable<FormErrors<T>>;

  /**
   * Clear all errors.
   */
  clearErrors(): void;

  /**
   * Form's fields initial values.
   *
   * This object is required to initialize a new form, it's used to track
   * changed values and to initialize the form values.
   */
  initialValues: Readable<T>;

  /**
   * A readable store which holds a boolean `true` if the form submition is
   * being executed.
   */
  isSubmitting: Readable<boolean>;

  /**
   * A readable store which holds a boolean `true` if the form submition is
   * under validation stage.
   */
  isValidating: Readable<boolean>;

  /**
   * Event handler for the input's `blur` event.
   */
  handleBlur(event: Event): void;

  /**
   * Event handler for the input's `change` event.
   */
  handleChange(event: Event): void;

  /**
   * Event handler for the input's `focus` event.
   */
  handleFocus(event: Event): void;

  /**
   * Event handler for the input's `input` event.
   *
   * The `handleInput` function comes handy when building `input` components
   * which must support dynamic `type` values, given that using dynamic type
   * attribute along with two-way binding is not legal on Svelte.
   *
   * ```
   * Error: 'type' attribute cannot be dynamic if input uses two-way binding.
   * ```
   *
   * Read the [Rich Harris's answer on StackOverflow][1] for more details on
   * this topic.
   *
   * [1]: https://stackoverflow.com/a/57393751/9888500
   */
  handleInput(event: Event): void;

  /**
   * Event handler for the form's submit event.
   *
   * Handles the submit event for the `form` element and prevents the
   * default behavior (`event.preventDefault`).
   *
   * Sets the `isSubmitting` store to `true` which can be used as a sentinel
   * value for a loading UI. If the `validationSchema` is available in the
   * `FormConfig`, then the `isValidating` store value will be `true` as well.
   */
  handleSubmit(event: Event): Promise<void>;

  /**
   * Resets form values back to the initial values
   */
  reset(): void;

  /**
   * Imperatively sets the initial values for the current form.
   *
   * This is useful when trying to update values of a form after changing them
   * to detect `isModified` with different values.
   */
  setInitialValues: SetInitialValues<T>;

  /**
   * Imperatively sets the error message for the field with the name provided.
   *
   * The `message` param could be skipped to clear the error message for the
   * field in question.
   */
  setFieldError: SetFieldError<T>;

  /**
   * Imperatively sets a field to be "touched".
   */
  setFieldTouched: SetFieldTouched<T>;

  /**
   * Imperatively sets the value for the field with the name provided.
   */
  setFieldValue(
    field: keyof T,
    value: any,
    shouldValidateField?: boolean,
  ): void;

  /**
   * Form touched (e.g. clicked) fields.
   *
   * A readable store that holds form fields which have been interacted by
   * the user.
   */
  touched: Readable<Record<keyof T, boolean>>;

  /**
   * Validates a single field using the provided `validationSchema`
   * asynchronously.
   */
  validateField(field: keyof T): Promise<void>;

  /**
   * Validates a single field using the provided `validationSchema`
   * synchronously.
   */
  validateFieldSync(field: keyof T): void;

  /**
   * Current form values.
   *
   * A writable store which holds form's field values. These are initialized
   * by the `initialValues` provided to the form configuration object.
   *
   * Useful to take advantage of the two-way data binding when providing it
   * to the `<input>` HTML element.
   *
   * ## Example
   *
   * ```html
   * <script>
   * import { newForm } from '@whizzes/svelte-forms';
   *
   * const { values } = newForm({
   *   initialValues: {
   *     name: '',
   *     last: '',
   *   }
   * });
   * </script>
   *
   * <form>
   *   <input name="name" bind:value={$values.name} />
   *   <input name="name" bind:value={$values.name} />
   * </form>
   * ```
   *
   * ## Notes
   *
   * Is not recommended to write directly to this object, instead you must
   * use setFieldValue` instead.
   */
  values: Writable<T>;
};

export type FormConfig<T extends object> = {
  /**
   * Form's fields initial values.
   *
   * This object is required to initialize a new form, it's used to track
   * changed values and to initialize the form values.
   */
  initialValues: T;

  /**
   * Callback to execute when `handleSubmit` is invoked.
   *
   * Form values are provided to this callback as the first argument and
   * `helpers` to update form state.
   */
  onSubmit(values: T, helpers: OnSubmitHelpers<T>): Promise<void> | void;

  /**
   * Wether to validate form fields whenever `handleBlur` is executed.
   */
  validateOnBlur?: boolean;

  /**
   * Wether to validate form fields whenever `handleChange` is executed.
   */
  validateOnChange?: boolean;

  /**
   * Wether to validate form fields whenever `handleFocus` is executed.
   */
  validateOnFocus?: boolean;

  /**
   * Wether to validate form fields whenever `handleInput` is executed.
   */
  validateOnInput?: boolean;

  /**
   * A [Yup][1] schema used to validate form values.
   *
   * [1]: https://github.com/jquense/yup
   */
  validationSchema?: Schema;
};

/**
 * Retrieves a HTML Input element instance value based on the input's type.
 *
 * Given a type, `getInputValue` will retrieve the value as follows:
 *
 * - `number` or `range`: Retrieve the `number` equivalent using `+` sign.
 * - As fallback retrieves the value _as is_.
 */
export const getInputValue = (inputElement: HTMLInputElement): any => {
  const type = inputElement.type;

  if (type.match(/^(number|range)$/)) {
    return +inputElement.value;
  }

  return inputElement.value;
};

/**
 * Creates a new form instance with an `errors` and `values` store.
 *
 * # Example
 *
 * ```html
 * <script lang="ts">
 * import { newForm } from '@whizzes/svelte-forms';
 *
 * import { productService } from '$lib/services/product';
 *
 * const { handleSubmit, errors, values, setFieldValue } = newForm<{
 *   name: string;
 *   logo: File;
 * }>({
 *   initialValues: {
 *     name: '',
 *     logo: null
 *   },
 *   onSubmit: async (values) => {
 *     await productService.createBrand(values.name, values.logo);
 *   }
 * });
 * </script>
 *
 * <form on:submit={handleSubmit}>
 *   <div>
 *     <Input
 *       name="name"
 *       label="Brand Name"
 *       placeholder="Apple Inc."
 *       bind:value={$values.name}
 *       error={$errors.name}
 *     />
 *     <FileDropzone
 *       error={$errors.logo}
 *       onChange={(files) => setFieldValue('logo', files[0])}
 *     />
 *   </div>
 *   <div class="text-center pt-4">
 *     <Button type="submit">Crear</Button>
 *   </div>
 * </form>
 * ```
 */
export type NewFormFn = <T extends object>(
  config: FormConfig<T>,
) => FormInstance<T>;

export const newForm: NewFormFn = <T extends object>(
  config: FormConfig<T>,
): FormInstance<T> => {
  if (typeof config === 'undefined') {
    throw new TypeError(
      'You must provide a config to "newForm". Expected "config" to be an object, received "undefined" instead.',
    );
  }

  if (!config.initialValues) {
    throw new TypeError(
      'You must specify "initialValues" with an object to "FormConfig".',
    );
  }

  const __initialValues = writable(clone(config.initialValues) as T);

  const __isSubmitting = writable(false);

  const __isValidating = writable(false);

  const __errors = writable(clone(get(__initialValues), null) as FormErrors<T>);
  const __touched = writable(
    clone(get(__initialValues), false) as Record<keyof T, boolean>,
  );
  const values = writable({
    ...get(__initialValues),
  });

  const clearErrors = (): void => {
    __errors.set(clone(get(__initialValues), null) as FormErrors<T>);
  };

  const setFieldError = (field: keyof T, message?: string): void => {
    __errors.update((currentState) => ({
      ...currentState,
      [field]: message,
    }));
  };

  const setFieldTouched = (field: keyof T, value = true): void => {
    if (typeof value !== 'boolean') {
      throw new TypeError(
        `Expected a "boolean" value for "setFieldTouched". Received "${typeof value}" instead.`,
      );
    }

    __touched.update((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const setInitialValues = (initialValues: T) => {
    __initialValues.set(clone(initialValues) as T);
  };

  /**
   * Updates the `errors` store with an instance of Yup's `ValidationError`.
   */
  const setYupValidationErrors = (error: ValidationError): void => {
    if ('path' in error && Array.isArray(error?.errors)) {
      setFieldError(error.path as keyof T, error.errors[0]);
      return;
    }

    console.error('Missing "path" and "errors" array.');
  };

  const validateField = async (field: keyof T): Promise<void> => {
    try {
      const currentFormValues = get(values);

      await config.validationSchema.validateAt(
        field as string,
        currentFormValues,
      );
      setFieldError(field, null);
    } catch (error) {
      setYupValidationErrors(error);
    }
  };

  const validateFieldSync = (field: keyof T): void => {
    try {
      const currentFormValues = get(values);

      config.validationSchema.validateSyncAt(
        field as string,
        currentFormValues,
      );
      __errors.update((currentState) => ({
        ...currentState,
        [field]: undefined,
      }));
    } catch (error) {
      setYupValidationErrors(error);
    }
  };

  const setFieldValue = (
    field: keyof T,
    value: any,
    shouldValidateField?: boolean,
  ): void => {
    values.update((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    if (shouldValidateField && config.validationSchema) {
      validateFieldSync(field);
    }
  };

  const reset = (): void => {
    values.set(get(__initialValues));
  };

  const handleBlur = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const name = target.name as keyof T;

    setFieldTouched(name);

    if (config.validateOnBlur) {
      validateField(name);
    }
  };

  const handleChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const name = target.name as keyof T;
    const value = getInputValue(target);

    return setFieldValue(name, value, config.validateOnChange);
  };

  const handleFocus = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const name = target.name as keyof T;

    setFieldTouched(name);

    if (config.validateOnFocus) {
      validateField(name);
    }
  };

  const handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = getInputValue(target);

    return setFieldValue(name as keyof T, value, config.validateOnInput);
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    try {
      if (config?.onSubmit && typeof config.onSubmit === 'function') {
        if (
          event?.preventDefault &&
          typeof event.preventDefault === 'function'
        ) {
          event.preventDefault();
        }

        if (
          event?.stopPropagation &&
          typeof event.stopPropagation === 'function'
        ) {
          event.stopPropagation();
        }

        const currentValues = get(values);

        clearErrors();

        __isSubmitting.set(true);

        if (isSchema(config.validationSchema)) {
          try {
            __isValidating.set(true);

            await config.validationSchema.validate(currentValues, {
              abortEarly: false,
            });
          } catch (error) {
            if (error?.inner) {
              const validationErrors = error.inner.reduce(
                (acc: FormErrors<T>, { message, path }) => {
                  return {
                    ...acc,
                    [path]: message,
                  };
                },
                {},
              );

              __errors.set(validationErrors);
              return;
            }

            throw error;
          } finally {
            __isValidating.set(false);
          }
        }

        await config.onSubmit(currentValues, {
          setFieldError,
          setFieldValue,
        });
      }
    } finally {
      __isSubmitting.set(false);
    }
  };

  return {
    clearErrors,
    errors: derived(__errors, (errors) => errors),
    handleBlur,
    handleChange,
    handleFocus,
    handleInput,
    handleSubmit,
    initialValues: derived(__initialValues, (initialValues) => initialValues),
    isSubmitting: derived(__isSubmitting, (isSubmitting) => isSubmitting),
    isValidating: derived(__isValidating, (isValidating) => isValidating),
    reset,
    setFieldError,
    setFieldTouched,
    setFieldValue,
    setInitialValues,
    touched: derived(__touched, (touched) => touched),
    values,
    validateField,
    validateFieldSync,
  };
};
