import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notice } from '../../libs/dto/notice/notice';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { NoticeInquiry } from '../../libs/dto/notice/notice.inquiry';
import { Message } from '../../libs/enums/common.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class NoticeService {
	constructor(
		@InjectModel('Notice') private readonly noticeModel: Model<Notice>,
		private readonly notificationService: NotificationService,
	) {}

	public async createNotice(input: NoticeInput): Promise<Notice> {
		try {
			const result = await this.noticeModel.create(input);

			return result;
		} catch (err) {
			console.log('Error, Service model: ', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getNotices(input: NoticeInquiry): Promise<Notice[]> {
		const result = await this.noticeModel.find(input).exec();

		return result;
	}
}
