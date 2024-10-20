import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
	WEDDING_VENUE = 'WEDDING_VENUE',
	CONFERENCE_HALL = 'CONFERENCE_HALL',
	BANQUET_HALL = 'BANQUET_HALL',
	OUTDOOR_GARDEN = 'OUTDOOR_GARDEN',
	EXIBITION_SPACE = 'EXIBITION_SPACE',
	CONCERT_HALL = 'CONCERT_HALL',
	THEATER = 'THEATER',
	RESORT_VENUE = 'RESORT_VENUE',
	SEMINAR_ROOM = 'SEMINAR_ROOM',
}
registerEnumType(PropertyType, {
	name: 'PropertyType',
});

export enum PropertyStatus {
	ACTIVE = 'ACTIVE',
	RENTED = 'RENTED',
	DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
registerEnumType(PropertyLocation, {
	name: 'PropertyLocation',
});
