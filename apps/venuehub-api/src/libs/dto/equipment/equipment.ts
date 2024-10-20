import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { EquipmentType, EquipmentStatus, EquipmentCondition } from '../../enums/equipment.enum';
import { MeLiked } from '../like/like';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class Equipment {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => EquipmentType)
	equipmentType: EquipmentType;

	@Field(() => EquipmentStatus)
	equipmentStatus: EquipmentStatus;

	@Field(() => EquipmentCondition)
	equipmentCondition: EquipmentCondition;

	@Field(() => String)
	euqipmentTitle: string;

	@Field(() => Number)
	equipmentRentPrice: number;

	@Field(() => Int)
	equipmentViews: number;

	@Field(() => Int)
	equipmentLikes: number;

	@Field(() => Int)
	equipmentComments: number;

	@Field(() => Int)
	equipmentRank: number;

	@Field(() => [String])
	equipmentImages: string[];

	@Field(() => String, { nullable: true })
	equipmentDesc?: string;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	rentedAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	constructedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from Aggregation**/

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => Member, { nullable: true })
	memberData?: Member;
}

@ObjectType()
export class Equipments {
	@Field(() => [Equipment])
	list: Equipment[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
