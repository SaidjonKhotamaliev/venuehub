import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { EquipmentCondition, EquipmentStatus, EquipmentType } from '../../enums/equipment.enum';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';

@InputType()
export class EquipmentUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => EquipmentType, { nullable: true })
	equipmentType?: EquipmentType;

	@IsOptional()
	@Field(() => EquipmentStatus, { nullable: true })
	equipmentStatus?: EquipmentStatus;

	@IsOptional()
	@Field(() => EquipmentCondition)
	equipmentCondition: EquipmentCondition;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	equipmentTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	equipmentRentPrice?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	equipmentImages?: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	equipmentDesc?: string;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	rentedAt?: Date;

	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	retiredAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	maintanencedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}
