import { Controller, Post, Body, Get, Res, Patch } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Roles('Admin')
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }



  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Opcional: Guardar token en cookie HttpOnly
    response.cookie('token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    return result;
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token');
    return { message: 'Sesión cerrada con éxito.' };
  }

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
