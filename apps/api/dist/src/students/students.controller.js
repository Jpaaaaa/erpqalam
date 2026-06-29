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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("../../generated/prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const students_service_1 = require("./students.service");
const pending_students_service_1 = require("./pending-students.service");
const students_dto_1 = require("./dto/students.dto");
const pending_students_dto_1 = require("./dto/pending-students.dto");
let StudentsController = class StudentsController {
    constructor(studentsService, pendingStudentsService) {
        this.studentsService = studentsService;
        this.pendingStudentsService = pendingStudentsService;
    }
    createCheckIn(dto) {
        return this.pendingStudentsService.createCheckIn(dto);
    }
    createPending(dto, user) {
        return this.pendingStudentsService.create(dto, user);
    }
    listPending(query, user) {
        return this.pendingStudentsService.findAll(user, query);
    }
    updatePending(id, dto, user) {
        return this.pendingStudentsService.update(id, dto, user);
    }
    async approvePending(id, user) {
        const student = await this.pendingStudentsService.approve(id, user);
        return (0, students_service_1.toStudentResponse)(student);
    }
    findAll(query, user) {
        return this.studentsService.findAll(user, query);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Post)('students/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Public student check-in (minimal pending intake)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: pending_students_dto_1.PendingStudentResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pending_students_dto_1.CreatePendingStudentCheckInDto]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "createCheckIn", null);
__decorate([
    (0, common_1.Post)('pending-students'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)(client_1.UserPermission.STUDENT_REGISTRATION),
    (0, swagger_1.ApiOperation)({ summary: 'Staff: register a pending student with full details' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: pending_students_dto_1.PendingStudentResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pending_students_dto_1.CreatePendingStudentDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "createPending", null);
__decorate([
    (0, common_1.Get)('pending-students'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)(client_1.UserPermission.STUDENT_REGISTRATION),
    (0, swagger_1.ApiOperation)({ summary: 'List pending students for the school' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: pending_students_dto_1.PaginatedPendingStudentsResponseDto }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pending_students_dto_1.ListPendingStudentsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "listPending", null);
__decorate([
    (0, common_1.Patch)('pending-students/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)(client_1.UserPermission.STUDENT_REGISTRATION),
    (0, swagger_1.ApiOperation)({ summary: 'Update a pending student (e.g. complete check-in)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: pending_students_dto_1.PendingStudentResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pending_students_dto_1.UpdatePendingStudentDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "updatePending", null);
__decorate([
    (0, common_1.Patch)('pending-students/:id/approve'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)(client_1.UserPermission.STUDENT_REGISTRATION),
    (0, swagger_1.ApiOperation)({ summary: 'Approve pending student → enrolled Student record' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: students_dto_1.StudentResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "approvePending", null);
__decorate([
    (0, common_1.Get)('students'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)(client_1.UserPermission.STUDENT_REGISTRATION),
    (0, swagger_1.ApiOperation)({ summary: 'List registered (enrolled) students' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: students_dto_1.PaginatedStudentsResponseDto }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [students_dto_1.ListStudentsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findAll", null);
exports.StudentsController = StudentsController = __decorate([
    (0, swagger_1.ApiTags)('students'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [students_service_1.StudentsService,
        pending_students_service_1.PendingStudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map