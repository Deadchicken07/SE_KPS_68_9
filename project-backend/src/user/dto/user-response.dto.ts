export class UserResponseDto {
  userId: number;
  name: string;
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
