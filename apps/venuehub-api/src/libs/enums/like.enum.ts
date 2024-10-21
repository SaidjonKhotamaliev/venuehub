import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	MEMBER = 'MEMBER',
	PROPERTY = 'PROPERTY',
	ARTICLE = 'ARTICLE',
	EQUIPMENT = 'EQUIPMENT',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
