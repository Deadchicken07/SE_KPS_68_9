import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const search = query.search ?? '';

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
      this.prisma.users.count({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const data: UserResponseDto[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<UserResponseDto | null> {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
