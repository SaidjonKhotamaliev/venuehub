import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupVisit, lookupVisitEquipments } from '../../libs/config';
import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';
import { OrdinaryInquiry } from '../../libs/dto/equipment/equipment.input';
import { FavoriteResponse } from '../../libs/dto/favorite-response/favorite-response';
import { Properties, Property } from '../../libs/dto/property/property';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistance(input);
		if (!viewExist) {
			console.log('---New view insert -');
			return await this.viewModel.create(input);
		} else return null;
	}

	private async checkViewExistance(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input;

		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec();
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<FavoriteResponse> {
		const { page, limit } = input;

		// Fetch visited properties
		const matchProperties: T = { viewGroup: ViewGroup.PROPERTY, memberId: memberId };
		const propertyData: T = await this.viewModel
			.aggregate([
				{ $match: matchProperties },
				{ $sort: { updatedAt: -1 } },
				{ $lookup: { from: 'properties', localField: 'viewRefId', foreignField: '_id', as: 'visitedProperty' } },
				{ $unwind: '$visitedProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{
								$limit: limit,
							},
							lookupVisit,
							{ $unwind: '$visitedProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const visitedProperties: Properties = { list: [], metaCounter: propertyData[0].metaCounter };
		visitedProperties.list = propertyData[0]?.list.map((ele) => ele.visitedProperty) || [];
		const propertyMetaCounter = propertyData[0]?.metaCounter[0]?.total ?? 0;

		console.log('data1: ', visitedProperties);
		// Fetch visited equipments
		const matchEquipments: T = { viewGroup: ViewGroup.EQUIPMENT, memberId: memberId };
		const equipmentData: T = await this.viewModel
			.aggregate([
				{ $match: matchEquipments },
				{ $sort: { updatedAt: -1 } },
				{ $lookup: { from: 'equipments', localField: 'viewRefId', foreignField: '_id', as: 'visitedEquipment' } },
				{ $unwind: '$visitedEquipment' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{
								$limit: limit,
							},
							lookupVisitEquipments,
							{ $unwind: '$visitedEquipment.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const visitedEquipments: Equipments = { list: [], metaCounter: propertyData[0].metaCounter };
		visitedEquipments.list = equipmentData[0]?.list.map((ele) => ele.visitedEquipment) || [];
		const equipmentMetaCounter = equipmentData[0]?.metaCounter[0]?.total ?? 0;
		console.log('data1: ', visitedEquipments);

		let totalMetaCounter = { total: 0 };
		totalMetaCounter.total = propertyMetaCounter + equipmentMetaCounter;

		return {
			properties: visitedProperties,
			equipments: visitedEquipments,
			metaCounter: totalMetaCounter,
		};
	}
}
