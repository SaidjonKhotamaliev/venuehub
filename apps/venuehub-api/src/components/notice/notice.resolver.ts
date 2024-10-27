import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Notice } from '../../libs/dto/notice/notice';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
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
}
