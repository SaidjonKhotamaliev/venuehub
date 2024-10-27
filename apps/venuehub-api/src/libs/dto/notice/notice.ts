import { Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

@ObjectType()
export class Notice {
	@Field(() => String)
	_id: ObjectId;

	@IsEnum(NoticeCategory)
	@IsNotEmpty()
	@Field(() => NoticeCategory)
	noticeCategory: NoticeCategory;

	@IsEnum(NoticeStatus)
	@IsNotEmpty()
	@Field(() => NoticeStatus)
	noticeStatus: NoticeStatus;

	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	noticeTitle: string;

	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	noticeContent: string;

	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date)
	createdAt: Date;
}
