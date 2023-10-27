/* Extensão terminada em "d.ts" => Definição de tipos, somente código que o typescript entende. Não tem javascript */
/* sobrescrever tipos de uma biblioteca */
import { knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string;
      title: string;
      amount: number;
      created_at: string;
      session_id?: string;
    };
  }
}
