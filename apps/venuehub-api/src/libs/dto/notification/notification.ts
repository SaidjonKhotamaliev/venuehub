import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationType, NotificationGroup, NotificationStatus } from '../../enums/notification.enum';

@ObjectType()
export class Notification {
	@Field(() => String)
	_id: ObjectId;

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
	@Field(() => String, { nullable: true })
	propertyId?: ObjectId;

	@IsMongoId()
	@IsOptional()
	@Field(() => String, { nullable: true })
	equipmentId?: ObjectId;

	@IsMongoId()
	@IsOptional()
	@Field(() => String, { nullable: true })
	articleId?: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@InputType()
export class NotificationsInquiry {
	@IsEnum(NotificationStatus)
	@IsOptional()
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;
}
