import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { availableEquipmentSorts } from '../../config';
import { Direction } from '../../enums/common.enum';
import { EquipmentType, EquipmentStatus, EquipmentCondition } from '../../enums/equipment.enum';

@InputType()
export class EquipmentInput {
	@IsNotEmpty()
	@Field(() => EquipmentType)
	equipmentType: EquipmentType;

	@IsNotEmpty()
	@Field(() => EquipmentCondition)
	equipmentCondition: EquipmentCondition;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	equipmentTitle: string;

	@IsNotEmpty()
	@Field(() => Number)
	equipmentRentPrice: number;

	@IsNotEmpty()
	@Field(() => [String])
	equipmentImages: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	equipmentDesc?: string;

	memberId?: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}
@InputType()
export class PricesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class PeriodsRange {
	@Field(() => Date)
	start: Date;

	@Field(() => Date)
	end: Date;
}

@InputType()
export class EIsearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsOptional()
	@Field(() => [EquipmentType], { nullable: true })
	typeList?: EquipmentType[];

	@IsOptional()
	@Field(() => PricesRange, { nullable: true })
	pricesRange?: PricesRange;

	@IsOptional()
	@Field(() => PeriodsRange, { nullable: true })
	periodsRange?: PeriodsRange;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class EquipmentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableEquipmentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => EIsearch)
	search: EIsearch;
}

@InputType()
class AEIsearch {
	@IsOptional()
	@Field(() => EquipmentStatus, { nullable: true })
	equipmentStatus?: EquipmentStatus;
}
@InputType()
export class AgentEquipmentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableEquipmentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AEIsearch)
	search: AEIsearch;
}

@InputType()
class ALEIsearch {
	@IsOptional()
	@Field(() => EquipmentStatus, { nullable: true })
	equipmentStatus?: EquipmentStatus;
}
@InputType()
export class AllEquipmentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableEquipmentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ALEIsearch)
	search: ALEIsearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
