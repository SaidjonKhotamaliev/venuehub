import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import * as moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Member } from '../../libs/dto/member/member';
import { NotificationService } from '../notification/notification.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { FollowService } from '../follow/follow.service';
import {
	AgentEquipmentsInquiry,
	AllEquipmentsInquiry,
	EquipmentInput,
	EquipmentsInquiry,
	OrdinaryInquiry,
} from '../../libs/dto/equipment/equipment.input';
import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';
import { EquipmentStatus } from '../../libs/enums/equipment.enum';
import { EquipmentUpdate } from '../../libs/dto/equipment/equipment.update';
import { FavoriteResponse } from '../../libs/dto/favorite-response/favorite-response';

@Injectable()
export class EquipmentService {
	constructor(
		@InjectModel('Equipment') private readonly equipmentModel: Model<Equipment>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly followService: FollowService,
		private readonly likeService: LikeService,
		private readonly notificationService: NotificationService,
	) {}

	public async createEquipment(input: EquipmentInput): Promise<Equipment> {
		try {
			const result = await this.equipmentModel.create(input);
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberEquipments',
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
		receiverEquipment: Equipment,
	): Promise<NotificationInput> {
		const member: Member = await this.memberService.getMemberIdOfMember(authorId);
		return {
			notificationType: NotificationType.CREATE,
			notificationGroup: NotificationGroup.EQUIPMENT,
			notificationTitle: `${member.memberNick} created a new equipment:  ${receiverEquipment.equipmentTitle}`,
			authorId: authorId,
			receiverId,
			notificationDesc: 'Check the new equipment.',
		};
	}

	public async getEquipment(memberId: ObjectId, equipmentId: ObjectId): Promise<Equipment> {
		const search: T = {
			_id: equipmentId,
			equipmentStatus: EquipmentStatus.ACTIVE,
		};

		const targetEquipment: Equipment = await this.equipmentModel.findOne(search).lean().exec();
		if (!targetEquipment) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: equipmentId, viewGroup: ViewGroup.EQUIPMENT };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.equipmentStatsEditor({ _id: equipmentId, targetKey: 'equipmentViews', modifier: 1 });
				targetEquipment.equipmentViews++;
			}
			const likeInput = { memberId: memberId, likeRefId: equipmentId, likeGroup: LikeGroup.EQUIPMENT };
			targetEquipment.meLiked = await this.likeService.checkLikeExistance(likeInput);
		}

		targetEquipment.memberData = await this.memberService.getMember(null, targetEquipment.memberId);
		return targetEquipment;
	}

	public async updateEquipment(memberId: ObjectId, input: EquipmentUpdate): Promise<Equipment> {
		let { rentedAt, equipmentStatus, deletedAt, retiredAt, maintanencedAt } = input;

		const search: T = {
			_id: input._id,
			memberId: memberId,
			equipmentStatus: EquipmentStatus.ACTIVE,
		};

		if (equipmentStatus === EquipmentStatus.RENT) {
			rentedAt = moment().toDate();
			input.rentedAt = rentedAt;
		} else if (equipmentStatus === EquipmentStatus.RETIRED) {
			retiredAt = moment().toDate();
			input.deletedAt = deletedAt;
		} else if (equipmentStatus === EquipmentStatus.MAINTENANCE) {
			maintanencedAt = moment().toDate();
			input.deletedAt = deletedAt;
		}

		const result = await this.equipmentModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (rentedAt || deletedAt || maintanencedAt) {
			await this.memberService.memberStatsEditor({ _id: memberId, targetKey: 'memberEquipments', modifier: -1 });
		}

		console.log('result +++++: ', result);

		return result;
	}

	public async getEquipments(memberId: ObjectId, input: EquipmentsInquiry): Promise<Equipments> {
		const match: T = { equipmentsStatus: EquipmentStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match: ', match);

		const result = await this.equipmentModel
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

	private shapeMatchQuery(match: T, input: EquipmentsInquiry): void {
		const { memberId, typeList, periodsRange, pricesRange, text } = input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (typeList && typeList.length) match.equipmentType = { $in: typeList };

		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (pricesRange) match.equipmentRentPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (text) match.equipmentTitle = { $regex: new RegExp(text, 'i') };
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<FavoriteResponse> {
		return await this.likeService.getFavorites(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<FavoriteResponse> {
		return await this.viewService.getVisited(memberId, input);
	}

	public async getAgentEquipments(memberId: ObjectId, input: AgentEquipmentsInquiry): Promise<Equipments> {
		const { equipmentStatus } = input.search;

		const match: T = { memberId: memberId, propertyStatus: equipmentStatus ?? { $ne: EquipmentStatus.RETIRED } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.equipmentModel
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

	public async likeTargetEquipment(memberId: ObjectId, likeRefId: ObjectId): Promise<Equipment> {
		const target: Equipment = await this.equipmentModel
			.findOne({ _id: likeRefId, equipmentStatus: EquipmentStatus.ACTIVE })
			.exec();

		if (!target) throw new InternalServerErrorException(Message.NOT_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.EQUIPMENT,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.equipmentStatsEditor({ _id: likeRefId, targetKey: 'equipmentLikes', modifier: modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		if (modifier === 1) {
			const notificationInput = this.createNotificationInputForLike(
				target,
				NotificationGroup.EQUIPMENT,
				memberId,
				target.memberId,
			);
			await this.notificationService.createNotification(await notificationInput);
		}

		return result;
	}

	private async createNotificationInputForLike(
		receiverEquipment?: Equipment,
		notificationGroup?: NotificationGroup,
		authorId?: ObjectId,
		receiverId?: ObjectId,
	): Promise<NotificationInput> {
		const member: Member = await this.memberService.getMemberIdOfMember(authorId);
		return {
			notificationType: NotificationType.LIKE,
			receiverId,
			notificationGroup,
			notificationTitle: `${member.memberNick} liked your ${receiverEquipment.equipmentTitle} equipment!`,
			authorId,
			notificationDesc: 'Check out the new like.',
		};
	}

	// ADMIN

	public async getAllEquipmentsByAdmin(input: AllEquipmentsInquiry): Promise<Equipments> {
		const { equipmentStatus } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (equipmentStatus) match.propertyStatus = equipmentStatus;

		const result = await this.equipmentModel
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

	public async updateEquipmentByAdmin(input: EquipmentUpdate): Promise<Equipment> {
		let { rentedAt, equipmentStatus, maintanencedAt, retiredAt } = input;

		const search: T = {
			_id: input._id,
			equipmentStatus: EquipmentStatus.ACTIVE,
		};

		if (equipmentStatus === EquipmentStatus.RENT) rentedAt = moment().toDate();
		else if (equipmentStatus === EquipmentStatus.MAINTENANCE) maintanencedAt = moment().toDate();
		else if (equipmentStatus === EquipmentStatus.RETIRED) retiredAt = moment().toDate();

		const result = await this.equipmentModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (rentedAt || retiredAt || maintanencedAt) {
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberEquipments', modifier: -1 });
		}

		return result;
	}

	public async removeEquipmentByAdmin(equipmentId: ObjectId): Promise<Equipment> {
		const search: T = {
			_id: equipmentId,
			equipmentStatus: EquipmentStatus.RETIRED,
		};

		const result = await this.equipmentModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async equipmentStatsEditor(input: StatisticModifier): Promise<Equipment> {
		const { _id, targetKey, modifier } = input;
		return await this.equipmentModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}

	public async getMemberOfProperty(input: ObjectId): Promise<Equipment> {
		return await this.equipmentModel.findById(input);
	}
}
