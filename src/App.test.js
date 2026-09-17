import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the podcast name in the hero section', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { level: 1, name: /madrileñas/i });
  expect(heading).toBeInTheDocument();
});
