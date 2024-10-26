import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Notification, NotificationsInquiry } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';
import { UpdateResult } from 'mongodb';

@Injectable()
export class NotificationService {
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<Notification>) {}

	// Create a new notification
	public async createNotification(input: NotificationInput): Promise<Notification> {
		input.authorId = shapeIntoMongoObjectId(input.authorId);
		input.receiverId = shapeIntoMongoObjectId(input.receiverId);

		console.log('NOTIFICATION SENT!');

		return await this.notificationModel.create(input);
	}

	// Retrieve notifications for a specific user (receiver)
	public async getNotificationsForUser(receiverId: ObjectId, input?: NotificationsInquiry): Promise<Notification[]> {
		const { notificationStatus } = input;
		const match: T = {
			receiverId: receiverId,
		};
		if (notificationStatus) match.notificationStatus = notificationStatus;

		console.log('match : ', match);
		const result = await this.notificationModel.find(match).exec();

		console.log('result : ', result);

		return result;
	}

	// Mark a notification as read
	public async updateMemberNotification(memberId: ObjectId, input: NotificationUpdate): Promise<Notification> {
		const id: ObjectId = shapeIntoMongoObjectId(input._id);
		return await this.notificationModel.findByIdAndUpdate(
			{ receiverId: memberId, _id: id },
			{ notificationStatus: NotificationStatus.READ },
			{ new: true },
		);
	}

	// Mark all notifications as read for a specific user
	public async updateMemberAllNotifications(memberId: ObjectId): Promise<UpdateResult> {
		return await this.notificationModel.updateMany(
			{ receiverId: memberId, notificationStatus: NotificationStatus.WAIT },
			{ $set: { notificationStatus: NotificationStatus.READ } },
		);
	}

	// Delete a notification by ID
	// async deleteNotification(notificationId: string): Promise<{ deletedCount?: number }> {
	// 	return await this.notificationModel.deleteOne({ _id: notificationId });
	// }
}
