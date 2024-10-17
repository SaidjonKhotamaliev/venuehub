import { registerEnumType } from '@nestjs/graphql';

export enum Message {
	SOMETHING_WENT_WRONG = 'Something went wrong!',
	NOT_DATA_FOUND = 'No data is found!',
	CREATE_FAILED = 'Create is failed!',
	UPDATE_FAILED = 'Update is failed!',
	BLOCKED_USER = 'You have been blocked, contact restaurant',

	USED_NICK_PHONE = 'You are using already used nick or phone number!',
	NO_MEMBER_NICK = 'No member with that member nick!',
	WRONG_PASSWORD = 'Wrong password, please try again!',
	NOT_AUTHENTICATED = 'You are not authenticated, please login first!',
	TOKEN_CREATION_FAILED = 'Token creation error',
	NOT_ONSALE_PRODUCT = 'You are trying to make a sale for NOT on sale product!',
	TOKEN_NOT_EXIST = 'Bearer token is not provided!',
	ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles!',
	UPLOAD_FAILED = 'UPLOAD_FAILED',
	PROVIDE_ALLOWED_FORMAT = 'PROVIDE_ALLOWED_FORMAT',
	NOT_ALLOWED_REQUEST = 'You cannot make a request',
	REMOVE_FAILED = 'Remove failed!',
	SELF_SUBSCRIPTION_DENIED = 'You can not subscribe yourself!',
	BAD_REQUEST = 'Bad request',
}

export enum Direction {
	ASC = 1,
	DESC = -1,
}
registerEnumType(Direction, { name: 'Direction' });
