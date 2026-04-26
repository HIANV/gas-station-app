import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AbastecimentoService } from '../../services/abastecimento.service';
import { Abastecimento } from '../../models/abastecimento.model';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.page.html',
  styleUrls: ['./detalhes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DetalhesPage implements OnInit {
  registro: Abastecimento | null = null;
  carregando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private abastecimentoService: AbastecimentoService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Busca o ID na rota ativa. Ex: /detalhes/1 -> '1'
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = parseInt(paramId, 10);
      this.buscarRegistro(id);
    }
  }

  buscarRegistro(id: number) {
    this.abastecimentoService.obterPorId(id).subscribe({
      next: (dados) => {
        this.registro = dados;
        this.carregando = false;
        
        // Aqui também poderia ser feito o cálculo extra, 
        // caso tivéssemos o odômetro anterior (ex: trazer no DTO a média).
      },
      error: (erro: any) => {
        console.error('Erro ao carregar detalhes', erro);
        this.carregando = false;
      }
    });
  }

  async confirmarExclusao() {
    const alert = await this.alertController.create({
      header: 'Excluir Abastecimento',
      message: 'Tem certeza de que deseja excluir este registro? Essa ação não pode ser desfeita.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.excluirRegistro();
          }
        }
      ]
    });

    await alert.present();
  }

  excluirRegistro() {
    if (!this.registro || !this.registro.id) return;
    
    this.abastecimentoService.deletar(this.registro.id).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Registro excluído com sucesso.',
          duration: 2500,
          color: 'medium',
          position: 'bottom'
        });
        toast.present();
        
        // Volta para o Dashboard
        this.navCtrl.back();
      },
      error: async (erro: any) => {
        console.error('Erro ao deletar', erro);
        const toast = await this.toastController.create({
          message: 'Erro ao excluir o registro.',
          duration: 2500,
          color: 'danger',
          position: 'bottom'
        });
        toast.present();
      }
    });
  }
}
