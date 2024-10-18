import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from '../../schemas/Property.model';
import { AuthModule } from '../auth/auth.module';
import { FollowModule } from '../follow/follow.module';
import { LikeModule } from '../like/like.module';
import { MemberModule } from '../member/member.module';
import { NotificationModule } from '../notification/notification.module';
import { ViewModule } from '../view/view.module';
import { PropertyResolver } from './property.resolver';
import { PropertyService } from './property.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule,
		FollowModule,
		NotificationModule,
	],
	providers: [PropertyResolver, PropertyService],
	exports: [PropertyService],
})
export class PropertyModule {}
