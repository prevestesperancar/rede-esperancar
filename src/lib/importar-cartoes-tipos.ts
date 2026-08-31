export type ItemImportado = {
  pagina: number;
  nomeLido: string;
  dataNascimentoLida: string;
  respostasLidas: string;
  linguaLida: string;
  nota?: number;
  erro?: string;
};

export type EstadoImportacao = {
  erro?: string;
  itens?: ItemImportado[];
};
