export class CreateOrderDto {
  consultationId: number;
  tracking?: string | null;
  status?: string | null;
}
