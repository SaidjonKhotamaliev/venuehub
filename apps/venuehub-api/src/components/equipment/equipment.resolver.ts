import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';
import { EquipmentInput, EquipmentsInquiry } from '../../libs/dto/equipment/equipment.input';
import { EquipmentUpdate } from '../../libs/dto/equipment/equipment.update';
import { FavoriteResponse } from '../../libs/dto/favorite-response/favorite-response';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	OrdinaryInquiry,
	PropertiesInquiry,
} from '../../libs/dto/property/property.input';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { EquipmentService } from './equipment.service';

@Resolver()
export class EquipmentResolver {
	constructor(private readonly equipmentService: EquipmentService) {}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Equipment)
	public async createEquipment(
		@Args('input') input: EquipmentInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Equipment> {
		console.log('Mutation, createEquipment');
		input.memberId = memberId;
		return await this.equipmentService.createEquipment(input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Equipment)
	public async getEquipment(
		@Args('equipmentId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Equipment> {
		console.log('Query, getEquipment');
		const equipmentId = shapeIntoMongoObjectId(input);
		return await this.equipmentService.getEquipment(memberId, equipmentId);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Equipment)
	public async updateEquipment(
		@Args('input') input: EquipmentUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Equipment> {
		console.log('Mutation, updateEquipment');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.equipmentService.updateEquipment(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Equipments)
	public async getEquipments(
		@Args('input') input: EquipmentsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Equipments> {
		console.log('Query, getEquipments');
		return await this.equipmentService.getEquipments(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => FavoriteResponse)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<FavoriteResponse> {
		console.log('Query, getFavorites');
		return await this.equipmentService.getFavorites(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => FavoriteResponse)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<FavoriteResponse> {
		console.log('Query, getVisited');
		return await this.equipmentService.getVisited(memberId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query((returns) => Properties)
	public async getAgentProperties(
		@Args('input') input: AgentPropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query, getAgentProperties');
		return await this.equipmentService.getAgentProperties(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Property)
	public async likeTargetProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('Mutation, likeTargetProperty');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.equipmentService.likeTargetProperty(memberId, likeRefId);
	}

	// ADMIN

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Properties)
	public async getAllPropertiesByAdmin(
		@Args('input') input: AllPropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query, getAllPropertiesByAdmin');
		return await this.equipmentService.getAllPropertiesByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Property)
	public async updatePropertyByAdmin(@Args('input') input: PropertyUpdate): Promise<Property> {
		console.log('Mutation, updatePropertyByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.equipmentService.updatePropertyByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Property)
	public async removePropertyByAdmin(@Args('propertyId') input: string): Promise<Property> {
		console.log('Mutation, removePropertyByAdmin');
		const propertyId = shapeIntoMongoObjectId(input);
		return await this.equipmentService.removePropertyByAdmin(propertyId);
	}
}
