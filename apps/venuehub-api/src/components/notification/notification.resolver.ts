import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Notification, NotificationsInquiry } from '../../libs/dto/notification/notification';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { NotificationService } from './notification.service';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Query((returns) => [Notification])
	public async getUserNotifications(
		@Args('input') input: NotificationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification[]> {
		console.log('Query, getUserNotifications');
		return await this.notificationService.getNotificationsForUser(memberId, input);
	}
}
