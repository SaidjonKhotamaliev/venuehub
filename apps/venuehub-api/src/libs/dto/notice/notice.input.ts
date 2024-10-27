import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../enums/notice.enum';

@InputType()
export class NoticeInput {
	@IsEnum(NoticeCategory)
	@IsNotEmpty()
	@Field(() => NoticeCategory)
	noticeCategory: NoticeCategory;

	@IsEnum(NoticeStatus)
	@IsOptional()
	@Field(() => NoticeStatus, { defaultValue: NoticeStatus.HOLD, nullable: true })
	noticeStatus?: NoticeStatus;

	@IsEnum(NoticeTopic)
	@IsNotEmpty()
	@Field(() => NoticeTopic)
	noticeTopic: NoticeTopic;

	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	noticeTitle: string;

	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	noticeContent: string;

	memberId?: ObjectId;
}
