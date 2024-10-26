import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { BoardArticleInput, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { LikeInput } from '../../libs/dto/like/like.input';
import { Member } from '../../libs/dto/member/member';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { FollowService } from '../follow/follow.service';
import { LikeService } from '../like/like.service';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service';
import { ViewService } from '../view/view.service';

@Injectable()
export class BoardArticleService {
	constructor(
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
		private readonly followService: FollowService,
		private readonly notificationService: NotificationService,
	) {}

	public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
		input.memberId = memberId;
		try {
			const result = await this.boardArticleModel.create(input);
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberArticles',
				modifier: 1,
			});

			const { list: followers } = await this.followService.getMemberFollowers(input.memberId, {
				page: 1,
				limit: Number.MAX_SAFE_INTEGER,
				search: { followingId: input.memberId },
			});

			if (!followers || followers.length === 0) {
				console.log('No followers found for this agent.');
				return result;
			}

			for (const follower of followers) {
				const notificationInput = this.createNotificationInputForCreate(input.memberId, follower._id, result);

				console.log(follower.followerId);

				await this.notificationService.createNotification(await notificationInput);
			}

			return result;
		} catch (err) {
			console.log('Error, Service model: ', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	private async createNotificationInputForCreate(
		authorId: ObjectId,
		receiverId: ObjectId,
		receiverArticle: BoardArticle,
	): Promise<NotificationInput> {
		const member: Member = await this.memberService.getMemberIdOfMember(authorId);
		return {
			notificationType: NotificationType.CREATE,
			notificationGroup: NotificationGroup.PROPERTY,
			notificationTitle: `${member.memberNick} created a new article: ${receiverArticle.articleTitle}`,
			authorId: authorId,
			receiverId,
			notificationDesc: 'Check the new article.',
			articleId: receiverArticle._id,
		};
	}

	public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle> {
		const search: T = {
			_id: articleId,
			articleStatus: BoardArticleStatus.ACTIVE,
		};

		const targetBoardArticle: BoardArticle = await this.boardArticleModel.findOne(search).lean().exec();
		if (!targetBoardArticle) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: articleId, viewGroup: ViewGroup.ARTICLE };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.boardArticleStatsEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
				targetBoardArticle.articleViews++;
			}
			const likeInput = { memberId: memberId, likeRefId: articleId, likeGroup: LikeGroup.ARTICLE };
			targetBoardArticle.meLiked = await this.likeService.checkLikeExistance(likeInput);
		}

		targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
		return targetBoardArticle;
	}

	public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle> {
		let { _id, articleStatus } = input;

		const result = await this.boardArticleModel
			.findOneAndUpdate({ _id: _id, memberId: memberId, articleStatus: BoardArticleStatus.ACTIVE }, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === BoardArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({ _id: memberId, targetKey: 'memberArticles', modifier: -1 });
		}

		return result;
	}

	public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, text } = input.search;

		const match: T = { articleStatus: BoardArticleStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
		if (input?.search.memberId) {
			match.memberId = shapeIntoMongoObjectId(input.search.memberId);
		}

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
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

	public async likeTargetBoardArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<BoardArticle> {
		const target: BoardArticle = await this.boardArticleModel
			.findOne({ _id: likeRefId, articleStatus: BoardArticleStatus.ACTIVE })
			.exec();

		if (!target) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.ARTICLE,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.boardArticleStatsEditor({
			_id: likeRefId,
			targetKey: 'articleLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		if (modifier === 1) {
			const notificationInput = this.createNotificationInputForLike(
				target,
				NotificationGroup.ARTICLE,
				memberId,
				target.memberId,
			);
			await this.notificationService.createNotification(await notificationInput);
		}

		return result;
	}

	private async createNotificationInputForLike(
		receiverArticle?: BoardArticle,
		notificationGroup?: NotificationGroup,
		authorId?: ObjectId,
		receiverId?: ObjectId,
	): Promise<NotificationInput> {
		const member: Member = await this.memberService.getMemberIdOfMember(authorId);
		return {
			notificationType: NotificationType.LIKE,
			receiverId,
			notificationGroup,
			notificationTitle: `${member.memberNick} liked your ${receiverArticle.articleTitle} board article!`,
			authorId,
			notificationDesc: 'Check out the new like.',
		};
	}

	// ADMIN

	public async getAllBoardArticlesByAdmin(input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, text } = input.search;

		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = articleCategory;

		const result = await this.boardArticleModel
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

	public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle> {
		let { _id, articleStatus } = input;

		const result = await this.boardArticleModel
			.findOneAndUpdate({ _id: _id, articleStatus: BoardArticleStatus.ACTIVE }, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === BoardArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberArticles', modifier: -1 });
		}

		return result;
	}

	public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle> {
		const search: T = {
			_id: articleId,
			articleStatus: BoardArticleStatus.DELETE,
		};
		const result = await this.boardArticleModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle> {
		const { _id, targetKey, modifier } = input;
		return await this.boardArticleModel
			.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec();
	}

	public async getMemberIdOfArticle(input: ObjectId): Promise<BoardArticle> {
		return await this.boardArticleModel.findById(input);
	}
}
