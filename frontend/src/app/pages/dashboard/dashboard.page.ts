import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;

import { AbastecimentoService } from '../../services/abastecimento.service';
import { Abastecimento } from '../../models/abastecimento.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonicModule, BaseChartDirective]
})
export class DashboardPage implements OnInit {
  abastecimentoForm!: FormGroup;
  historicoGlobal: Abastecimento[] = []; // Todos os registros do BD
  historicoVeiculo: Abastecimento[] = []; // Apenas do veículo selecionado
  
  // Veículos
  veiculosDisponiveis = ['Moto', 'Carro'];
  veiculoAtual: string = 'Moto';

  // Variáveis de controle e UI
  abaAtual: 'registrar' | 'historico' | 'estatisticas' | 'postos' = 'registrar';
  valorTotalEstimado: number = 0;
  kmPercorridos: number | null = null;
  
  // Filtros
  filtroCombustivel: string = 'Todos';
  filtroPeriodo: string = 'Tudo';

  // Estatísticas
  gastoMesAtual: number = 0;
  precoMedioMes: number = 0;
  mediaConsumoGeral: number = 0;

  // Metas
  metaMensal: number = 300;
  progressoMeta: number = 0;

  // Previsão
  previsaoDias: number | null = null;
  previsaoData: string | null = null;

  // Ranking Postos
  rankingPostos: any[] = [];

