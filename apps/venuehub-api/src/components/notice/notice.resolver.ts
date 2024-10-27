import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Notice } from '../../libs/dto/notice/notice';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { NoticeInquiry, NoticeInquiryAgent, NoticeUpdate } from '../../libs/dto/notice/notice.inquiry';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { NoticeService } from './notice.service';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async createNotice(@Args('input') input: NoticeInput, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation, createNotice');
		input.memberId = memberId;
		return await this.noticeService.createNotice(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => [Notice])
	public async getNotices(
		@Args('input') input: NoticeInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notice[]> {
		console.log('Query, getNotices');
		return await this.noticeService.getNotices(input);
	}

	@Roles(MemberType.AGENT, MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => [Notice])
	public async getNoticesForAgentAndAdmins(
		@Args('input') input: NoticeInquiryAgent,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notice[]> {
		console.log('Query, getNoticesForAgentAndAdmins');
		return await this.noticeService.getNoticesForAgentAndAdmins(input);
	}

	@Roles(MemberType.AGENT, MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async updateNotice(
		@Args('input') input: NoticeUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notice> {
		console.log('Mutation, updateNotice');
		return await this.noticeService.updateNotice(input);
	}
}
