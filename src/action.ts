import { FormInstance } from '.';

export function field<T extends object>(
  node: Node,
  form: FormInstance<T>,
): void {
  if (!form) {
    throw new Error('Missing "FormInstance".');
  }

  if ((node as HTMLInputElement).tagName !== 'INPUT') {
    throw new Error('Expected an `<input />` element.');
  }

  node.addEventListener('blur', form.handleBlur);
  node.addEventListener('change', form.handleChange);
  node.addEventListener('focus', form.handleFocus);
  node.addEventListener('input', form.handleInput);

  form.values.subscribe((values) => {
    (node as HTMLInputElement).value = values[(node as HTMLInputElement).name];
  });
}
