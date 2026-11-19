import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Money from '@/components/Money';
import EyeToggle from '@/components/EyeToggle';
import { VisibilityProvider } from '@/contexts/VisibilityContext';

function renderWithVisibility(ui: React.ReactNode) {
  return render(
    <VisibilityProvider>
      <EyeToggle />
      {ui}
    </VisibilityProvider>,
  );
}

describe('<Money />', () => {
  it('mostra o valor em reais', () => {
    renderWithVisibility(<Money value={3245.1} />);

    expect(screen.getByText(/R\$\s3\.245,10/)).toBeInTheDocument();
  });

  it('esconde o valor quando o olho da navbar está fechado', async () => {
    const user = userEvent.setup();

    renderWithVisibility(<Money value={3245.1} />);
    await user.click(screen.getByRole('button', { name: 'Ocultar valores' }));

    expect(screen.queryByText(/3\.245,10/)).not.toBeInTheDocument();
    expect(screen.getByText('R$ ****')).toBeInTheDocument();
  });
});
