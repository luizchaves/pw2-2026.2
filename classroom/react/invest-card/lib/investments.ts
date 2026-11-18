import { supabase } from '@/lib/supabase';
import type {
  Investment,
  InvestmentRow,
  NewInvestment,
} from '@/types/investments';

const TABLE = 'investments';

function toInvestment(row: InvestmentRow): Investment {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    type: row.type,
    category: row.category,
    performance: Number(row.performance),
    currentValue: Number(row.current_value),
    investedValue: Number(row.invested_value),
  };
}

function toRow(investment: NewInvestment) {
  return {
    name: investment.name,
    issuer: investment.issuer,
    type: investment.type,
    category: investment.category,
    performance: investment.performance,
    current_value: investment.currentValue,
    invested_value: investment.investedValue,
  };
}

export async function fetchInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Não foi possível carregar os investimentos: ${error.message}`);
  }

  return (data as InvestmentRow[]).map(toInvestment);
}

export async function insertInvestment(
  investment: NewInvestment,
): Promise<Investment> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(investment))
    .select()
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar o investimento: ${error.message}`);
  }

  return toInvestment(data as InvestmentRow);
}

export async function deleteInvestment(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    throw new Error(`Não foi possível remover o investimento: ${error.message}`);
  }
}
