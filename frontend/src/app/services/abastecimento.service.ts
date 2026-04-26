import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Abastecimento } from '../models/abastecimento.model';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoService {
  // Configurado para rodar no celular na mesma rede WiFi (IP da máquina)
  private apiUrl = 'http://10.0.0.187:8000/abastecimentos';

  constructor(private http: HttpClient) {}

  // 1. Criar novo registro
  criar(abastecimento: Abastecimento): Observable<Abastecimento> {
    return this.http.post<Abastecimento>(this.apiUrl, abastecimento);
  }

  // 2. Listar histórico
  listar(): Observable<Abastecimento[]> {
    return this.http.get<Abastecimento[]>(this.apiUrl);
  }

  // 3. Trazer detalhes de um id
  obterPorId(id: number): Observable<Abastecimento> {
    return this.http.get<Abastecimento>(`${this.apiUrl}/${id}`);
  }

  // 4. Deletar registro
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
