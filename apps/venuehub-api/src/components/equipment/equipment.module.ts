import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import EquipmentSchema from '../../schemas/Equipment.model';
import { AuthModule } from '../auth/auth.module';
import { FollowModule } from '../follow/follow.module';
import { LikeModule } from '../like/like.module';
import { MemberModule } from '../member/member.module';
import { NotificationModule } from '../notification/notification.module';
import { ViewModule } from '../view/view.module';
import { EquipmentResolver } from './equipment.resolver';
import { EquipmentService } from './equipment.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Equipment', schema: EquipmentSchema }]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule,
		FollowModule,
		NotificationModule,
	],
	providers: [EquipmentResolver, EquipmentService],
	exports: [EquipmentService],
})
export class EquipmentModule {}
