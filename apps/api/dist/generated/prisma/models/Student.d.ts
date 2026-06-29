import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type StudentModel = runtime.Types.Result.DefaultSelection<Prisma.$StudentPayload>;
export type AggregateStudent = {
    _count: StudentCountAggregateOutputType | null;
    _min: StudentMinAggregateOutputType | null;
    _max: StudentMaxAggregateOutputType | null;
};
export type StudentMinAggregateOutputType = {
    id: string | null;
    firstName: string | null;
    secondName: string | null;
    thirdName: string | null;
    fourthName: string | null;
    section: string | null;
    guardianInfo: string | null;
    comeViaWho: string | null;
    schoolId: string | null;
    registeredByUserId: string | null;
    registeredAt: Date | null;
    pendingStudentId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StudentMaxAggregateOutputType = {
    id: string | null;
    firstName: string | null;
    secondName: string | null;
    thirdName: string | null;
    fourthName: string | null;
    section: string | null;
    guardianInfo: string | null;
    comeViaWho: string | null;
    schoolId: string | null;
    registeredByUserId: string | null;
    registeredAt: Date | null;
    pendingStudentId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StudentCountAggregateOutputType = {
    id: number;
    firstName: number;
    secondName: number;
    thirdName: number;
    fourthName: number;
    section: number;
    phoneNumbers: number;
    guardianInfo: number;
    comeViaWho: number;
    schoolId: number;
    registeredByUserId: number;
    registeredAt: number;
    pendingStudentId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type StudentMinAggregateInputType = {
    id?: true;
    firstName?: true;
    secondName?: true;
    thirdName?: true;
    fourthName?: true;
    section?: true;
    guardianInfo?: true;
    comeViaWho?: true;
    schoolId?: true;
    registeredByUserId?: true;
    registeredAt?: true;
    pendingStudentId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StudentMaxAggregateInputType = {
    id?: true;
    firstName?: true;
    secondName?: true;
    thirdName?: true;
    fourthName?: true;
    section?: true;
    guardianInfo?: true;
    comeViaWho?: true;
    schoolId?: true;
    registeredByUserId?: true;
    registeredAt?: true;
    pendingStudentId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StudentCountAggregateInputType = {
    id?: true;
    firstName?: true;
    secondName?: true;
    thirdName?: true;
    fourthName?: true;
    section?: true;
    phoneNumbers?: true;
    guardianInfo?: true;
    comeViaWho?: true;
    schoolId?: true;
    registeredByUserId?: true;
    registeredAt?: true;
    pendingStudentId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type StudentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput | Prisma.StudentOrderByWithRelationInput[];
    cursor?: Prisma.StudentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | StudentCountAggregateInputType;
    _min?: StudentMinAggregateInputType;
    _max?: StudentMaxAggregateInputType;
};
export type GetStudentAggregateType<T extends StudentAggregateArgs> = {
    [P in keyof T & keyof AggregateStudent]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateStudent[P]> : Prisma.GetScalarType<T[P], AggregateStudent[P]>;
};
export type StudentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithAggregationInput | Prisma.StudentOrderByWithAggregationInput[];
    by: Prisma.StudentScalarFieldEnum[] | Prisma.StudentScalarFieldEnum;
    having?: Prisma.StudentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StudentCountAggregateInputType | true;
    _min?: StudentMinAggregateInputType;
    _max?: StudentMaxAggregateInputType;
};
export type StudentGroupByOutputType = {
    id: string;
    firstName: string;
    secondName: string;
    thirdName: string | null;
    fourthName: string | null;
    section: string;
    phoneNumbers: string[];
    guardianInfo: string | null;
    comeViaWho: string | null;
    schoolId: string;
    registeredByUserId: string | null;
    registeredAt: Date;
    pendingStudentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: StudentCountAggregateOutputType | null;
    _min: StudentMinAggregateOutputType | null;
    _max: StudentMaxAggregateOutputType | null;
};
export type GetStudentGroupByPayload<T extends StudentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<StudentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof StudentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], StudentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], StudentGroupByOutputType[P]>;
}>>;
export type StudentWhereInput = {
    AND?: Prisma.StudentWhereInput | Prisma.StudentWhereInput[];
    OR?: Prisma.StudentWhereInput[];
    NOT?: Prisma.StudentWhereInput | Prisma.StudentWhereInput[];
    id?: Prisma.StringFilter<"Student"> | string;
    firstName?: Prisma.StringFilter<"Student"> | string;
    secondName?: Prisma.StringFilter<"Student"> | string;
    thirdName?: Prisma.StringNullableFilter<"Student"> | string | null;
    fourthName?: Prisma.StringNullableFilter<"Student"> | string | null;
    section?: Prisma.StringFilter<"Student"> | string;
    phoneNumbers?: Prisma.StringNullableListFilter<"Student">;
    guardianInfo?: Prisma.StringNullableFilter<"Student"> | string | null;
    comeViaWho?: Prisma.StringNullableFilter<"Student"> | string | null;
    schoolId?: Prisma.StringFilter<"Student"> | string;
    registeredByUserId?: Prisma.StringNullableFilter<"Student"> | string | null;
    registeredAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    pendingStudentId?: Prisma.StringNullableFilter<"Student"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    school?: Prisma.XOR<Prisma.SchoolScalarRelationFilter, Prisma.SchoolWhereInput>;
    registeredBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type StudentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrderInput | Prisma.SortOrder;
    fourthName?: Prisma.SortOrderInput | Prisma.SortOrder;
    section?: Prisma.SortOrder;
    phoneNumbers?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrderInput | Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrderInput | Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    registeredByUserId?: Prisma.SortOrderInput | Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    pendingStudentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    school?: Prisma.SchoolOrderByWithRelationInput;
    registeredBy?: Prisma.UserOrderByWithRelationInput;
};
export type StudentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    pendingStudentId?: string;
    AND?: Prisma.StudentWhereInput | Prisma.StudentWhereInput[];
    OR?: Prisma.StudentWhereInput[];
    NOT?: Prisma.StudentWhereInput | Prisma.StudentWhereInput[];
    firstName?: Prisma.StringFilter<"Student"> | string;
    secondName?: Prisma.StringFilter<"Student"> | string;
    thirdName?: Prisma.StringNullableFilter<"Student"> | string | null;
    fourthName?: Prisma.StringNullableFilter<"Student"> | string | null;
    section?: Prisma.StringFilter<"Student"> | string;
    phoneNumbers?: Prisma.StringNullableListFilter<"Student">;
    guardianInfo?: Prisma.StringNullableFilter<"Student"> | string | null;
    comeViaWho?: Prisma.StringNullableFilter<"Student"> | string | null;
    schoolId?: Prisma.StringFilter<"Student"> | string;
    registeredByUserId?: Prisma.StringNullableFilter<"Student"> | string | null;
    registeredAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    school?: Prisma.XOR<Prisma.SchoolScalarRelationFilter, Prisma.SchoolWhereInput>;
    registeredBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id" | "pendingStudentId">;
export type StudentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrderInput | Prisma.SortOrder;
    fourthName?: Prisma.SortOrderInput | Prisma.SortOrder;
    section?: Prisma.SortOrder;
    phoneNumbers?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrderInput | Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrderInput | Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    registeredByUserId?: Prisma.SortOrderInput | Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    pendingStudentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.StudentCountOrderByAggregateInput;
    _max?: Prisma.StudentMaxOrderByAggregateInput;
    _min?: Prisma.StudentMinOrderByAggregateInput;
};
export type StudentScalarWhereWithAggregatesInput = {
    AND?: Prisma.StudentScalarWhereWithAggregatesInput | Prisma.StudentScalarWhereWithAggregatesInput[];
    OR?: Prisma.StudentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.StudentScalarWhereWithAggregatesInput | Prisma.StudentScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Student"> | string;
    firstName?: Prisma.StringWithAggregatesFilter<"Student"> | string;
    secondName?: Prisma.StringWithAggregatesFilter<"Student"> | string;
    thirdName?: Prisma.StringNullableWithAggregatesFilter<"Student"> | string | null;
    fourthName?: Prisma.StringNullableWithAggregatesFilter<"Student"> | string | null;
    section?: Prisma.StringWithAggregatesFilter<"Student"> | string;
    phoneNumbers?: Prisma.StringNullableListFilter<"Student">;
    guardianInfo?: Prisma.StringNullableWithAggregatesFilter<"Student"> | string | null;
    comeViaWho?: Prisma.StringNullableWithAggregatesFilter<"Student"> | string | null;
    schoolId?: Prisma.StringWithAggregatesFilter<"Student"> | string;
    registeredByUserId?: Prisma.StringNullableWithAggregatesFilter<"Student"> | string | null;
    registeredAt?: Prisma.DateTimeWithAggregatesFilter<"Student"> | Date | string;
    pendingStudentId?: Prisma.StringNullableWithAggregatesFilter<"Student"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Student"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Student"> | Date | string;
};
export type StudentCreateInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    school: Prisma.SchoolCreateNestedOneWithoutStudentsInput;
    registeredBy?: Prisma.UserCreateNestedOneWithoutRegisteredStudentsInput;
};
export type StudentUncheckedCreateInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    registeredByUserId?: string | null;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StudentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    school?: Prisma.SchoolUpdateOneRequiredWithoutStudentsNestedInput;
    registeredBy?: Prisma.UserUpdateOneWithoutRegisteredStudentsNestedInput;
};
export type StudentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    registeredByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StudentCreateManyInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    registeredByUserId?: string | null;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StudentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StudentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    registeredByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StudentListRelationFilter = {
    every?: Prisma.StudentWhereInput;
    some?: Prisma.StudentWhereInput;
    none?: Prisma.StudentWhereInput;
};
export type StudentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StudentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrder;
    fourthName?: Prisma.SortOrder;
    section?: Prisma.SortOrder;
    phoneNumbers?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    registeredByUserId?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    pendingStudentId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StudentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrder;
    fourthName?: Prisma.SortOrder;
    section?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    registeredByUserId?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    pendingStudentId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StudentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrder;
    fourthName?: Prisma.SortOrder;
    section?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    registeredByUserId?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    pendingStudentId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StudentCreateNestedManyWithoutSchoolInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutSchoolInput, Prisma.StudentUncheckedCreateWithoutSchoolInput> | Prisma.StudentCreateWithoutSchoolInput[] | Prisma.StudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutSchoolInput | Prisma.StudentCreateOrConnectWithoutSchoolInput[];
    createMany?: Prisma.StudentCreateManySchoolInputEnvelope;
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
};
export type StudentUncheckedCreateNestedManyWithoutSchoolInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutSchoolInput, Prisma.StudentUncheckedCreateWithoutSchoolInput> | Prisma.StudentCreateWithoutSchoolInput[] | Prisma.StudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutSchoolInput | Prisma.StudentCreateOrConnectWithoutSchoolInput[];
    createMany?: Prisma.StudentCreateManySchoolInputEnvelope;
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
};
export type StudentUpdateManyWithoutSchoolNestedInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutSchoolInput, Prisma.StudentUncheckedCreateWithoutSchoolInput> | Prisma.StudentCreateWithoutSchoolInput[] | Prisma.StudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutSchoolInput | Prisma.StudentCreateOrConnectWithoutSchoolInput[];
    upsert?: Prisma.StudentUpsertWithWhereUniqueWithoutSchoolInput | Prisma.StudentUpsertWithWhereUniqueWithoutSchoolInput[];
    createMany?: Prisma.StudentCreateManySchoolInputEnvelope;
    set?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    disconnect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    delete?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    update?: Prisma.StudentUpdateWithWhereUniqueWithoutSchoolInput | Prisma.StudentUpdateWithWhereUniqueWithoutSchoolInput[];
    updateMany?: Prisma.StudentUpdateManyWithWhereWithoutSchoolInput | Prisma.StudentUpdateManyWithWhereWithoutSchoolInput[];
    deleteMany?: Prisma.StudentScalarWhereInput | Prisma.StudentScalarWhereInput[];
};
export type StudentUncheckedUpdateManyWithoutSchoolNestedInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutSchoolInput, Prisma.StudentUncheckedCreateWithoutSchoolInput> | Prisma.StudentCreateWithoutSchoolInput[] | Prisma.StudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutSchoolInput | Prisma.StudentCreateOrConnectWithoutSchoolInput[];
    upsert?: Prisma.StudentUpsertWithWhereUniqueWithoutSchoolInput | Prisma.StudentUpsertWithWhereUniqueWithoutSchoolInput[];
    createMany?: Prisma.StudentCreateManySchoolInputEnvelope;
    set?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    disconnect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    delete?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    update?: Prisma.StudentUpdateWithWhereUniqueWithoutSchoolInput | Prisma.StudentUpdateWithWhereUniqueWithoutSchoolInput[];
    updateMany?: Prisma.StudentUpdateManyWithWhereWithoutSchoolInput | Prisma.StudentUpdateManyWithWhereWithoutSchoolInput[];
    deleteMany?: Prisma.StudentScalarWhereInput | Prisma.StudentScalarWhereInput[];
};
export type StudentCreatephoneNumbersInput = {
    set: string[];
};
export type StudentUpdatephoneNumbersInput = {
    set?: string[];
    push?: string | string[];
};
export type StudentCreateNestedManyWithoutRegisteredByInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutRegisteredByInput, Prisma.StudentUncheckedCreateWithoutRegisteredByInput> | Prisma.StudentCreateWithoutRegisteredByInput[] | Prisma.StudentUncheckedCreateWithoutRegisteredByInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutRegisteredByInput | Prisma.StudentCreateOrConnectWithoutRegisteredByInput[];
    createMany?: Prisma.StudentCreateManyRegisteredByInputEnvelope;
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
};
export type StudentUncheckedCreateNestedManyWithoutRegisteredByInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutRegisteredByInput, Prisma.StudentUncheckedCreateWithoutRegisteredByInput> | Prisma.StudentCreateWithoutRegisteredByInput[] | Prisma.StudentUncheckedCreateWithoutRegisteredByInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutRegisteredByInput | Prisma.StudentCreateOrConnectWithoutRegisteredByInput[];
    createMany?: Prisma.StudentCreateManyRegisteredByInputEnvelope;
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
};
export type StudentUpdateManyWithoutRegisteredByNestedInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutRegisteredByInput, Prisma.StudentUncheckedCreateWithoutRegisteredByInput> | Prisma.StudentCreateWithoutRegisteredByInput[] | Prisma.StudentUncheckedCreateWithoutRegisteredByInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutRegisteredByInput | Prisma.StudentCreateOrConnectWithoutRegisteredByInput[];
    upsert?: Prisma.StudentUpsertWithWhereUniqueWithoutRegisteredByInput | Prisma.StudentUpsertWithWhereUniqueWithoutRegisteredByInput[];
    createMany?: Prisma.StudentCreateManyRegisteredByInputEnvelope;
    set?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    disconnect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    delete?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    update?: Prisma.StudentUpdateWithWhereUniqueWithoutRegisteredByInput | Prisma.StudentUpdateWithWhereUniqueWithoutRegisteredByInput[];
    updateMany?: Prisma.StudentUpdateManyWithWhereWithoutRegisteredByInput | Prisma.StudentUpdateManyWithWhereWithoutRegisteredByInput[];
    deleteMany?: Prisma.StudentScalarWhereInput | Prisma.StudentScalarWhereInput[];
};
export type StudentUncheckedUpdateManyWithoutRegisteredByNestedInput = {
    create?: Prisma.XOR<Prisma.StudentCreateWithoutRegisteredByInput, Prisma.StudentUncheckedCreateWithoutRegisteredByInput> | Prisma.StudentCreateWithoutRegisteredByInput[] | Prisma.StudentUncheckedCreateWithoutRegisteredByInput[];
    connectOrCreate?: Prisma.StudentCreateOrConnectWithoutRegisteredByInput | Prisma.StudentCreateOrConnectWithoutRegisteredByInput[];
    upsert?: Prisma.StudentUpsertWithWhereUniqueWithoutRegisteredByInput | Prisma.StudentUpsertWithWhereUniqueWithoutRegisteredByInput[];
    createMany?: Prisma.StudentCreateManyRegisteredByInputEnvelope;
    set?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    disconnect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    delete?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    connect?: Prisma.StudentWhereUniqueInput | Prisma.StudentWhereUniqueInput[];
    update?: Prisma.StudentUpdateWithWhereUniqueWithoutRegisteredByInput | Prisma.StudentUpdateWithWhereUniqueWithoutRegisteredByInput[];
    updateMany?: Prisma.StudentUpdateManyWithWhereWithoutRegisteredByInput | Prisma.StudentUpdateManyWithWhereWithoutRegisteredByInput[];
    deleteMany?: Prisma.StudentScalarWhereInput | Prisma.StudentScalarWhereInput[];
};
export type StudentCreateWithoutSchoolInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    registeredBy?: Prisma.UserCreateNestedOneWithoutRegisteredStudentsInput;
};
export type StudentUncheckedCreateWithoutSchoolInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    registeredByUserId?: string | null;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StudentCreateOrConnectWithoutSchoolInput = {
    where: Prisma.StudentWhereUniqueInput;
    create: Prisma.XOR<Prisma.StudentCreateWithoutSchoolInput, Prisma.StudentUncheckedCreateWithoutSchoolInput>;
};
export type StudentCreateManySchoolInputEnvelope = {
    data: Prisma.StudentCreateManySchoolInput | Prisma.StudentCreateManySchoolInput[];
    skipDuplicates?: boolean;
};
export type StudentUpsertWithWhereUniqueWithoutSchoolInput = {
    where: Prisma.StudentWhereUniqueInput;
    update: Prisma.XOR<Prisma.StudentUpdateWithoutSchoolInput, Prisma.StudentUncheckedUpdateWithoutSchoolInput>;
    create: Prisma.XOR<Prisma.StudentCreateWithoutSchoolInput, Prisma.StudentUncheckedCreateWithoutSchoolInput>;
};
export type StudentUpdateWithWhereUniqueWithoutSchoolInput = {
    where: Prisma.StudentWhereUniqueInput;
    data: Prisma.XOR<Prisma.StudentUpdateWithoutSchoolInput, Prisma.StudentUncheckedUpdateWithoutSchoolInput>;
};
export type StudentUpdateManyWithWhereWithoutSchoolInput = {
    where: Prisma.StudentScalarWhereInput;
    data: Prisma.XOR<Prisma.StudentUpdateManyMutationInput, Prisma.StudentUncheckedUpdateManyWithoutSchoolInput>;
};
export type StudentScalarWhereInput = {
    AND?: Prisma.StudentScalarWhereInput | Prisma.StudentScalarWhereInput[];
    OR?: Prisma.StudentScalarWhereInput[];
    NOT?: Prisma.StudentScalarWhereInput | Prisma.StudentScalarWhereInput[];
    id?: Prisma.StringFilter<"Student"> | string;
    firstName?: Prisma.StringFilter<"Student"> | string;
    secondName?: Prisma.StringFilter<"Student"> | string;
    thirdName?: Prisma.StringNullableFilter<"Student"> | string | null;
    fourthName?: Prisma.StringNullableFilter<"Student"> | string | null;
    section?: Prisma.StringFilter<"Student"> | string;
    phoneNumbers?: Prisma.StringNullableListFilter<"Student">;
    guardianInfo?: Prisma.StringNullableFilter<"Student"> | string | null;
    comeViaWho?: Prisma.StringNullableFilter<"Student"> | string | null;
    schoolId?: Prisma.StringFilter<"Student"> | string;
    registeredByUserId?: Prisma.StringNullableFilter<"Student"> | string | null;
    registeredAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    pendingStudentId?: Prisma.StringNullableFilter<"Student"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Student"> | Date | string;
};
export type StudentCreateWithoutRegisteredByInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    school: Prisma.SchoolCreateNestedOneWithoutStudentsInput;
};
export type StudentUncheckedCreateWithoutRegisteredByInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StudentCreateOrConnectWithoutRegisteredByInput = {
    where: Prisma.StudentWhereUniqueInput;
    create: Prisma.XOR<Prisma.StudentCreateWithoutRegisteredByInput, Prisma.StudentUncheckedCreateWithoutRegisteredByInput>;
};
export type StudentCreateManyRegisteredByInputEnvelope = {
    data: Prisma.StudentCreateManyRegisteredByInput | Prisma.StudentCreateManyRegisteredByInput[];
    skipDuplicates?: boolean;
};
export type StudentUpsertWithWhereUniqueWithoutRegisteredByInput = {
    where: Prisma.StudentWhereUniqueInput;
    update: Prisma.XOR<Prisma.StudentUpdateWithoutRegisteredByInput, Prisma.StudentUncheckedUpdateWithoutRegisteredByInput>;
    create: Prisma.XOR<Prisma.StudentCreateWithoutRegisteredByInput, Prisma.StudentUncheckedCreateWithoutRegisteredByInput>;
};
export type StudentUpdateWithWhereUniqueWithoutRegisteredByInput = {
    where: Prisma.StudentWhereUniqueInput;
    data: Prisma.XOR<Prisma.StudentUpdateWithoutRegisteredByInput, Prisma.StudentUncheckedUpdateWithoutRegisteredByInput>;
};
export type StudentUpdateManyWithWhereWithoutRegisteredByInput = {
    where: Prisma.StudentScalarWhereInput;
    data: Prisma.XOR<Prisma.StudentUpdateManyMutationInput, Prisma.StudentUncheckedUpdateManyWithoutRegisteredByInput>;
};
export type StudentCreateManySchoolInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    registeredByUserId?: string | null;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StudentUpdateWithoutSchoolInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    registeredBy?: Prisma.UserUpdateOneWithoutRegisteredStudentsNestedInput;
};
export type StudentUncheckedUpdateWithoutSchoolInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StudentUncheckedUpdateManyWithoutSchoolInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StudentCreateManyRegisteredByInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers?: Prisma.StudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    registeredAt?: Date | string;
    pendingStudentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StudentUpdateWithoutRegisteredByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    school?: Prisma.SchoolUpdateOneRequiredWithoutStudentsNestedInput;
};
export type StudentUncheckedUpdateWithoutRegisteredByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StudentUncheckedUpdateManyWithoutRegisteredByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumbers?: Prisma.StudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    pendingStudentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StudentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    firstName?: boolean;
    secondName?: boolean;
    thirdName?: boolean;
    fourthName?: boolean;
    section?: boolean;
    phoneNumbers?: boolean;
    guardianInfo?: boolean;
    comeViaWho?: boolean;
    schoolId?: boolean;
    registeredByUserId?: boolean;
    registeredAt?: boolean;
    pendingStudentId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    registeredBy?: boolean | Prisma.Student$registeredByArgs<ExtArgs>;
}, ExtArgs["result"]["student"]>;
export type StudentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    firstName?: boolean;
    secondName?: boolean;
    thirdName?: boolean;
    fourthName?: boolean;
    section?: boolean;
    phoneNumbers?: boolean;
    guardianInfo?: boolean;
    comeViaWho?: boolean;
    schoolId?: boolean;
    registeredByUserId?: boolean;
    registeredAt?: boolean;
    pendingStudentId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    registeredBy?: boolean | Prisma.Student$registeredByArgs<ExtArgs>;
}, ExtArgs["result"]["student"]>;
export type StudentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    firstName?: boolean;
    secondName?: boolean;
    thirdName?: boolean;
    fourthName?: boolean;
    section?: boolean;
    phoneNumbers?: boolean;
    guardianInfo?: boolean;
    comeViaWho?: boolean;
    schoolId?: boolean;
    registeredByUserId?: boolean;
    registeredAt?: boolean;
    pendingStudentId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    registeredBy?: boolean | Prisma.Student$registeredByArgs<ExtArgs>;
}, ExtArgs["result"]["student"]>;
export type StudentSelectScalar = {
    id?: boolean;
    firstName?: boolean;
    secondName?: boolean;
    thirdName?: boolean;
    fourthName?: boolean;
    section?: boolean;
    phoneNumbers?: boolean;
    guardianInfo?: boolean;
    comeViaWho?: boolean;
    schoolId?: boolean;
    registeredByUserId?: boolean;
    registeredAt?: boolean;
    pendingStudentId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type StudentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "firstName" | "secondName" | "thirdName" | "fourthName" | "section" | "phoneNumbers" | "guardianInfo" | "comeViaWho" | "schoolId" | "registeredByUserId" | "registeredAt" | "pendingStudentId" | "createdAt" | "updatedAt", ExtArgs["result"]["student"]>;
export type StudentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    registeredBy?: boolean | Prisma.Student$registeredByArgs<ExtArgs>;
};
export type StudentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    registeredBy?: boolean | Prisma.Student$registeredByArgs<ExtArgs>;
};
export type StudentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    registeredBy?: boolean | Prisma.Student$registeredByArgs<ExtArgs>;
};
export type $StudentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Student";
    objects: {
        school: Prisma.$SchoolPayload<ExtArgs>;
        registeredBy: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        firstName: string;
        secondName: string;
        thirdName: string | null;
        fourthName: string | null;
        section: string;
        phoneNumbers: string[];
        guardianInfo: string | null;
        comeViaWho: string | null;
        schoolId: string;
        registeredByUserId: string | null;
        registeredAt: Date;
        pendingStudentId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["student"]>;
    composites: {};
};
export type StudentGetPayload<S extends boolean | null | undefined | StudentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$StudentPayload, S>;
export type StudentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<StudentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: StudentCountAggregateInputType | true;
};
export interface StudentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Student'];
        meta: {
            name: 'Student';
        };
    };
    findUnique<T extends StudentFindUniqueArgs>(args: Prisma.SelectSubset<T, StudentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends StudentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, StudentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends StudentFindFirstArgs>(args?: Prisma.SelectSubset<T, StudentFindFirstArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends StudentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, StudentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends StudentFindManyArgs>(args?: Prisma.SelectSubset<T, StudentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends StudentCreateArgs>(args: Prisma.SelectSubset<T, StudentCreateArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends StudentCreateManyArgs>(args?: Prisma.SelectSubset<T, StudentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends StudentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, StudentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends StudentDeleteArgs>(args: Prisma.SelectSubset<T, StudentDeleteArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends StudentUpdateArgs>(args: Prisma.SelectSubset<T, StudentUpdateArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends StudentDeleteManyArgs>(args?: Prisma.SelectSubset<T, StudentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends StudentUpdateManyArgs>(args: Prisma.SelectSubset<T, StudentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends StudentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, StudentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends StudentUpsertArgs>(args: Prisma.SelectSubset<T, StudentUpsertArgs<ExtArgs>>): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends StudentCountArgs>(args?: Prisma.Subset<T, StudentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], StudentCountAggregateOutputType> : number>;
    aggregate<T extends StudentAggregateArgs>(args: Prisma.Subset<T, StudentAggregateArgs>): Prisma.PrismaPromise<GetStudentAggregateType<T>>;
    groupBy<T extends StudentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: StudentGroupByArgs['orderBy'];
    } : {
        orderBy?: StudentGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, StudentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStudentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: StudentFieldRefs;
}
export interface Prisma__StudentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    school<T extends Prisma.SchoolDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SchoolDefaultArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    registeredBy<T extends Prisma.Student$registeredByArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Student$registeredByArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface StudentFieldRefs {
    readonly id: Prisma.FieldRef<"Student", 'String'>;
    readonly firstName: Prisma.FieldRef<"Student", 'String'>;
    readonly secondName: Prisma.FieldRef<"Student", 'String'>;
    readonly thirdName: Prisma.FieldRef<"Student", 'String'>;
    readonly fourthName: Prisma.FieldRef<"Student", 'String'>;
    readonly section: Prisma.FieldRef<"Student", 'String'>;
    readonly phoneNumbers: Prisma.FieldRef<"Student", 'String[]'>;
    readonly guardianInfo: Prisma.FieldRef<"Student", 'String'>;
    readonly comeViaWho: Prisma.FieldRef<"Student", 'String'>;
    readonly schoolId: Prisma.FieldRef<"Student", 'String'>;
    readonly registeredByUserId: Prisma.FieldRef<"Student", 'String'>;
    readonly registeredAt: Prisma.FieldRef<"Student", 'DateTime'>;
    readonly pendingStudentId: Prisma.FieldRef<"Student", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Student", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Student", 'DateTime'>;
}
export type StudentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    where: Prisma.StudentWhereUniqueInput;
};
export type StudentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    where: Prisma.StudentWhereUniqueInput;
};
export type StudentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput | Prisma.StudentOrderByWithRelationInput[];
    cursor?: Prisma.StudentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StudentScalarFieldEnum | Prisma.StudentScalarFieldEnum[];
};
export type StudentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput | Prisma.StudentOrderByWithRelationInput[];
    cursor?: Prisma.StudentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StudentScalarFieldEnum | Prisma.StudentScalarFieldEnum[];
};
export type StudentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput | Prisma.StudentOrderByWithRelationInput[];
    cursor?: Prisma.StudentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StudentScalarFieldEnum | Prisma.StudentScalarFieldEnum[];
};
export type StudentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StudentCreateInput, Prisma.StudentUncheckedCreateInput>;
};
export type StudentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.StudentCreateManyInput | Prisma.StudentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type StudentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    data: Prisma.StudentCreateManyInput | Prisma.StudentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.StudentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type StudentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StudentUpdateInput, Prisma.StudentUncheckedUpdateInput>;
    where: Prisma.StudentWhereUniqueInput;
};
export type StudentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.StudentUpdateManyMutationInput, Prisma.StudentUncheckedUpdateManyInput>;
    where?: Prisma.StudentWhereInput;
    limit?: number;
};
export type StudentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StudentUpdateManyMutationInput, Prisma.StudentUncheckedUpdateManyInput>;
    where?: Prisma.StudentWhereInput;
    limit?: number;
    include?: Prisma.StudentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type StudentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    where: Prisma.StudentWhereUniqueInput;
    create: Prisma.XOR<Prisma.StudentCreateInput, Prisma.StudentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.StudentUpdateInput, Prisma.StudentUncheckedUpdateInput>;
};
export type StudentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
    where: Prisma.StudentWhereUniqueInput;
};
export type StudentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StudentWhereInput;
    limit?: number;
};
export type Student$registeredByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type StudentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StudentSelect<ExtArgs> | null;
    omit?: Prisma.StudentOmit<ExtArgs> | null;
    include?: Prisma.StudentInclude<ExtArgs> | null;
};
