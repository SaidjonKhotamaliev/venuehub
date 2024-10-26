import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class NotificationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;
}
