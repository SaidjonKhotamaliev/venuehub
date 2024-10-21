import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	FOLLOW = 'FOLLOW',
	CREATE = 'CREATE',
}
registerEnumType(NotificationType, {
	name: 'NotificationType',
});

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}
registerEnumType(NotificationStatus, {
	name: 'NotificationStatus',
});

export enum NotificationGroup {
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
	MEMBER = 'MEMBER',
	EQUIPMENT = 'EQUIPMENT',
}
registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
