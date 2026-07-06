import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import * as yup from 'yup';

import { createForm } from './form.svelte.js';

describe('createForm', () => {
	it('initializes values from initialValues', () => {
		const form = createForm({
			initialValues: { name: 'James', age: 7 },
			onSubmit: vi.fn()
		});

		expect(form.values).toEqual({ name: 'James', age: 7 });
		expect(form.isSubmitting).toBe(false);
		expect(form.isValid).toBe(true);
		expect(form.isDirty).toBe(false);
	});

	it('tracks dirtiness reactively when a field changes', () => {
		const form = createForm({
			initialValues: { name: 'James' },
			validateOnChange: false,
			onSubmit: vi.fn()
		});

		expect(form.isDirty).toBe(false);

		form.setFieldValue('name', 'Bond');
		flushSync();

		expect(form.isDirty).toBe(true);
	});

	it('validates using a Yup schema and blocks submission on error', async () => {
		const onSubmit = vi.fn();
		const form = createForm({
			initialValues: { email: '' },
			validationSchema: yup.object({
				email: yup.string().email().required()
			}),
			onSubmit
		});

		await form.handleSubmit();

		expect(onSubmit).not.toHaveBeenCalled();
		expect(form.errors.email).toBeTruthy();
	});

	it('submits once validation passes and increments submitCount', async () => {
		const onSubmit = vi.fn();
		const form = createForm({
			initialValues: { email: 'agent@007.com' },
			validationSchema: yup.object({
				email: yup.string().email().required()
			}),
			onSubmit
		});

		await form.handleSubmit();

		expect(onSubmit).toHaveBeenCalledTimes(1);
		expect(form.errors).toEqual({});
		expect(form.submitCount).toBe(1);
	});

	it('supports a plain validate function instead of a schema', async () => {
		const form = createForm({
			initialValues: { username: '' },
			validate: (values) => {
				if (!values.username) {
					return { username: 'Username is required' };
				}
			},
			onSubmit: vi.fn()
		});

		const errors = await form.validate();
		expect(errors.username).toBe('Username is required');
	});

	it('lets helpers set a field error manually (e.g. from a failed API call)', () => {
		const form = createForm({
			initialValues: { email: '' },
			onSubmit: vi.fn()
		});

		form.setFieldError('email', 'Email already taken');
		expect(form.errors.email).toBe('Email already taken');

		form.setFieldError('email', undefined);
		expect(form.errors.email).toBeUndefined();
	});

	it('resets back to initial values', () => {
		const form = createForm({
			initialValues: { name: 'James' },
			validateOnChange: false,
			onSubmit: vi.fn()
		});

		form.setFieldValue('name', 'Bond');
		form.setFieldTouched('name', true);
		expect(form.values.name).toBe('Bond');

		form.resetForm();

		expect(form.values.name).toBe('James');
		expect(form.touched).toEqual({});
		expect(form.errors).toEqual({});
	});
});
