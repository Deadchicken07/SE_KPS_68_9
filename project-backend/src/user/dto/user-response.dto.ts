export class UserResponseDto {
  userId: number;
  title: string | null;
  name: string;
  sur_name: string | null;
  email: string | null;
}

export class PaginatedUserResponse {
  data: UserResponseDto[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}
