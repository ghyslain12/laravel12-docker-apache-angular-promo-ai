import { User } from "../../users/models/user.model";

export interface Client {
  id: number;
  surnom: string;
  idUser: number;
  userName: string;
  user: User;
}
