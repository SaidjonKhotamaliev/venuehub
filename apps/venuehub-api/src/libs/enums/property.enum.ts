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
	RENT = 'RENT',
	DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyLocation {
	LONDON = 'LONDON',
	NORTH_EAST = 'NORTH_EAST',
	NORTH_WEST = 'NORTH_WEST',
	YORKSHIRE = 'YORKSHIRE',
	EAST_MIDLANDS = 'EAST_MIDLANDS',
	WEST_MIDLANDS = 'WEST_MIDLANDS',
	SOUTH_EAST = 'SOUTH_EAST',
	EAST_OF_ENGLAND = 'EAST_OF_ENGLAND',
	SOUTH_WEST = 'SOUTH_WEST',
}
registerEnumType(PropertyLocation, {
	name: 'PropertyLocation',
});
