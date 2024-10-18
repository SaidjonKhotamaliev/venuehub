import { Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationType, NotificationGroup, NotificationStatus } from '../../enums/notification.enum';

@ObjectType()
export class Notification {
	@IsEnum(NotificationType)
	@IsNotEmpty()
	@Field(() => NotificationType)
	notificationType: NotificationType;

	@IsEnum(NotificationStatus)
	@IsOptional()
	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;

	@IsEnum(NotificationGroup)
	@IsNotEmpty()
	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	notificationTitle: string;

	@IsString()
	@IsOptional()
	@Field(() => String)
	notificationDesc?: string;

	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	authorId: ObjectId;

	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	receiverId: ObjectId;

	@IsMongoId()
	@IsOptional()
	@Field(() => String)
	propertyId?: ObjectId;

	@IsMongoId()
	@IsOptional()
	@Field(() => String)
	articleId?: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
