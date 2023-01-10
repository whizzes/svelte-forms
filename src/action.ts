import { FormInstance } from '.';

export function field<T extends object>(
  node: Node,
  form: FormInstance<T>,
): void {
  if (!form) {
    throw new Error('Missing "FormInstance".');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((node as any).tagName !== 'INPUT') {
    throw new Error('Expected an `<input />` element.');
  }

  node.addEventListener('blur', form.handleBlur);
  node.addEventListener('change', form.handleChange);
  node.addEventListener('focus', form.handleFocus);
  node.addEventListener('input', form.handleInput);

  form.values.subscribe((values) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node as any).value = values[(node as any).name];
  });
}