  // Gráfico: Linha
  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false };

  // Gráfico: Barras
  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };

  constructor(
    private fb: FormBuilder,
    private abastecimentoService: AbastecimentoService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.iniciarFormulario();
  }

  ionViewWillEnter() {
    this.carregarHistorico();
  }

  trocarVeiculo() {
    this.abastecimentoForm.patchValue({ veiculoId: this.veiculoAtual });
    this.processarHistoricoVeiculo();
  }

  iniciarFormulario() {
    const hoje = new Date().toISOString().split('T')[0];
    
    this.abastecimentoForm = this.fb.group({
      veiculoId: [this.veiculoAtual, Validators.required],
      data_abastecimento: [hoje, Validators.required],
      odometro: ['', [Validators.required, Validators.min(0)]],
      litros: ['', [Validators.required, Validators.min(0.1)]],
      preco_litro: ['', [Validators.required, Validators.min(0.1)]],
      tipo_combustivel: ['Gasolina', Validators.required],
      posto_nome: ['']
    });

    this.abastecimentoForm.valueChanges.subscribe(valores => {
      const litros = valores.litros || 0;
      const preco = valores.preco_litro || 0;
      this.valorTotalEstimado = litros * preco;

      if (valores.odometro && this.historicoVeiculo.length > 0) {
        const ultimoOdometro = this.historicoVeiculo[0].odometro;
        if (valores.odometro > ultimoOdometro) {
          this.kmPercorridos = valores.odometro - ultimoOdometro;
        } else {
          this.kmPercorridos = null;
        }
      } else {
        this.kmPercorridos = null;
      }
    });
  }

  carregarHistorico() {
    this.abastecimentoService.listar().subscribe({
      next: (dados) => {
        this.historicoGlobal = dados;
        this.processarHistoricoVeiculo();
      },
      error: (erro: any) => console.error('Erro ao buscar o histórico', erro)
    });
  }

  processarHistoricoVeiculo() {
    // Filtra para manter só o histórico do veículo que está selecionado no <ion-select>
    this.historicoVeiculo = this.historicoGlobal.filter(item => item.veiculoId === this.veiculoAtual);
    this.calcularEstatisticas();
    this.calcularRankingPostos();
  }

  get historicoFiltrado(): Abastecimento[] {
    return this.historicoVeiculo.filter(item => {
      const matchCombustivel = this.filtroCombustivel === 'Todos' || item.tipo_combustivel === this.filtroCombustivel;
      
      let matchPeriodo = true;
      const dataItem = new Date(item.data_abastecimento);
      const hoje = new Date();
      
      if (this.filtroPeriodo === 'Este Mês') {
        matchPeriodo = dataItem.getMonth() === hoje.getMonth() && dataItem.getFullYear() === hoje.getFullYear();
      } else if (this.filtroPeriodo === 'Esta Semana') {
        const diffDias = Math.floor((hoje.getTime() - dataItem.getTime()) / (1000 * 3600 * 24));
        matchPeriodo = diffDias <= 7;
      }

      return matchCombustivel && matchPeriodo;
    });
  }

  calcularEstatisticas() {
    if (this.historicoVeiculo.length === 0) {
      this.gastoMesAtual = 0;
      this.precoMedioMes = 0;
      this.mediaConsumoGeral = 0;
      this.progressoMeta = 0;
      this.gerarGraficos();
      return;
    }

    const hoje = new Date();
    const registrosMes = this.historicoVeiculo.filter(item => {
      const d = new Date(item.data_abastecimento);
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    });

    this.gastoMesAtual = registrosMes.reduce((acc, curr) => acc + (curr.valor_total || 0), 0);
    const somaPrecosMes = registrosMes.reduce((acc, curr) => acc + curr.preco_litro, 0);
    this.precoMedioMes = registrosMes.length > 0 ? somaPrecosMes / registrosMes.length : 0;

    let totalKm = 0;
    let totalLitros = 0;

    for (let i = 0; i < this.historicoVeiculo.length - 1; i++) {
      const atual = this.historicoVeiculo[i];
      const anterior = this.historicoVeiculo[i+1];
      if (atual.odometro > anterior.odometro) {
        totalKm += (atual.odometro - anterior.odometro);
        totalLitros += atual.litros;
      }
    }
    
    this.mediaConsumoGeral = totalLitros > 0 ? totalKm / totalLitros : 0;

    // Metas de Consumo
    this.progressoMeta = this.metaMensal > 0 ? (this.gastoMesAtual / this.metaMensal) : 0;

    // Gerar Inteligência
    this.gerarGraficos();
    this.calcularPrevisao();
  }

  gerarGraficos() {
    const historicoAsc = [...this.historicoVeiculo].reverse();
    
    const labelsPreco = historicoAsc.map(i => new Date(i.data_abastecimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    const dataPreco = historicoAsc.map(i => i.preco_litro);
    this.lineChartData = {
      labels: labelsPreco,
      datasets: [ { data: dataPreco, label: 'Preço/Litro (R$)', tension: 0.3, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true } ]
    };

    const gastosMap = new Map<string, number>();
    historicoAsc.forEach(item => {
      const mesAno = new Date(item.data_abastecimento).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      gastosMap.set(mesAno, (gastosMap.get(mesAno) || 0) + (item.valor_total || 0));
    });
    
    const labelsGastos = Array.from(gastosMap.keys()).slice(-6);
    const dataGastos = Array.from(gastosMap.values()).slice(-6);

    this.barChartData = {
      labels: labelsGastos,
      datasets: [ { data: dataGastos, label: 'Gasto Mensal (R$)', backgroundColor: '#10b981' } ]
    };
  }

  calcularPrevisao() {
    this.previsaoDias = null;
    this.previsaoData = null;

    if (this.historicoVeiculo.length < 2 || this.mediaConsumoGeral <= 0) return;
    
    const dataMaisRecente = new Date(this.historicoVeiculo[0].data_abastecimento);
    const limite = new Date(dataMaisRecente);
    limite.setDate(limite.getDate() - 30);
    
    const ultimos30dias = this.historicoVeiculo.filter(i => new Date(i.data_abastecimento) >= limite);
    if (ultimos30dias.length < 2) return;
    
    const maisRecente = ultimos30dias[0];
    const maisAntigo = ultimos30dias[ultimos30dias.length - 1];
    
    const diffTime = new Date(maisRecente.data_abastecimento).getTime() - new Date(maisAntigo.data_abastecimento).getTime();
    const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return;
    
    const kmRodados = maisRecente.odometro - maisAntigo.odometro;
    const kmPorDia = kmRodados / diffDias;
    
    if (kmPorDia <= 0) return;

    const capacidadeTanque = 12; // Pode ser estático ou lido do form futuramente
    const autonomiaReal = capacidadeTanque * this.mediaConsumoGeral;
    
    this.previsaoDias = Math.floor(autonomiaReal / kmPorDia);
    const proxData = new Date(dataMaisRecente);
    proxData.setDate(proxData.getDate() + this.previsaoDias);
    this.previsaoData = proxData.toLocaleDateString('pt-BR');
  }

  calcularRankingPostos() {
    const mapaPostos = new Map<string, { somaPreco: number, qtd: number, kmLMelhor: number }>();
    
    // Calculamos com base em todo o histórico global de postos, ou por veiculo?
    // Faz sentido ser o histórico de postos da garagem.
    for (let i = 0; i < this.historicoGlobal.length; i++) {
      const h = this.historicoGlobal[i];
      if (!h.posto_nome) continue;
      
      const p = mapaPostos.get(h.posto_nome) || { somaPreco: 0, qtd: 0, kmLMelhor: 0 };
      p.somaPreco += h.preco_litro;
      p.qtd += 1;
      
      // Procura o abastecimento anterior DO MESMO VEÍCULO para ver quanto rendeu o combustível daquele posto
      const historicoDesseVeiculo = this.historicoGlobal.filter(x => x.veiculoId === h.veiculoId);
      const index = historicoDesseVeiculo.findIndex(x => x.id === h.id);
      let kmL = 0;
      if (index > 0 && index < historicoDesseVeiculo.length - 1) {
        // o abastecimento "anterior" no tempo está na posição index+1
        const ant = historicoDesseVeiculo[index + 1];
        if (h.odometro > ant.odometro) {
          kmL = (h.odometro - ant.odometro) / h.litros;
        }
      }
      if (kmL > p.kmLMelhor) p.kmLMelhor = kmL;

      mapaPostos.set(h.posto_nome, p);
    }

    this.rankingPostos = Array.from(mapaPostos.keys()).map(nome => {
      const obj = mapaPostos.get(nome)!;
      return {
        nome: nome,
        precoMedio: obj.somaPreco / obj.qtd,
        melhorRendimento: obj.kmLMelhor
      };
    }).sort((a, b) => a.precoMedio - b.precoMedio); // Ordena pelo menor preço
  }

  async mostrarToast(mensagem: string, cor: string = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      color: cor,
      position: 'bottom'
    });
    toast.present();
  }

  async registrar() {
    if (this.abastecimentoForm.invalid) return;
    const payload: Abastecimento = this.abastecimentoForm.value;

    let kmL_atual = 0;
    if (this.historicoVeiculo.length > 0) {
      const ultimoOdometro = this.historicoVeiculo[0].odometro;
      if (payload.odometro <= ultimoOdometro) {
        this.mostrarToast(`O odômetro deve ser maior que o último registro desse veículo (${ultimoOdometro} km).`, 'danger');
        return;
      }
      kmL_atual = (payload.odometro - ultimoOdometro) / payload.litros;
    }

    this.abastecimentoService.criar(payload).subscribe({
      next: async () => {
        this.abastecimentoForm.reset();
        this.abastecimentoForm.patchValue({
          veiculoId: this.veiculoAtual,
          data_abastecimento: new Date().toISOString().split('T')[0],
          tipo_combustivel: 'Gasolina'
        });
        
        this.carregarHistorico();
        this.mostrarToast('Abastecimento salvo com sucesso!');
        this.abaAtual = 'historico';

        if (this.mediaConsumoGeral > 0 && kmL_atual > 0) {
          const limite = this.mediaConsumoGeral * 0.85; 
          if (kmL_atual < limite) {
            const alert = await this.alertController.create({
              header: 'Atenção ao Veículo!',
              subHeader: 'Consumo acima do normal',
              message: `O rendimento deste abastecimento foi de apenas ${kmL_atual.toFixed(1)} km/L (sua média é ${this.mediaConsumoGeral.toFixed(1)} km/L).`,
              buttons: ['OK']
            });
            await alert.present();
          }
        }

        // Alerta de meta mensal
        if (this.progressoMeta >= 0.8) {
          const alert = await this.alertController.create({
            header: 'Alerta de Meta',
            message: `Atenção! Você já gastou ${(this.progressoMeta*100).toFixed(0)}% da sua meta mensal para combustível neste veículo.`,
            buttons: ['Entendi']
          });
          await alert.present();
        }
      },
      error: (erro: any) => {
        console.error('Erro ao registrar', erro);
        this.mostrarToast('Erro ao salvar abastecimento.', 'danger');
      }
    });
  }

  deletarRegistro(id: number | undefined) {
    if (!id) return;
    this.abastecimentoService.deletar(id).subscribe({
      next: () => {
        this.carregarHistorico();
        this.mostrarToast('Registro removido.', 'medium');
      },
      error: (erro: any) => {
        console.error('Erro ao deletar', erro);
        this.mostrarToast('Erro ao deletar registro.', 'danger');
      }
    });
  }

  irParaDetalhes(id: number | undefined) {
    if (id) {
      this.router.navigate(['/detalhes', id]);
    }
  }

  gerarPDF() {
    const tableBody = [
      ['Data', 'Combustível', 'Odômetro', 'Litros', 'Total']
    ];

    this.historicoVeiculo.forEach(item => {
      tableBody.push([
        new Date(item.data_abastecimento).toLocaleDateString('pt-BR'),
        item.tipo_combustivel,
        `${item.odometro} km`,
        `${item.litros} L`,
        `R$ ${item.valor_total?.toFixed(2)}`
      ]);
    });

    const docDefinition: any = {
      content: [
        { text: `Relatório de Abastecimento - ${this.veiculoAtual}`, style: 'header' },
        { text: `\nMês Atual: Gasto R$ ${this.gastoMesAtual.toFixed(2)}`, style: 'subheader' },
        { text: `Consumo Médio Histórico: ${this.mediaConsumoGeral.toFixed(2)} km/L\n\n`, style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: tableBody
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 14, margin: [0, 5, 0, 5] }
      }
    };

    pdfMake.createPdf(docDefinition).download(`relatorio_${this.veiculoAtual.toLowerCase()}.pdf`);
  }
}
