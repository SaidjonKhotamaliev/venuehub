import { ObjectId } from 'mongoose';
import { Equipments } from '../dto/equipment/equipment';
import { Properties } from '../dto/property/property';

export interface T {
	[key: string]: any;
}

export interface StatisticModifier {
	_id: ObjectId;
	targetKey: string;
	modifier: number;
}
