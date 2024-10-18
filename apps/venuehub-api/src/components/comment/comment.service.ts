import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupMember } from '../../libs/config';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { Member } from '../../libs/dto/member/member';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Property } from '../../libs/dto/property/property';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';
import { BoardArticleService } from '../board-article/board-article.service';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service';
import { PropertyService } from '../property/property.service';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		private readonly memberService: MemberService,
		private readonly propertyService: PropertyService,
		private readonly boardArticleService: BoardArticleService,
		private readonly notificationService: NotificationService,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;

		let result = null;

		try {
			result = await this.commentModel.create(input);
		} catch (err) {
			console.log('Error, Service model: ', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.PROPERTY:
				await this.propertyService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'propertyComments',
					modifier: 1,
				});

				const receiverProperty: Property = await this.propertyService.getMemberOfProperty(input.commentRefId);
				if (receiverProperty) {
					const notificationInput = this.createNotificationInput(
						input,
						receiverProperty.memberId,
						receiverProperty._id,
						undefined,
					);
					await this.notificationService.createNotification(await notificationInput);
				}
				break;

			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});

				const receiverArticle: BoardArticle = await this.boardArticleService.getMemberIdOfArticle(input.commentRefId);
				if (receiverArticle) {
					const notificationInput = this.createNotificationInput(
						input,
						receiverArticle.memberId,
						undefined,
						input.commentRefId,
					);
					await this.notificationService.createNotification(await notificationInput);
				}
				break;

			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});

				const receiverMember: Member = await this.memberService.getMemberIdOfMember(input.commentRefId);
				if (receiverMember) {
					const notificationInput = this.createNotificationInput(input, receiverMember._id, undefined, undefined);
					await this.notificationService.createNotification(await notificationInput);
				}
				break;

			default:
				throw new Error('Invalid comment group');
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	private async createNotificationInput(
		input: CommentInput,
		receiverId: ObjectId,
		receiverPropertyId?: ObjectId,
		articleId?: ObjectId,
	): Promise<NotificationInput> {
		const member: Member = await this.memberService.getMemberIdOfMember(input.memberId);
		return {
			notificationType: NotificationType.COMMENT,
			notificationGroup: NotificationGroup.COMMENT,
			notificationTitle: `${member.memberNick} commented: ${input.commentContent}!`,
			authorId: input.memberId,
			receiverId,
			notificationDesc: 'Check out the new comment.',
			propertyId: receiverPropertyId, // Optional, if associated with a property
			articleId, // Optional, if associated with an article
		};
	}

	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		let { _id } = input;

		const result = await this.commentModel
			.findOneAndUpdate({ _id: _id, memberId: memberId, commentStatus: CommentStatus.ACTIVE }, input, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.commentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meliked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		return result[0];
	}

	public async removeCommentByAdmin(commentId: ObjectId): Promise<Comment> {
		const result = await this.commentModel.findByIdAndDelete(commentId).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}
}
