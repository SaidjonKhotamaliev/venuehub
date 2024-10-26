import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Notification, NotificationsInquiry } from '../../libs/dto/notification/notification';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { NotificationService } from './notification.service';
import { UpdateResult } from 'mongodb';

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

	@UseGuards(AuthGuard)
	@Mutation((returns) => Notification)
	public async updateMemberNotification(
		@Args('input') input: NotificationUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation, updateMemberNotification');
		return await this.notificationService.updateMemberNotification(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => [Notification])
	public async updateMemberAllNotifications(@AuthMember('_id') memberId: ObjectId): Promise<Notification[]> {
		console.log('Mutation, updateMemberAllNotifications');
		return await this.notificationService.updateMemberAllNotifications(memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Boolean)
	public async deleteMemberNotification(
		@Args('input') input: String,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Boolean> {
		console.log('Mutation, deleteMemberNotification');
		return await this.notificationService.deleteMemberNotification(memberId, input);
	}
}
