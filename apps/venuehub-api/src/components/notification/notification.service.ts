import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Notification } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class NotificationService {
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<Notification>) {}

	// Create a new notification
	public async createNotification(input: NotificationInput): Promise<Notification> {
		input.authorId = shapeIntoMongoObjectId(input.authorId);
		input.receiverId = shapeIntoMongoObjectId(input.receiverId);

		return await this.notificationModel.create(input);
	}

	// Retrieve notifications for a specific user (receiver)
	// async getNotificationsForUser(receiverId: string, status?: NotificationStatus): Promise<Notification[]> {
	// 	const query = { receiverId };
	// 	if (status) {
	// 		query['notificationStatus'] = status;
	// 	}

	// 	return await this.notificationModel.find(query).sort({ createdAt: -1 }).exec();
	// }

	// Mark a notification as read
	// async markNotificationAsRead(notificationId: string): Promise<Notification> {
	// 	return await this.notificationModel.findByIdAndUpdate(
	// 		notificationId,
	// 		{ notificationStatus: NotificationStatus.READ },
	// 		{ new: true },
	// 	);
	// }

	// Mark all notifications as read for a specific user
	// async markAllAsRead(receiverId: string): Promise<{ nModified: number }> {
	// 	return await this.notificationModel.updateMany(
	// 		{ receiverId, notificationStatus: NotificationStatus.WAIT },
	// 		{ $set: { notificationStatus: NotificationStatus.READ } },
	// 	);
	// }

	// Delete a notification by ID
	// async deleteNotification(notificationId: string): Promise<{ deletedCount?: number }> {
	// 	return await this.notificationModel.deleteOne({ _id: notificationId });
	// }
}
