import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	PropertiesInquiry,
	PropertyInput,
} from '../../libs/dto/property/property.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import * as moment from 'moment';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Member } from '../../libs/dto/member/member';
import { NotificationService } from '../notification/notification.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { FollowService } from '../follow/follow.service';
import { FavoriteResponse } from '../../libs/dto/favorite-response/favorite-response';
import { OrdinaryInquiry } from '../../libs/dto/equipment/equipment.input';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly followService: FollowService,
		private readonly likeService: LikeService,
		private readonly notificationService: NotificationService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		try {
			const result = await this.propertyModel.create(input);
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProperties',
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

			console.log('property:', result);

			for (const follower of followers) {
				const notificationInput = await this.createNotificationInputForCreate(
					input.memberId,
					follower?.followerData?._id,
					result,
				);

				console.log('notificationInput: ', notificationInput);

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
		receiverProperty: Property,
	): Promise<NotificationInput> {
		const member: Member = await this.memberService.getMemberIdOfMember(authorId);
		return {
			notificationType: NotificationType.CREATE,
			notificationGroup: NotificationGroup.PROPERTY,
			notificationTitle: `${member.memberNick} created a new property:  ${receiverProperty.propertyTitle}`,
			authorId: authorId,
			receiverId,
			propertyId: receiverProperty._id,
			notificationDesc: 'Check out the new property.',
		};
	}

	public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
		const search: T = {
			_id: propertyId,
			propertyStatus: { $ne: PropertyStatus.DELETE },
		};

		const targetProperty: Property = await this.propertyModel.findOne(search).lean().exec();
		if (!targetProperty) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
				targetProperty.propertyViews++;
			}
			const likeInput = { memberId: memberId, likeRefId: propertyId, likeGroup: LikeGroup.PROPERTY };
			targetProperty.meLiked = await this.likeService.checkLikeExistance(likeInput);
		}

		targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
		return targetProperty;
	}

	public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
		let { rentedAt, propertyStatus, deletedAt } = input;

		const search: T = {
			_id: input._id,
			memberId: memberId,
			propertyStatus: { $ne: PropertyStatus.DELETE },
		};

		if (propertyStatus === PropertyStatus.RENT) {
			rentedAt = moment().toDate();
			input.rentedAt = rentedAt;
		} else if (propertyStatus === PropertyStatus.DELETE) {
			deletedAt = moment().toDate();
			input.deletedAt = deletedAt;
		}

		const result = await this.propertyModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (rentedAt || deletedAt) {
			await this.memberService.memberStatsEditor({ _id: memberId, targetKey: 'memberProperties', modifier: -1 });
		}

		return result;
	}

	public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
		const match: T = { propertyStatus: { $ne: PropertyStatus.DELETE } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);

		const result = await this.propertyModel
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

	private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
		const { memberId, locationList, typeList, periodsRangeProperty, pricesRangeProperty, squaresRangeProperty, text } =
			input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList && locationList.length) match.propertyLocation = { $in: locationList };
		if (typeList && typeList.length) match.propertyType = { $in: typeList };

		if (periodsRangeProperty) match.createdAt = { $gte: periodsRangeProperty.start, $lte: periodsRangeProperty.end };
		if (pricesRangeProperty)
			match.propertyRentPrice = { $gte: pricesRangeProperty.start, $lte: pricesRangeProperty.end };
		if (squaresRangeProperty)
			match.propertySquare = { $gte: squaresRangeProperty.start, $lte: squaresRangeProperty.end };

		if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<FavoriteResponse> {
		return await this.likeService.getFavorites(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<FavoriteResponse> {
		return await this.viewService.getVisited(memberId, input);
	}

	public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
		const { propertyStatus } = input.search;
		if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = { memberId: memberId, propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.propertyModel
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

	public async likeTargetProperty(memberId: ObjectId, likeRefId: ObjectId): Promise<Property> {
		const target: Property = await this.propertyModel
			.findOne({ _id: likeRefId, propertyStatus: { $ne: PropertyStatus.DELETE } })
			.exec();

		if (!target) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PROPERTY,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.propertyStatsEditor({ _id: likeRefId, targetKey: 'propertyLikes', modifier: modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		if (modifier === 1) {
			const notificationInput = await this.createNotificationInputForLike(
				target,
				NotificationGroup.PROPERTY,
				memberId,
				target.memberId,
			);
			await this.notificationService.createNotification(await notificationInput);
		}

		return result;
	}

	private async createNotificationInputForLike(
		receiverProperty?: Property,
		notificationGroup?: NotificationGroup,
		authorId?: ObjectId,
		receiverId?: ObjectId,
	): Promise<NotificationInput> {
		const member: Member = await this.memberService.getMemberIdOfMember(authorId);
		return {
			notificationType: NotificationType.LIKE,
			receiverId,
			propertyId: receiverProperty._id,
			notificationGroup,
			notificationTitle: `${member.memberNick} liked your ${receiverProperty.propertyTitle} property!`,
			authorId,
			notificationDesc: 'Check out the new like.',
		};
	}

	// ADMIN

	public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties> {
		const { propertyStatus, propertyLocationList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (propertyLocationList) match.propertyLocation = { $in: propertyLocationList };

		console.log(propertyLocationList);

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		console.log(result);

		return result[0];
	}

	public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
		let { rentedAt, propertyStatus, deletedAt } = input;

		const search: T = {
			_id: input._id,
			propertyStatus: { $ne: PropertyStatus.DELETE },
		};

		if (propertyStatus === PropertyStatus.RENT) rentedAt = moment().toDate();
		else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.propertyModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (rentedAt || deletedAt) {
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProperties', modifier: -1 });
		}

		return result;
	}

	public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
		const search: T = {
			_id: propertyId,
			propertyStatus: PropertyStatus.DELETE,
		};

		const result = await this.propertyModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
		const { _id, targetKey, modifier } = input;
		return await this.propertyModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}

	public async getMemberOfProperty(input: ObjectId): Promise<Property> {
		return await this.propertyModel.findById(input);
	}
}
