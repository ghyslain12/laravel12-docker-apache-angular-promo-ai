import { Sale } from "../../sales/models/sale.model";

export interface Ticket {
  id: number;
  titre: string;
  description: string;
  sale_id: number;
  sale?: Sale;
}
