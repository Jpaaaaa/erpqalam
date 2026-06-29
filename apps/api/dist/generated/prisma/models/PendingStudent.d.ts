import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type PendingStudentModel = runtime.Types.Result.DefaultSelection<Prisma.$PendingStudentPayload>;
export type AggregatePendingStudent = {
    _count: PendingStudentCountAggregateOutputType | null;
    _min: PendingStudentMinAggregateOutputType | null;
    _max: PendingStudentMaxAggregateOutputType | null;
};
export type PendingStudentMinAggregateOutputType = {
    id: string | null;
    firstName: string | null;
    secondName: string | null;
    thirdName: string | null;
    fourthName: string | null;
    section: string | null;
    guardianInfo: string | null;
    comeViaWho: string | null;
    schoolId: string | null;
    submittedByUserId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PendingStudentMaxAggregateOutputType = {
    id: string | null;
    firstName: string | null;
    secondName: string | null;
    thirdName: string | null;
    fourthName: string | null;
    section: string | null;
    guardianInfo: string | null;
    comeViaWho: string | null;
    schoolId: string | null;
    submittedByUserId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PendingStudentCountAggregateOutputType = {
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
    submittedByUserId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type PendingStudentMinAggregateInputType = {
    id?: true;
    firstName?: true;
    secondName?: true;
    thirdName?: true;
    fourthName?: true;
    section?: true;
    guardianInfo?: true;
    comeViaWho?: true;
    schoolId?: true;
    submittedByUserId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PendingStudentMaxAggregateInputType = {
    id?: true;
    firstName?: true;
    secondName?: true;
    thirdName?: true;
    fourthName?: true;
    section?: true;
    guardianInfo?: true;
    comeViaWho?: true;
    schoolId?: true;
    submittedByUserId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PendingStudentCountAggregateInputType = {
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
    submittedByUserId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type PendingStudentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PendingStudentWhereInput;
    orderBy?: Prisma.PendingStudentOrderByWithRelationInput | Prisma.PendingStudentOrderByWithRelationInput[];
    cursor?: Prisma.PendingStudentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PendingStudentCountAggregateInputType;
    _min?: PendingStudentMinAggregateInputType;
    _max?: PendingStudentMaxAggregateInputType;
};
export type GetPendingStudentAggregateType<T extends PendingStudentAggregateArgs> = {
    [P in keyof T & keyof AggregatePendingStudent]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePendingStudent[P]> : Prisma.GetScalarType<T[P], AggregatePendingStudent[P]>;
};
export type PendingStudentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PendingStudentWhereInput;
    orderBy?: Prisma.PendingStudentOrderByWithAggregationInput | Prisma.PendingStudentOrderByWithAggregationInput[];
    by: Prisma.PendingStudentScalarFieldEnum[] | Prisma.PendingStudentScalarFieldEnum;
    having?: Prisma.PendingStudentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PendingStudentCountAggregateInputType | true;
    _min?: PendingStudentMinAggregateInputType;
    _max?: PendingStudentMaxAggregateInputType;
};
export type PendingStudentGroupByOutputType = {
    id: string;
    firstName: string;
    secondName: string;
    thirdName: string | null;
    fourthName: string | null;
    section: string | null;
    phoneNumbers: string[];
    guardianInfo: string | null;
    comeViaWho: string | null;
    schoolId: string;
    submittedByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: PendingStudentCountAggregateOutputType | null;
    _min: PendingStudentMinAggregateOutputType | null;
    _max: PendingStudentMaxAggregateOutputType | null;
};
export type GetPendingStudentGroupByPayload<T extends PendingStudentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PendingStudentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PendingStudentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PendingStudentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PendingStudentGroupByOutputType[P]>;
}>>;
export type PendingStudentWhereInput = {
    AND?: Prisma.PendingStudentWhereInput | Prisma.PendingStudentWhereInput[];
    OR?: Prisma.PendingStudentWhereInput[];
    NOT?: Prisma.PendingStudentWhereInput | Prisma.PendingStudentWhereInput[];
    id?: Prisma.StringFilter<"PendingStudent"> | string;
    firstName?: Prisma.StringFilter<"PendingStudent"> | string;
    secondName?: Prisma.StringFilter<"PendingStudent"> | string;
    thirdName?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    fourthName?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    section?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    phoneNumbers?: Prisma.StringNullableListFilter<"PendingStudent">;
    guardianInfo?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    comeViaWho?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    schoolId?: Prisma.StringFilter<"PendingStudent"> | string;
    submittedByUserId?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"PendingStudent"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PendingStudent"> | Date | string;
    school?: Prisma.XOR<Prisma.SchoolScalarRelationFilter, Prisma.SchoolWhereInput>;
    submittedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type PendingStudentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrderInput | Prisma.SortOrder;
    fourthName?: Prisma.SortOrderInput | Prisma.SortOrder;
    section?: Prisma.SortOrderInput | Prisma.SortOrder;
    phoneNumbers?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrderInput | Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrderInput | Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    submittedByUserId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    school?: Prisma.SchoolOrderByWithRelationInput;
    submittedBy?: Prisma.UserOrderByWithRelationInput;
};
export type PendingStudentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PendingStudentWhereInput | Prisma.PendingStudentWhereInput[];
    OR?: Prisma.PendingStudentWhereInput[];
    NOT?: Prisma.PendingStudentWhereInput | Prisma.PendingStudentWhereInput[];
    firstName?: Prisma.StringFilter<"PendingStudent"> | string;
    secondName?: Prisma.StringFilter<"PendingStudent"> | string;
    thirdName?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    fourthName?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    section?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    phoneNumbers?: Prisma.StringNullableListFilter<"PendingStudent">;
    guardianInfo?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    comeViaWho?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    schoolId?: Prisma.StringFilter<"PendingStudent"> | string;
    submittedByUserId?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"PendingStudent"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PendingStudent"> | Date | string;
    school?: Prisma.XOR<Prisma.SchoolScalarRelationFilter, Prisma.SchoolWhereInput>;
    submittedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id">;
export type PendingStudentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrderInput | Prisma.SortOrder;
    fourthName?: Prisma.SortOrderInput | Prisma.SortOrder;
    section?: Prisma.SortOrderInput | Prisma.SortOrder;
    phoneNumbers?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrderInput | Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrderInput | Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    submittedByUserId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.PendingStudentCountOrderByAggregateInput;
    _max?: Prisma.PendingStudentMaxOrderByAggregateInput;
    _min?: Prisma.PendingStudentMinOrderByAggregateInput;
};
export type PendingStudentScalarWhereWithAggregatesInput = {
    AND?: Prisma.PendingStudentScalarWhereWithAggregatesInput | Prisma.PendingStudentScalarWhereWithAggregatesInput[];
    OR?: Prisma.PendingStudentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PendingStudentScalarWhereWithAggregatesInput | Prisma.PendingStudentScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"PendingStudent"> | string;
    firstName?: Prisma.StringWithAggregatesFilter<"PendingStudent"> | string;
    secondName?: Prisma.StringWithAggregatesFilter<"PendingStudent"> | string;
    thirdName?: Prisma.StringNullableWithAggregatesFilter<"PendingStudent"> | string | null;
    fourthName?: Prisma.StringNullableWithAggregatesFilter<"PendingStudent"> | string | null;
    section?: Prisma.StringNullableWithAggregatesFilter<"PendingStudent"> | string | null;
    phoneNumbers?: Prisma.StringNullableListFilter<"PendingStudent">;
    guardianInfo?: Prisma.StringNullableWithAggregatesFilter<"PendingStudent"> | string | null;
    comeViaWho?: Prisma.StringNullableWithAggregatesFilter<"PendingStudent"> | string | null;
    schoolId?: Prisma.StringWithAggregatesFilter<"PendingStudent"> | string;
    submittedByUserId?: Prisma.StringNullableWithAggregatesFilter<"PendingStudent"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"PendingStudent"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"PendingStudent"> | Date | string;
};
export type PendingStudentCreateInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    school: Prisma.SchoolCreateNestedOneWithoutPendingStudentsInput;
    submittedBy?: Prisma.UserCreateNestedOneWithoutPendingSubmissionsInput;
};
export type PendingStudentUncheckedCreateInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    submittedByUserId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PendingStudentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    school?: Prisma.SchoolUpdateOneRequiredWithoutPendingStudentsNestedInput;
    submittedBy?: Prisma.UserUpdateOneWithoutPendingSubmissionsNestedInput;
};
export type PendingStudentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PendingStudentCreateManyInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    submittedByUserId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PendingStudentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PendingStudentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PendingStudentListRelationFilter = {
    every?: Prisma.PendingStudentWhereInput;
    some?: Prisma.PendingStudentWhereInput;
    none?: Prisma.PendingStudentWhereInput;
};
export type PendingStudentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type PendingStudentCountOrderByAggregateInput = {
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
    submittedByUserId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PendingStudentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrder;
    fourthName?: Prisma.SortOrder;
    section?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    submittedByUserId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PendingStudentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    secondName?: Prisma.SortOrder;
    thirdName?: Prisma.SortOrder;
    fourthName?: Prisma.SortOrder;
    section?: Prisma.SortOrder;
    guardianInfo?: Prisma.SortOrder;
    comeViaWho?: Prisma.SortOrder;
    schoolId?: Prisma.SortOrder;
    submittedByUserId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PendingStudentCreateNestedManyWithoutSchoolInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSchoolInput, Prisma.PendingStudentUncheckedCreateWithoutSchoolInput> | Prisma.PendingStudentCreateWithoutSchoolInput[] | Prisma.PendingStudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSchoolInput | Prisma.PendingStudentCreateOrConnectWithoutSchoolInput[];
    createMany?: Prisma.PendingStudentCreateManySchoolInputEnvelope;
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
};
export type PendingStudentUncheckedCreateNestedManyWithoutSchoolInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSchoolInput, Prisma.PendingStudentUncheckedCreateWithoutSchoolInput> | Prisma.PendingStudentCreateWithoutSchoolInput[] | Prisma.PendingStudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSchoolInput | Prisma.PendingStudentCreateOrConnectWithoutSchoolInput[];
    createMany?: Prisma.PendingStudentCreateManySchoolInputEnvelope;
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
};
export type PendingStudentUpdateManyWithoutSchoolNestedInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSchoolInput, Prisma.PendingStudentUncheckedCreateWithoutSchoolInput> | Prisma.PendingStudentCreateWithoutSchoolInput[] | Prisma.PendingStudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSchoolInput | Prisma.PendingStudentCreateOrConnectWithoutSchoolInput[];
    upsert?: Prisma.PendingStudentUpsertWithWhereUniqueWithoutSchoolInput | Prisma.PendingStudentUpsertWithWhereUniqueWithoutSchoolInput[];
    createMany?: Prisma.PendingStudentCreateManySchoolInputEnvelope;
    set?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    disconnect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    delete?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    update?: Prisma.PendingStudentUpdateWithWhereUniqueWithoutSchoolInput | Prisma.PendingStudentUpdateWithWhereUniqueWithoutSchoolInput[];
    updateMany?: Prisma.PendingStudentUpdateManyWithWhereWithoutSchoolInput | Prisma.PendingStudentUpdateManyWithWhereWithoutSchoolInput[];
    deleteMany?: Prisma.PendingStudentScalarWhereInput | Prisma.PendingStudentScalarWhereInput[];
};
export type PendingStudentUncheckedUpdateManyWithoutSchoolNestedInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSchoolInput, Prisma.PendingStudentUncheckedCreateWithoutSchoolInput> | Prisma.PendingStudentCreateWithoutSchoolInput[] | Prisma.PendingStudentUncheckedCreateWithoutSchoolInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSchoolInput | Prisma.PendingStudentCreateOrConnectWithoutSchoolInput[];
    upsert?: Prisma.PendingStudentUpsertWithWhereUniqueWithoutSchoolInput | Prisma.PendingStudentUpsertWithWhereUniqueWithoutSchoolInput[];
    createMany?: Prisma.PendingStudentCreateManySchoolInputEnvelope;
    set?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    disconnect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    delete?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    update?: Prisma.PendingStudentUpdateWithWhereUniqueWithoutSchoolInput | Prisma.PendingStudentUpdateWithWhereUniqueWithoutSchoolInput[];
    updateMany?: Prisma.PendingStudentUpdateManyWithWhereWithoutSchoolInput | Prisma.PendingStudentUpdateManyWithWhereWithoutSchoolInput[];
    deleteMany?: Prisma.PendingStudentScalarWhereInput | Prisma.PendingStudentScalarWhereInput[];
};
export type PendingStudentCreatephoneNumbersInput = {
    set: string[];
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type PendingStudentUpdatephoneNumbersInput = {
    set?: string[];
    push?: string | string[];
};
export type PendingStudentCreateNestedManyWithoutSubmittedByInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput> | Prisma.PendingStudentCreateWithoutSubmittedByInput[] | Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput | Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput[];
    createMany?: Prisma.PendingStudentCreateManySubmittedByInputEnvelope;
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
};
export type PendingStudentUncheckedCreateNestedManyWithoutSubmittedByInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput> | Prisma.PendingStudentCreateWithoutSubmittedByInput[] | Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput | Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput[];
    createMany?: Prisma.PendingStudentCreateManySubmittedByInputEnvelope;
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
};
export type PendingStudentUpdateManyWithoutSubmittedByNestedInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput> | Prisma.PendingStudentCreateWithoutSubmittedByInput[] | Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput | Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput[];
    upsert?: Prisma.PendingStudentUpsertWithWhereUniqueWithoutSubmittedByInput | Prisma.PendingStudentUpsertWithWhereUniqueWithoutSubmittedByInput[];
    createMany?: Prisma.PendingStudentCreateManySubmittedByInputEnvelope;
    set?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    disconnect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    delete?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    update?: Prisma.PendingStudentUpdateWithWhereUniqueWithoutSubmittedByInput | Prisma.PendingStudentUpdateWithWhereUniqueWithoutSubmittedByInput[];
    updateMany?: Prisma.PendingStudentUpdateManyWithWhereWithoutSubmittedByInput | Prisma.PendingStudentUpdateManyWithWhereWithoutSubmittedByInput[];
    deleteMany?: Prisma.PendingStudentScalarWhereInput | Prisma.PendingStudentScalarWhereInput[];
};
export type PendingStudentUncheckedUpdateManyWithoutSubmittedByNestedInput = {
    create?: Prisma.XOR<Prisma.PendingStudentCreateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput> | Prisma.PendingStudentCreateWithoutSubmittedByInput[] | Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput[];
    connectOrCreate?: Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput | Prisma.PendingStudentCreateOrConnectWithoutSubmittedByInput[];
    upsert?: Prisma.PendingStudentUpsertWithWhereUniqueWithoutSubmittedByInput | Prisma.PendingStudentUpsertWithWhereUniqueWithoutSubmittedByInput[];
    createMany?: Prisma.PendingStudentCreateManySubmittedByInputEnvelope;
    set?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    disconnect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    delete?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    connect?: Prisma.PendingStudentWhereUniqueInput | Prisma.PendingStudentWhereUniqueInput[];
    update?: Prisma.PendingStudentUpdateWithWhereUniqueWithoutSubmittedByInput | Prisma.PendingStudentUpdateWithWhereUniqueWithoutSubmittedByInput[];
    updateMany?: Prisma.PendingStudentUpdateManyWithWhereWithoutSubmittedByInput | Prisma.PendingStudentUpdateManyWithWhereWithoutSubmittedByInput[];
    deleteMany?: Prisma.PendingStudentScalarWhereInput | Prisma.PendingStudentScalarWhereInput[];
};
export type PendingStudentCreateWithoutSchoolInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    submittedBy?: Prisma.UserCreateNestedOneWithoutPendingSubmissionsInput;
};
export type PendingStudentUncheckedCreateWithoutSchoolInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    submittedByUserId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PendingStudentCreateOrConnectWithoutSchoolInput = {
    where: Prisma.PendingStudentWhereUniqueInput;
    create: Prisma.XOR<Prisma.PendingStudentCreateWithoutSchoolInput, Prisma.PendingStudentUncheckedCreateWithoutSchoolInput>;
};
export type PendingStudentCreateManySchoolInputEnvelope = {
    data: Prisma.PendingStudentCreateManySchoolInput | Prisma.PendingStudentCreateManySchoolInput[];
    skipDuplicates?: boolean;
};
export type PendingStudentUpsertWithWhereUniqueWithoutSchoolInput = {
    where: Prisma.PendingStudentWhereUniqueInput;
    update: Prisma.XOR<Prisma.PendingStudentUpdateWithoutSchoolInput, Prisma.PendingStudentUncheckedUpdateWithoutSchoolInput>;
    create: Prisma.XOR<Prisma.PendingStudentCreateWithoutSchoolInput, Prisma.PendingStudentUncheckedCreateWithoutSchoolInput>;
};
export type PendingStudentUpdateWithWhereUniqueWithoutSchoolInput = {
    where: Prisma.PendingStudentWhereUniqueInput;
    data: Prisma.XOR<Prisma.PendingStudentUpdateWithoutSchoolInput, Prisma.PendingStudentUncheckedUpdateWithoutSchoolInput>;
};
export type PendingStudentUpdateManyWithWhereWithoutSchoolInput = {
    where: Prisma.PendingStudentScalarWhereInput;
    data: Prisma.XOR<Prisma.PendingStudentUpdateManyMutationInput, Prisma.PendingStudentUncheckedUpdateManyWithoutSchoolInput>;
};
export type PendingStudentScalarWhereInput = {
    AND?: Prisma.PendingStudentScalarWhereInput | Prisma.PendingStudentScalarWhereInput[];
    OR?: Prisma.PendingStudentScalarWhereInput[];
    NOT?: Prisma.PendingStudentScalarWhereInput | Prisma.PendingStudentScalarWhereInput[];
    id?: Prisma.StringFilter<"PendingStudent"> | string;
    firstName?: Prisma.StringFilter<"PendingStudent"> | string;
    secondName?: Prisma.StringFilter<"PendingStudent"> | string;
    thirdName?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    fourthName?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    section?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    phoneNumbers?: Prisma.StringNullableListFilter<"PendingStudent">;
    guardianInfo?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    comeViaWho?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    schoolId?: Prisma.StringFilter<"PendingStudent"> | string;
    submittedByUserId?: Prisma.StringNullableFilter<"PendingStudent"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"PendingStudent"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PendingStudent"> | Date | string;
};
export type PendingStudentCreateWithoutSubmittedByInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    school: Prisma.SchoolCreateNestedOneWithoutPendingStudentsInput;
};
export type PendingStudentUncheckedCreateWithoutSubmittedByInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PendingStudentCreateOrConnectWithoutSubmittedByInput = {
    where: Prisma.PendingStudentWhereUniqueInput;
    create: Prisma.XOR<Prisma.PendingStudentCreateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput>;
};
export type PendingStudentCreateManySubmittedByInputEnvelope = {
    data: Prisma.PendingStudentCreateManySubmittedByInput | Prisma.PendingStudentCreateManySubmittedByInput[];
    skipDuplicates?: boolean;
};
export type PendingStudentUpsertWithWhereUniqueWithoutSubmittedByInput = {
    where: Prisma.PendingStudentWhereUniqueInput;
    update: Prisma.XOR<Prisma.PendingStudentUpdateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedUpdateWithoutSubmittedByInput>;
    create: Prisma.XOR<Prisma.PendingStudentCreateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedCreateWithoutSubmittedByInput>;
};
export type PendingStudentUpdateWithWhereUniqueWithoutSubmittedByInput = {
    where: Prisma.PendingStudentWhereUniqueInput;
    data: Prisma.XOR<Prisma.PendingStudentUpdateWithoutSubmittedByInput, Prisma.PendingStudentUncheckedUpdateWithoutSubmittedByInput>;
};
export type PendingStudentUpdateManyWithWhereWithoutSubmittedByInput = {
    where: Prisma.PendingStudentScalarWhereInput;
    data: Prisma.XOR<Prisma.PendingStudentUpdateManyMutationInput, Prisma.PendingStudentUncheckedUpdateManyWithoutSubmittedByInput>;
};
export type PendingStudentCreateManySchoolInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    submittedByUserId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PendingStudentUpdateWithoutSchoolInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    submittedBy?: Prisma.UserUpdateOneWithoutPendingSubmissionsNestedInput;
};
export type PendingStudentUncheckedUpdateWithoutSchoolInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    submittedByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PendingStudentUncheckedUpdateManyWithoutSchoolInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    submittedByUserId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PendingStudentCreateManySubmittedByInput = {
    id?: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers?: Prisma.PendingStudentCreatephoneNumbersInput | string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PendingStudentUpdateWithoutSubmittedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    school?: Prisma.SchoolUpdateOneRequiredWithoutPendingStudentsNestedInput;
};
export type PendingStudentUncheckedUpdateWithoutSubmittedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PendingStudentUncheckedUpdateManyWithoutSubmittedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    firstName?: Prisma.StringFieldUpdateOperationsInput | string;
    secondName?: Prisma.StringFieldUpdateOperationsInput | string;
    thirdName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fourthName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    section?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phoneNumbers?: Prisma.PendingStudentUpdatephoneNumbersInput | string[];
    guardianInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    comeViaWho?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    schoolId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PendingStudentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
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
    submittedByUserId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    submittedBy?: boolean | Prisma.PendingStudent$submittedByArgs<ExtArgs>;
}, ExtArgs["result"]["pendingStudent"]>;
export type PendingStudentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
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
    submittedByUserId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    submittedBy?: boolean | Prisma.PendingStudent$submittedByArgs<ExtArgs>;
}, ExtArgs["result"]["pendingStudent"]>;
export type PendingStudentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
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
    submittedByUserId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    submittedBy?: boolean | Prisma.PendingStudent$submittedByArgs<ExtArgs>;
}, ExtArgs["result"]["pendingStudent"]>;
export type PendingStudentSelectScalar = {
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
    submittedByUserId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type PendingStudentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "firstName" | "secondName" | "thirdName" | "fourthName" | "section" | "phoneNumbers" | "guardianInfo" | "comeViaWho" | "schoolId" | "submittedByUserId" | "createdAt" | "updatedAt", ExtArgs["result"]["pendingStudent"]>;
export type PendingStudentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    submittedBy?: boolean | Prisma.PendingStudent$submittedByArgs<ExtArgs>;
};
export type PendingStudentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    submittedBy?: boolean | Prisma.PendingStudent$submittedByArgs<ExtArgs>;
};
export type PendingStudentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    school?: boolean | Prisma.SchoolDefaultArgs<ExtArgs>;
    submittedBy?: boolean | Prisma.PendingStudent$submittedByArgs<ExtArgs>;
};
export type $PendingStudentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PendingStudent";
    objects: {
        school: Prisma.$SchoolPayload<ExtArgs>;
        submittedBy: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        firstName: string;
        secondName: string;
        thirdName: string | null;
        fourthName: string | null;
        section: string | null;
        phoneNumbers: string[];
        guardianInfo: string | null;
        comeViaWho: string | null;
        schoolId: string;
        submittedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["pendingStudent"]>;
    composites: {};
};
export type PendingStudentGetPayload<S extends boolean | null | undefined | PendingStudentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload, S>;
export type PendingStudentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PendingStudentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PendingStudentCountAggregateInputType | true;
};
export interface PendingStudentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PendingStudent'];
        meta: {
            name: 'PendingStudent';
        };
    };
    findUnique<T extends PendingStudentFindUniqueArgs>(args: Prisma.SelectSubset<T, PendingStudentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PendingStudentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PendingStudentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PendingStudentFindFirstArgs>(args?: Prisma.SelectSubset<T, PendingStudentFindFirstArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PendingStudentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PendingStudentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PendingStudentFindManyArgs>(args?: Prisma.SelectSubset<T, PendingStudentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PendingStudentCreateArgs>(args: Prisma.SelectSubset<T, PendingStudentCreateArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PendingStudentCreateManyArgs>(args?: Prisma.SelectSubset<T, PendingStudentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PendingStudentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PendingStudentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PendingStudentDeleteArgs>(args: Prisma.SelectSubset<T, PendingStudentDeleteArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PendingStudentUpdateArgs>(args: Prisma.SelectSubset<T, PendingStudentUpdateArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PendingStudentDeleteManyArgs>(args?: Prisma.SelectSubset<T, PendingStudentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PendingStudentUpdateManyArgs>(args: Prisma.SelectSubset<T, PendingStudentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PendingStudentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PendingStudentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PendingStudentUpsertArgs>(args: Prisma.SelectSubset<T, PendingStudentUpsertArgs<ExtArgs>>): Prisma.Prisma__PendingStudentClient<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PendingStudentCountArgs>(args?: Prisma.Subset<T, PendingStudentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PendingStudentCountAggregateOutputType> : number>;
    aggregate<T extends PendingStudentAggregateArgs>(args: Prisma.Subset<T, PendingStudentAggregateArgs>): Prisma.PrismaPromise<GetPendingStudentAggregateType<T>>;
    groupBy<T extends PendingStudentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PendingStudentGroupByArgs['orderBy'];
    } : {
        orderBy?: PendingStudentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PendingStudentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPendingStudentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PendingStudentFieldRefs;
}
export interface Prisma__PendingStudentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    school<T extends Prisma.SchoolDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SchoolDefaultArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    submittedBy<T extends Prisma.PendingStudent$submittedByArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PendingStudent$submittedByArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PendingStudentFieldRefs {
    readonly id: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly firstName: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly secondName: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly thirdName: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly fourthName: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly section: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly phoneNumbers: Prisma.FieldRef<"PendingStudent", 'String[]'>;
    readonly guardianInfo: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly comeViaWho: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly schoolId: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly submittedByUserId: Prisma.FieldRef<"PendingStudent", 'String'>;
    readonly createdAt: Prisma.FieldRef<"PendingStudent", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"PendingStudent", 'DateTime'>;
}
export type PendingStudentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    where: Prisma.PendingStudentWhereUniqueInput;
};
export type PendingStudentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    where: Prisma.PendingStudentWhereUniqueInput;
};
export type PendingStudentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    where?: Prisma.PendingStudentWhereInput;
    orderBy?: Prisma.PendingStudentOrderByWithRelationInput | Prisma.PendingStudentOrderByWithRelationInput[];
    cursor?: Prisma.PendingStudentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PendingStudentScalarFieldEnum | Prisma.PendingStudentScalarFieldEnum[];
};
export type PendingStudentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    where?: Prisma.PendingStudentWhereInput;
    orderBy?: Prisma.PendingStudentOrderByWithRelationInput | Prisma.PendingStudentOrderByWithRelationInput[];
    cursor?: Prisma.PendingStudentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PendingStudentScalarFieldEnum | Prisma.PendingStudentScalarFieldEnum[];
};
export type PendingStudentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    where?: Prisma.PendingStudentWhereInput;
    orderBy?: Prisma.PendingStudentOrderByWithRelationInput | Prisma.PendingStudentOrderByWithRelationInput[];
    cursor?: Prisma.PendingStudentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PendingStudentScalarFieldEnum | Prisma.PendingStudentScalarFieldEnum[];
};
export type PendingStudentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PendingStudentCreateInput, Prisma.PendingStudentUncheckedCreateInput>;
};
export type PendingStudentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PendingStudentCreateManyInput | Prisma.PendingStudentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PendingStudentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    data: Prisma.PendingStudentCreateManyInput | Prisma.PendingStudentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PendingStudentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PendingStudentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PendingStudentUpdateInput, Prisma.PendingStudentUncheckedUpdateInput>;
    where: Prisma.PendingStudentWhereUniqueInput;
};
export type PendingStudentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PendingStudentUpdateManyMutationInput, Prisma.PendingStudentUncheckedUpdateManyInput>;
    where?: Prisma.PendingStudentWhereInput;
    limit?: number;
};
export type PendingStudentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PendingStudentUpdateManyMutationInput, Prisma.PendingStudentUncheckedUpdateManyInput>;
    where?: Prisma.PendingStudentWhereInput;
    limit?: number;
    include?: Prisma.PendingStudentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PendingStudentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    where: Prisma.PendingStudentWhereUniqueInput;
    create: Prisma.XOR<Prisma.PendingStudentCreateInput, Prisma.PendingStudentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PendingStudentUpdateInput, Prisma.PendingStudentUncheckedUpdateInput>;
};
export type PendingStudentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
    where: Prisma.PendingStudentWhereUniqueInput;
};
export type PendingStudentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PendingStudentWhereInput;
    limit?: number;
};
export type PendingStudent$submittedByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type PendingStudentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PendingStudentSelect<ExtArgs> | null;
    omit?: Prisma.PendingStudentOmit<ExtArgs> | null;
    include?: Prisma.PendingStudentInclude<ExtArgs> | null;
};
