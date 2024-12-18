import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationType, NotificationGroup, NotificationStatus } from '../../enums/notification.enum';

@InputType()
export class NotificationInput {
	@IsEnum(NotificationType)
	@IsNotEmpty()
	@Field(() => NotificationType)
	notificationType: NotificationType;

	@IsEnum(NotificationStatus)
	@IsOptional()
	@Field(() => NotificationStatus, { defaultValue: NotificationStatus.WAIT })
	notificationStatus?: NotificationStatus;

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
	@Field(() => String, { nullable: true })
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
	articleId?: ObjectId;

	@IsMongoId()
	@IsOptional()
	@Field(() => String, { nullable: true })
	equipmentId?: ObjectId;
}
