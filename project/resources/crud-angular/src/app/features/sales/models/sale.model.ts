import { Client } from '../../clients/models/client.model';
import { Material } from '../../materials/models/material.model';
import { Ticket } from '../../tickets/models/ticket.model';

export interface Sale {
  id: number;
  titre: string;
  description: string;
  idClient: number;
  customer_id?: number;
  materials: Material[];
  tickets?: Ticket[];
  customer: Client;
}
