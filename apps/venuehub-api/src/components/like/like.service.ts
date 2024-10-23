import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupFavorite } from '../../libs/config';
import { Equipments } from '../../libs/dto/equipment/equipment';
import { OrdinaryInquiry } from '../../libs/dto/equipment/equipment.input';
import { FavoriteResponse } from '../../libs/dto/favorite-response/favorite-response';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { Properties } from '../../libs/dto/property/property';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = {
			memberId: input.memberId,
			likeRefId: input.likeRefId,
		};
		const exist = await this.likeModel.findOne(search);
		let modifier: number = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
			} catch (err) {
				console.log('Error, Service.model: ', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}

		console.log('- Like modifier: ', modifier, ' -');

		return modifier;
	}

	public async checkLikeExistance(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();

		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	// public async getFavorite(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties | Equipments> {
	// 	const { page, limit } = input;
	// 	const match: T = { likeGroup: LikeGroup.PROPERTY, memberId: memberId };
	// 	let data: T = await this.likeModel
	// 		.aggregate([
	// 			{ $match: match },
	// 			{ $sort: { updatedAt: -1 } },
	// 			{ $lookup: { from: 'properties', localField: 'likeRefId', foreignField: '_id', as: 'favoriteProperty' } },
	// 			{ $unwind: '$favoriteProperty' },
	// 			{
	// 				$facet: {
	// 					list: [
	// 						{ $skip: (page - 1) * limit },
	// 						{
	// 							$limit: limit,
	// 						},
	// 						lookupFavorite,
	// 						{ $unwind: '$favoriteProperty.memberData' },
	// 					],
	// 					metaCounter: [{ $count: 'total' }],
	// 				},
	// 			},
	// 		])
	// 		.exec();

	// 	const result1: Properties | Equipments = { list: [], metaCounter: data[0].metaCounter };
	// 	result1.list = data[0].list.map((ele) => ele.favoriteProperty);

	// 	const matchEquipment: T = { likeGroup: LikeGroup.EQUIPMENT, memberId: memberId };
	// 	data = await this.likeModel
	// 		.aggregate([
	// 			{ $match: matchEquipment },
	// 			{ $sort: { updatedAt: -1 } },
	// 			{ $lookup: { from: 'equipments', localField: 'likeRefId', foreignField: '_id', as: 'favoriteEquipments' } },
	// 			{ $unwind: '$favoriteEquipments' },
	// 			{
	// 				$facet: {
	// 					list: [
	// 						{ $skip: (page - 1) * limit },
	// 						{
	// 							$limit: limit,
	// 						},
	// 						lookupFavorite,
	// 						{ $unwind: '$favoriteEquipments.memberData' },
	// 					],
	// 					metaCounter: [{ $count: 'total' }],
	// 				},
	// 			},
	// 		])
	// 		.exec();

	// 	const result2: Properties | Equipments = { list: [], metaCounter: data[0].metaCounter };
	// 	result2.list = data[0].list.map((ele) => ele.favoriteEquipments);

	// 	console.log('result:', result1);

	// 	return result1;
	// }

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<FavoriteResponse> {
		const { page, limit } = input;

		// Fetch favorite properties
		const matchProperties: T = { likeGroup: LikeGroup.PROPERTY, memberId: memberId };
		const propertyData = await this.likeModel
			.aggregate([
				{ $match: matchProperties },
				{ $sort: { updatedAt: -1 } },
				{ $lookup: { from: 'properties', localField: 'likeRefId', foreignField: '_id', as: 'favoriteProperty' } },
				{ $unwind: '$favoriteProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const favoriteProperties: Properties[] = propertyData[0]?.list.map((ele) => ele.favoriteProperty) || [];
		const propertyMetaCounter = propertyData[0]?.metaCounter[0]?.total || 0;

		// Fetch favorite equipment
		const matchEquipment: T = { likeGroup: LikeGroup.EQUIPMENT, memberId: memberId };
		const equipmentData = await this.likeModel
			.aggregate([
				{ $match: matchEquipment },
				{ $sort: { updatedAt: -1 } },
				{ $lookup: { from: 'equipments', localField: 'likeRefId', foreignField: '_id', as: 'favoriteEquipments' } },
				{ $unwind: '$favoriteEquipments' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteEquipments.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const favoriteEquipments: Equipments[] = equipmentData[0]?.list.map((ele) => ele.favoriteEquipments) || [];
		const equipmentMetaCounter = equipmentData[0]?.metaCounter[0]?.total || 0;

		// Combine the metaCounter (for example, summing the totals)
		const totalMetaCounter = propertyMetaCounter + equipmentMetaCounter;

		return {
			properties: favoriteProperties,
			equipments: favoriteEquipments,
			metaCounter: totalMetaCounter,
		};
	}
}
