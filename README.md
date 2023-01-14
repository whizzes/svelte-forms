<div>
  <h1 align="center">Svelte Forms</h1>
  <h4 align="center">
    Utilities for Svelte Forms Management
  </h4>
</div>

<div align="center">

![Build](https://github.com/whizzes/svelte-forms/workflows/build/badge.svg)
![Tests](https://github.com/whizzes/svelte-forms/workflows/test/badge.svg)
![Lint](https://github.com/whizzes/svelte-forms/workflows/lint/badge.svg)
![Publish](https://github.com/whizzes/svelte-forms/workflows/publish/badge.svg)

</div>

## Installation

```bash
# npm
npm install @whizzes/svelte-forms

# yarn
yarn add @whizzes/svelte-forms

# pnpm
pnpm add @whizzes/svelte-forms
```

## Examples

### Creating a new form

```svelte
<script lang="ts">
  import * as Sentry from '@sentry/browser';
  import { newForm } from '@whizzes/svelte-forms';
  import * as Yup from 'yup';

  import { EmailAlreadyTaken } from '$lib/errors';
  import { agentService } from '$lib/services/agent';
  import { notificationStore } from '$lib/stores/notification';

  const { handleSubmit, values, errors, isSubmitting } = newForm({
    initialValues: {
      name: 'James'
      lastName: 'Bond',
      nickname: 'Agent 007',
      email: 'james.bond@agent007.com',
    },
    validationSchema: Yup.object({
      name: Yup.string().required(),
      lastName: Yup.string().required(),
      nickname: Yup.string().required(),
      email: Yup.string().email().required(),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await agentService.register(values);
      } catch (error) {
        if (error instanceof EmailAlreadyTaken) {
          helpers.setFieldError(
            'email',
            'The email is already taken!');
          return;
        }

        Sentry.captureException(error);

        notificationStore.displayError({
          text: 'An error ocurred registering an agent.'
        });
      }
    },
  });
</script>

<form>
  <div>
    <label>Name</label>
    <input type="text" name="name" bind:value={$values.name} />
    <p class:hidden={!$errors.name}></p>
  </div>
  <div>
    <label>Last Name</label>
    <input type="text" name="lastName" bind:value={$values.lastName} />
    <p class:hidden={!$errors.lastName}></p>
  </div>
  <div>
    <label>Nickname</label>
    <input type="text" name="nickname" bind:value={$values.nickname} />
    <p class:hidden={!$errors.nickname}></p>
  </div>
  <div>
    <label>Email</label>
    <input type="text" name="email" bind:value={$values.email} />
    <p class:hidden={!$errors.email}></p>
  </div>
  <button type="submit" class:disabled={$isSubmitting} disabled={$isSubmitting}>
    Create Account
  </button>
</form>
```

## Releasing

Whenever a tag is pushed a new release is created an the package is
published to the NPM registry using GitHub Actions.

Bump the current version using `npm` as follows:

```sh
# for versions with breaking changes use `major`
npm version major

# for versions with non-breaking changes use `minor`
npm version minor

# for patch versions use `patch`
npm version patch
```

Then push the repository including tag metadata as follows

```sh
git push origin main --follow-tags
```

## Contributions

Any contribution to this package is welcome! Don't hesitate on opening a
PR or creating an issue!
