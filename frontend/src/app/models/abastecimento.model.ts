export interface Abastecimento {
  id?: number; // Opcional, pois é gerado pelo backend
  data_abastecimento: string; // Formato de string (ISO 8601: 'YYYY-MM-DD')
  odometro: number;
  litros: number;
  preco_litro: number;
  valor_total?: number; // Calculado no servidor
  tipo_combustivel: string;
  posto_nome?: string;
  veiculoId: string;
}
