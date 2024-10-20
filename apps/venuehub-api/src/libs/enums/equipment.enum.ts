import { registerEnumType } from '@nestjs/graphql';

export enum EquipmentType {
	SOUND_SYSTEM = 'SOUND_SYSTEM',
	LIGHTING = 'LIGHTING',
	STAGE = 'STAGE',
	AUDIO_VISUAL = 'AUDIO_VISUAL',
	PROJECTOR = 'PROJECTOR',
	MICROPHONE = 'MICROPHONE',
	DJ_SETUP = 'DJ_SETUP',
	VIDEO_CAMERA = 'VIDEO_CAMERA',
	FURNITURE = 'FURNITURE',
	DECORATION = 'DECORATION',
	GENERATOR = 'GENERATOR',
	TENT = 'TENT',
	HEATING_SYSTEM = 'HEATING_SYSTEM',
	COOLING_SYSTEM = 'COOLING_SYSTEM',
	FOOD_SERVING = 'FOOD_SERVING',
	DANCE_FLOOR = 'DANCE_FLOOR',
	PHOTO_BOOTH = 'PHOTO_BOOTH',
}
registerEnumType(EquipmentType, {
	name: 'EquipmentType',
});

export enum EquipmentStatus {
	ACTIVE = 'ACTIVE',
	RENT = 'RENT',
	MAINTENANCE = 'MAINTENANCE',
	RETIRED = 'RETIRED',
}
registerEnumType(EquipmentStatus, {
	name: 'EquipmentStatus',
});

export enum EquipmentCondition {
	NEW = 'NEW',
	GOOD = 'GOOD',
	FAIR = 'FAIR',
	DAMAGED = 'DAMAGED',
}
registerEnumType(EquipmentCondition, {
	name: 'EquipmentCondition',
});
