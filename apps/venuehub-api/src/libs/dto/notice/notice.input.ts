import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

@InputType()
export class NoticeInput {
	@IsEnum(NoticeCategory)
	@IsNotEmpty()
	@Field(() => NoticeCategory)
	noticeCategory: NoticeCategory;

	@IsEnum(NoticeStatus)
	@IsNotEmpty()
	@Field(() => NoticeStatus, { defaultValue: NoticeStatus.HOLD })
	noticeStatus?: NoticeStatus;

	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	noticeTitle: string;

	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	noticeContent: string;
}
