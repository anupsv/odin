import clsx from 'clsx';

export default function TextArea({
  id,
  placeholder,
  onChange,
  disabled,
  required,
}: {
  id: string;
  placeholder: string;
  onChange: (evt: { target: { value: string } }) => void;
  disabled: boolean;
  required: boolean;
}) {
  return (
    <textarea
      id={id}
      className={clsx([
        'block w-full rounded-lg border border-gray-600 bg-boat-color-gray-900',
        'p-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
      ])}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      required={required}
    />
  );
}
