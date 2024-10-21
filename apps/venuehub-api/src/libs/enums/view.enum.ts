import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
	EQUIPMENT = 'EQUIPMENT',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
