import { Module } from "@nestjs/common";
import { BatchController } from "./batch.controller";
import { VenueHubBatchService } from "./batch.service";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import PropertySchema from "apps/venuehub-api/src/schemas/Property.model";
import MemberSchema from "apps/venuehub-api/src/schemas/Member.model";

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: "Property", schema: PropertySchema }]),
    MongooseModule.forFeature([{ name: "Member", schema: MemberSchema }]),
  ],
  controllers: [BatchController],
  providers: [VenueHubBatchService],
})
export class VenueHubBatchModule {}
