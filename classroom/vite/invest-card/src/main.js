import './style.css';
import { investments } from './data/investments.js';
import { createInvestmentCard } from './components/investment-card.js';

const investmentsGrid = document.querySelector('.investments-grid');

investments.forEach(investment => {
  const card = createInvestmentCard(investment);
  investmentsGrid.appendChild(card);
});

investmentsGrid.addEventListener('click', (event) => {
  if (event.target.closest('button')) {
    const card = event.target.closest('article');
    card.remove();
  }
});
