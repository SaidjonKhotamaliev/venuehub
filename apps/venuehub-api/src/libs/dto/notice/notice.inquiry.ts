import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../enums/notice.enum';

@InputType()
export class NoticeUpdate {
	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsEnum(NoticeStatus)
	@IsOptional()
	@Field(() => NoticeStatus, { nullable: true })
	noticeStatus?: NoticeStatus;

	@IsEnum(NoticeStatus)
	@IsOptional()
	@Field(() => NoticeTopic, { nullable: true })
	noticeTopic?: NoticeTopic;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	noticeTitle?: string;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	noticeContent?: string;
}

@InputType()
export class NoticeInquiry {
	@IsEnum(NoticeCategory)
	@IsNotEmpty()
	@Field(() => NoticeCategory)
	noticeCategory: NoticeCategory;

	@IsOptional()
	@Field(() => NoticeStatus, { nullable: true, defaultValue: NoticeStatus.ACTIVE })
	noticeStatus?: NoticeStatus;
}

@InputType()
export class NoticeInquiryAgent {
	@IsEnum(NoticeCategory)
	@IsNotEmpty()
	@Field(() => NoticeCategory)
	noticeCategory: NoticeCategory;
}
