import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
	imports: [
		HttpModule,
		JwtModule.register({ secret: `${process.env.SECRET_TOKEN}`, signOptions: { expiresIn: '14d' } }),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
