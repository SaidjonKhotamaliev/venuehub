import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Equipments } from '../equipment/equipment';
import { Properties } from '../property/property';
import { TotalCounter } from '../member/member';

@ObjectType()
export class FavoriteResponse {
	@Field(() => Properties, { nullable: true })
	properties?: Properties;

	@Field(() => Equipments, { nullable: true })
	equipments?: Equipments;

	@Field(() => TotalCounter, { nullable: true })
	metaCounter?: TotalCounter;
}
