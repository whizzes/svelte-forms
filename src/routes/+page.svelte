<script lang="ts">
	import * as yup from 'yup';

	import { createForm } from '$lib/form.svelte.js';

	const form = createForm({
		initialValues: {
			name: 'James',
			lastName: 'Bond',
			nickname: 'Agent 007',
			email: 'james.bond@agent007.com'
		},
		validationSchema: yup.object({
			name: yup.string().required(),
			lastName: yup.string().required(),
			nickname: yup.string().required(),
			email: yup.string().email().required()
		}),
		onSubmit: async (values, helpers) => {
			try {
				// await agentService.register(values);
				console.log('submitting', values);
			} catch (error) {
				if (error === 'email-taken') {
					helpers.setFieldError('email', 'The email is already taken!');
					return;
				}

				throw error;
			}
		}
	});
</script>

<form onsubmit={form.handleSubmit}>
	<div>
		<label for="name">Name</label>
		<input id="name" type="text" bind:value={form.values.name} onblur={form.handleBlur('name')} />
		{#if form.touched.name && form.errors.name}
			<p>{form.errors.name}</p>
		{/if}
	</div>

	<div>
		<label for="lastName">Last Name</label>
		<input
			id="lastName"
			type="text"
			bind:value={form.values.lastName}
			onblur={form.handleBlur('lastName')}
		/>
		{#if form.touched.lastName && form.errors.lastName}
			<p>{form.errors.lastName}</p>
		{/if}
	</div>

	<div>
		<label for="nickname">Nickname</label>
		<input
			id="nickname"
			type="text"
			bind:value={form.values.nickname}
			onblur={form.handleBlur('nickname')}
		/>
		{#if form.touched.nickname && form.errors.nickname}
			<p>{form.errors.nickname}</p>
		{/if}
	</div>

	<div>
		<label for="email">Email</label>
		<input
			id="email"
			type="text"
			bind:value={form.values.email}
			onblur={form.handleBlur('email')}
		/>
		{#if form.touched.email && form.errors.email}
			<p>{form.errors.email}</p>
		{/if}
	</div>

	<button type="submit" disabled={form.isSubmitting}> Create Account </button>
</form>
