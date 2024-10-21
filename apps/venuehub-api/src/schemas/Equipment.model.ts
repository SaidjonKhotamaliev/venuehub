import { Schema } from 'mongoose';
import { EquipmentStatus, EquipmentType } from '../libs/enums/equipment.enum';

const EquipmentSchema = new Schema(
	{
		equipmentType: {
			type: String,
			enum: EquipmentType,
			required: true,
		},

		equipmentStatus: {
			type: String,
			enum: EquipmentStatus,
			default: EquipmentStatus.ACTIVE,
		},

		equipmentTitle: {
			type: String,
			required: true,
		},

		equipmentRentPrice: {
			type: Number,
			required: true,
		},

		equipmentViews: {
			type: Number,
			default: 0,
		},

		equipmentLikes: {
			type: Number,
			default: 0,
		},

		equipmentComments: {
			type: Number,
			default: 0,
		},

		equipmentRank: {
			type: Number,
			default: 0,
		},

		equipmentImages: {
			type: [String],
			required: true,
		},

		equipmentDesc: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		rentedAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'equipments' },
);

EquipmentSchema.index({ equipmentType: 1, equipmentTitle: 1, equipmentRentPrice: 1 }, { unique: true });

export default EquipmentSchema;
