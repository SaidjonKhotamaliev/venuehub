import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notice } from '../../libs/dto/notice/notice';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { NoticeInquiry, NoticeInquiryAgent, NoticeUpdate } from '../../libs/dto/notice/notice.inquiry';
import { Message } from '../../libs/enums/common.enum';
import { NoticeStatus } from '../../libs/enums/notice.enum';
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
		const newInput = { noticeCategory: input.noticeCategory, noticeStatus: { $ne: NoticeStatus.DELETE } };
		const result = await this.noticeModel.find(newInput).exec();

		if (!result) {
			throw new InternalServerErrorException('There is no any Notices available!');
		}

		return result;
	}

	public async getNoticesForAgentAndAdmins(input: NoticeInquiryAgent): Promise<Notice[]> {
		const result = await this.noticeModel.find(input).exec();
		if (!result) {
			throw new InternalServerErrorException('There is no any Notices available!');
		}
		return result;
	}

	public async updateNotice(input: NoticeUpdate): Promise<Notice> {
		const id: ObjectId = input._id;

		const result = await this.noticeModel.findOneAndUpdate({ _id: id }, input, { new: true }).exec();
		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
		return result;
	}
}
