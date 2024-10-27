import { registerEnumType } from '@nestjs/graphql';

export enum NoticeCategory {
	FAQ = 'FAQ',
	TERMS = 'TERMS',
}
registerEnumType(NoticeCategory, {
	name: 'NoticeCategory',
});

export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(NoticeStatus, {
	name: 'NoticeStatus',
});

export enum NoticeTopic {
	PROPERTY = 'PROPERTY',
	EQUIPMENT = 'EQUIPMENT',
	PAYMENT = 'PAYMENT',
	BUYERS = 'BUYERS',
	AGENTS = 'AGENTS',
	MEMBERSHIP = 'MEMBERSHIP',
	COMMUNITY = 'COMMUNITY',
	OTHER = 'OTHER',
}

registerEnumType(NoticeTopic, {
	name: 'NoticeTopic',
});
