type FieldErrorProps = {
  message?: string;
};

/** A mensagem de validação de um campo. Nada é renderizado sem erro. */
export default function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <span role="alert" className="text-xs text-rose-600">
      {message}
    </span>
  );
}
