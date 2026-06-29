"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedPendingStudentsResponseDto = exports.PendingStudentResponseDto = exports.StaffMemberDto = exports.ListPendingStudentsQueryDto = exports.UpdatePendingStudentDto = exports.CreatePendingStudentDto = exports.CreatePendingStudentCheckInDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreatePendingStudentCheckInDto {
}
exports.CreatePendingStudentCheckInDto = CreatePendingStudentCheckInDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ahmad' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentCheckInDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Karim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentCheckInDto.prototype, "secondName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School code for intake kiosk', example: 'QALAM001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentCheckInDto.prototype, "schoolCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Friend referral' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentCheckInDto.prototype, "comeViaWho", void 0);
class CreatePendingStudentDto {
}
exports.CreatePendingStudentDto = CreatePendingStudentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ahmad' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Karim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentDto.prototype, "secondName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hassan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentDto.prototype, "thirdName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ali' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentDto.prototype, "fourthName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Grade 5 / A', description: 'Class or section' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentDto.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['07701234567', '07501234567'],
        description: 'One or more mobile numbers',
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], CreatePendingStudentDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Father: Mohammed, works nearby',
        description: 'Parent/guardian info or notes',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePendingStudentDto.prototype, "guardianInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Referral from Ahmed / Facebook ad',
        description: 'How the student heard about the school or who referred them',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendingStudentDto.prototype, "comeViaWho", void 0);
class UpdatePendingStudentDto {
}
exports.UpdatePendingStudentDto = UpdatePendingStudentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePendingStudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePendingStudentDto.prototype, "secondName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePendingStudentDto.prototype, "thirdName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePendingStudentDto.prototype, "fourthName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePendingStudentDto.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], UpdatePendingStudentDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePendingStudentDto.prototype, "guardianInfo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePendingStudentDto.prototype, "comeViaWho", void 0);
class ListPendingStudentsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.ListPendingStudentsQueryDto = ListPendingStudentsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ListPendingStudentsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ListPendingStudentsQueryDto.prototype, "limit", void 0);
class StaffMemberDto {
}
exports.StaffMemberDto = StaffMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "lastName", void 0);
class PendingStudentResponseDto {
}
exports.PendingStudentResponseDto = PendingStudentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingStudentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingStudentResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingStudentResponseDto.prototype, "secondName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], PendingStudentResponseDto.prototype, "thirdName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], PendingStudentResponseDto.prototype, "fourthName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], PendingStudentResponseDto.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], PendingStudentResponseDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], PendingStudentResponseDto.prototype, "guardianInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], PendingStudentResponseDto.prototype, "comeViaWho", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingStudentResponseDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], PendingStudentResponseDto.prototype, "submittedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: StaffMemberDto }),
    __metadata("design:type", Object)
], PendingStudentResponseDto.prototype, "submittedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PendingStudentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PendingStudentResponseDto.prototype, "updatedAt", void 0);
class PaginatedPendingStudentsResponseDto {
}
exports.PaginatedPendingStudentsResponseDto = PaginatedPendingStudentsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PendingStudentResponseDto] }),
    __metadata("design:type", Array)
], PaginatedPendingStudentsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPendingStudentsResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPendingStudentsResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPendingStudentsResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPendingStudentsResponseDto.prototype, "totalPages", void 0);
//# sourceMappingURL=pending-students.dto.js.map