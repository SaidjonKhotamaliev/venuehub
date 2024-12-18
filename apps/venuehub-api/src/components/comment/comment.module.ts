import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { MemberModule } from '../member/member.module';
import { NotificationModule } from '../notification/notification.module';
import { PropertyModule } from '../property/property.module';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
		AuthModule,
		MemberModule,
		PropertyModule,
		EquipmentModule,
		BoardArticleModule,
		NotificationModule,
	],
	providers: [CommentResolver, CommentService],
	exports: [CommentService],
})
export class CommentModule {}
