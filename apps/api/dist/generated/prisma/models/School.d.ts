import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type SchoolModel = runtime.Types.Result.DefaultSelection<Prisma.$SchoolPayload>;
export type AggregateSchool = {
    _count: SchoolCountAggregateOutputType | null;
    _min: SchoolMinAggregateOutputType | null;
    _max: SchoolMaxAggregateOutputType | null;
};
export type SchoolMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    code: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SchoolMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    code: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SchoolCountAggregateOutputType = {
    id: number;
    name: number;
    code: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type SchoolMinAggregateInputType = {
    id?: true;
    name?: true;
    code?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SchoolMaxAggregateInputType = {
    id?: true;
    name?: true;
    code?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SchoolCountAggregateInputType = {
    id?: true;
    name?: true;
    code?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type SchoolAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SchoolWhereInput;
    orderBy?: Prisma.SchoolOrderByWithRelationInput | Prisma.SchoolOrderByWithRelationInput[];
    cursor?: Prisma.SchoolWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SchoolCountAggregateInputType;
    _min?: SchoolMinAggregateInputType;
    _max?: SchoolMaxAggregateInputType;
};
export type GetSchoolAggregateType<T extends SchoolAggregateArgs> = {
    [P in keyof T & keyof AggregateSchool]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSchool[P]> : Prisma.GetScalarType<T[P], AggregateSchool[P]>;
};
export type SchoolGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SchoolWhereInput;
    orderBy?: Prisma.SchoolOrderByWithAggregationInput | Prisma.SchoolOrderByWithAggregationInput[];
    by: Prisma.SchoolScalarFieldEnum[] | Prisma.SchoolScalarFieldEnum;
    having?: Prisma.SchoolScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SchoolCountAggregateInputType | true;
    _min?: SchoolMinAggregateInputType;
    _max?: SchoolMaxAggregateInputType;
};
export type SchoolGroupByOutputType = {
    id: string;
    name: string;
    code: string;
    createdAt: Date;
    updatedAt: Date;
    _count: SchoolCountAggregateOutputType | null;
    _min: SchoolMinAggregateOutputType | null;
    _max: SchoolMaxAggregateOutputType | null;
};
export type GetSchoolGroupByPayload<T extends SchoolGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SchoolGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SchoolGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SchoolGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SchoolGroupByOutputType[P]>;
}>>;
export type SchoolWhereInput = {
    AND?: Prisma.SchoolWhereInput | Prisma.SchoolWhereInput[];
    OR?: Prisma.SchoolWhereInput[];
    NOT?: Prisma.SchoolWhereInput | Prisma.SchoolWhereInput[];
    id?: Prisma.StringFilter<"School"> | string;
    name?: Prisma.StringFilter<"School"> | string;
    code?: Prisma.StringFilter<"School"> | string;
    createdAt?: Prisma.DateTimeFilter<"School"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"School"> | Date | string;
    users?: Prisma.UserListRelationFilter;
    students?: Prisma.StudentListRelationFilter;
    pendingStudents?: Prisma.PendingStudentListRelationFilter;
};
export type SchoolOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    users?: Prisma.UserOrderByRelationAggregateInput;
    students?: Prisma.StudentOrderByRelationAggregateInput;
    pendingStudents?: Prisma.PendingStudentOrderByRelationAggregateInput;
};
export type SchoolWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.SchoolWhereInput | Prisma.SchoolWhereInput[];
    OR?: Prisma.SchoolWhereInput[];
    NOT?: Prisma.SchoolWhereInput | Prisma.SchoolWhereInput[];
    name?: Prisma.StringFilter<"School"> | string;
    createdAt?: Prisma.DateTimeFilter<"School"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"School"> | Date | string;
    users?: Prisma.UserListRelationFilter;
    students?: Prisma.StudentListRelationFilter;
    pendingStudents?: Prisma.PendingStudentListRelationFilter;
}, "id" | "code">;
export type SchoolOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SchoolCountOrderByAggregateInput;
    _max?: Prisma.SchoolMaxOrderByAggregateInput;
    _min?: Prisma.SchoolMinOrderByAggregateInput;
};
export type SchoolScalarWhereWithAggregatesInput = {
    AND?: Prisma.SchoolScalarWhereWithAggregatesInput | Prisma.SchoolScalarWhereWithAggregatesInput[];
    OR?: Prisma.SchoolScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SchoolScalarWhereWithAggregatesInput | Prisma.SchoolScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"School"> | string;
    name?: Prisma.StringWithAggregatesFilter<"School"> | string;
    code?: Prisma.StringWithAggregatesFilter<"School"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"School"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"School"> | Date | string;
};
export type SchoolCreateInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutSchoolInput;
    students?: Prisma.StudentCreateNestedManyWithoutSchoolInput;
    pendingStudents?: Prisma.PendingStudentCreateNestedManyWithoutSchoolInput;
};
export type SchoolUncheckedCreateInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutSchoolInput;
    students?: Prisma.StudentUncheckedCreateNestedManyWithoutSchoolInput;
    pendingStudents?: Prisma.PendingStudentUncheckedCreateNestedManyWithoutSchoolInput;
};
export type SchoolUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutSchoolNestedInput;
    students?: Prisma.StudentUpdateManyWithoutSchoolNestedInput;
    pendingStudents?: Prisma.PendingStudentUpdateManyWithoutSchoolNestedInput;
};
export type SchoolUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutSchoolNestedInput;
    students?: Prisma.StudentUncheckedUpdateManyWithoutSchoolNestedInput;
    pendingStudents?: Prisma.PendingStudentUncheckedUpdateManyWithoutSchoolNestedInput;
};
export type SchoolCreateManyInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SchoolUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SchoolUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SchoolCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SchoolMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SchoolMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SchoolScalarRelationFilter = {
    is?: Prisma.SchoolWhereInput;
    isNot?: Prisma.SchoolWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type SchoolCreateNestedOneWithoutPendingStudentsInput = {
    create?: Prisma.XOR<Prisma.SchoolCreateWithoutPendingStudentsInput, Prisma.SchoolUncheckedCreateWithoutPendingStudentsInput>;
    connectOrCreate?: Prisma.SchoolCreateOrConnectWithoutPendingStudentsInput;
    connect?: Prisma.SchoolWhereUniqueInput;
};
export type SchoolUpdateOneRequiredWithoutPendingStudentsNestedInput = {
    create?: Prisma.XOR<Prisma.SchoolCreateWithoutPendingStudentsInput, Prisma.SchoolUncheckedCreateWithoutPendingStudentsInput>;
    connectOrCreate?: Prisma.SchoolCreateOrConnectWithoutPendingStudentsInput;
    upsert?: Prisma.SchoolUpsertWithoutPendingStudentsInput;
    connect?: Prisma.SchoolWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SchoolUpdateToOneWithWhereWithoutPendingStudentsInput, Prisma.SchoolUpdateWithoutPendingStudentsInput>, Prisma.SchoolUncheckedUpdateWithoutPendingStudentsInput>;
};
export type SchoolCreateNestedOneWithoutStudentsInput = {
    create?: Prisma.XOR<Prisma.SchoolCreateWithoutStudentsInput, Prisma.SchoolUncheckedCreateWithoutStudentsInput>;
    connectOrCreate?: Prisma.SchoolCreateOrConnectWithoutStudentsInput;
    connect?: Prisma.SchoolWhereUniqueInput;
};
export type SchoolUpdateOneRequiredWithoutStudentsNestedInput = {
    create?: Prisma.XOR<Prisma.SchoolCreateWithoutStudentsInput, Prisma.SchoolUncheckedCreateWithoutStudentsInput>;
    connectOrCreate?: Prisma.SchoolCreateOrConnectWithoutStudentsInput;
    upsert?: Prisma.SchoolUpsertWithoutStudentsInput;
    connect?: Prisma.SchoolWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SchoolUpdateToOneWithWhereWithoutStudentsInput, Prisma.SchoolUpdateWithoutStudentsInput>, Prisma.SchoolUncheckedUpdateWithoutStudentsInput>;
};
export type SchoolCreateNestedOneWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.SchoolCreateWithoutUsersInput, Prisma.SchoolUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.SchoolCreateOrConnectWithoutUsersInput;
    connect?: Prisma.SchoolWhereUniqueInput;
};
export type SchoolUpdateOneRequiredWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.SchoolCreateWithoutUsersInput, Prisma.SchoolUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.SchoolCreateOrConnectWithoutUsersInput;
    upsert?: Prisma.SchoolUpsertWithoutUsersInput;
    connect?: Prisma.SchoolWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SchoolUpdateToOneWithWhereWithoutUsersInput, Prisma.SchoolUpdateWithoutUsersInput>, Prisma.SchoolUncheckedUpdateWithoutUsersInput>;
};
export type SchoolCreateWithoutPendingStudentsInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutSchoolInput;
    students?: Prisma.StudentCreateNestedManyWithoutSchoolInput;
};
export type SchoolUncheckedCreateWithoutPendingStudentsInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutSchoolInput;
    students?: Prisma.StudentUncheckedCreateNestedManyWithoutSchoolInput;
};
export type SchoolCreateOrConnectWithoutPendingStudentsInput = {
    where: Prisma.SchoolWhereUniqueInput;
    create: Prisma.XOR<Prisma.SchoolCreateWithoutPendingStudentsInput, Prisma.SchoolUncheckedCreateWithoutPendingStudentsInput>;
};
export type SchoolUpsertWithoutPendingStudentsInput = {
    update: Prisma.XOR<Prisma.SchoolUpdateWithoutPendingStudentsInput, Prisma.SchoolUncheckedUpdateWithoutPendingStudentsInput>;
    create: Prisma.XOR<Prisma.SchoolCreateWithoutPendingStudentsInput, Prisma.SchoolUncheckedCreateWithoutPendingStudentsInput>;
    where?: Prisma.SchoolWhereInput;
};
export type SchoolUpdateToOneWithWhereWithoutPendingStudentsInput = {
    where?: Prisma.SchoolWhereInput;
    data: Prisma.XOR<Prisma.SchoolUpdateWithoutPendingStudentsInput, Prisma.SchoolUncheckedUpdateWithoutPendingStudentsInput>;
};
export type SchoolUpdateWithoutPendingStudentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutSchoolNestedInput;
    students?: Prisma.StudentUpdateManyWithoutSchoolNestedInput;
};
export type SchoolUncheckedUpdateWithoutPendingStudentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutSchoolNestedInput;
    students?: Prisma.StudentUncheckedUpdateManyWithoutSchoolNestedInput;
};
export type SchoolCreateWithoutStudentsInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutSchoolInput;
    pendingStudents?: Prisma.PendingStudentCreateNestedManyWithoutSchoolInput;
};
export type SchoolUncheckedCreateWithoutStudentsInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutSchoolInput;
    pendingStudents?: Prisma.PendingStudentUncheckedCreateNestedManyWithoutSchoolInput;
};
export type SchoolCreateOrConnectWithoutStudentsInput = {
    where: Prisma.SchoolWhereUniqueInput;
    create: Prisma.XOR<Prisma.SchoolCreateWithoutStudentsInput, Prisma.SchoolUncheckedCreateWithoutStudentsInput>;
};
export type SchoolUpsertWithoutStudentsInput = {
    update: Prisma.XOR<Prisma.SchoolUpdateWithoutStudentsInput, Prisma.SchoolUncheckedUpdateWithoutStudentsInput>;
    create: Prisma.XOR<Prisma.SchoolCreateWithoutStudentsInput, Prisma.SchoolUncheckedCreateWithoutStudentsInput>;
    where?: Prisma.SchoolWhereInput;
};
export type SchoolUpdateToOneWithWhereWithoutStudentsInput = {
    where?: Prisma.SchoolWhereInput;
    data: Prisma.XOR<Prisma.SchoolUpdateWithoutStudentsInput, Prisma.SchoolUncheckedUpdateWithoutStudentsInput>;
};
export type SchoolUpdateWithoutStudentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutSchoolNestedInput;
    pendingStudents?: Prisma.PendingStudentUpdateManyWithoutSchoolNestedInput;
};
export type SchoolUncheckedUpdateWithoutStudentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutSchoolNestedInput;
    pendingStudents?: Prisma.PendingStudentUncheckedUpdateManyWithoutSchoolNestedInput;
};
export type SchoolCreateWithoutUsersInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    students?: Prisma.StudentCreateNestedManyWithoutSchoolInput;
    pendingStudents?: Prisma.PendingStudentCreateNestedManyWithoutSchoolInput;
};
export type SchoolUncheckedCreateWithoutUsersInput = {
    id?: string;
    name: string;
    code: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    students?: Prisma.StudentUncheckedCreateNestedManyWithoutSchoolInput;
    pendingStudents?: Prisma.PendingStudentUncheckedCreateNestedManyWithoutSchoolInput;
};
export type SchoolCreateOrConnectWithoutUsersInput = {
    where: Prisma.SchoolWhereUniqueInput;
    create: Prisma.XOR<Prisma.SchoolCreateWithoutUsersInput, Prisma.SchoolUncheckedCreateWithoutUsersInput>;
};
export type SchoolUpsertWithoutUsersInput = {
    update: Prisma.XOR<Prisma.SchoolUpdateWithoutUsersInput, Prisma.SchoolUncheckedUpdateWithoutUsersInput>;
    create: Prisma.XOR<Prisma.SchoolCreateWithoutUsersInput, Prisma.SchoolUncheckedCreateWithoutUsersInput>;
    where?: Prisma.SchoolWhereInput;
};
export type SchoolUpdateToOneWithWhereWithoutUsersInput = {
    where?: Prisma.SchoolWhereInput;
    data: Prisma.XOR<Prisma.SchoolUpdateWithoutUsersInput, Prisma.SchoolUncheckedUpdateWithoutUsersInput>;
};
export type SchoolUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    students?: Prisma.StudentUpdateManyWithoutSchoolNestedInput;
    pendingStudents?: Prisma.PendingStudentUpdateManyWithoutSchoolNestedInput;
};
export type SchoolUncheckedUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    students?: Prisma.StudentUncheckedUpdateManyWithoutSchoolNestedInput;
    pendingStudents?: Prisma.PendingStudentUncheckedUpdateManyWithoutSchoolNestedInput;
};
export type SchoolCountOutputType = {
    users: number;
    students: number;
    pendingStudents: number;
};
export type SchoolCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | SchoolCountOutputTypeCountUsersArgs;
    students?: boolean | SchoolCountOutputTypeCountStudentsArgs;
    pendingStudents?: boolean | SchoolCountOutputTypeCountPendingStudentsArgs;
};
export type SchoolCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolCountOutputTypeSelect<ExtArgs> | null;
};
export type SchoolCountOutputTypeCountUsersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
};
export type SchoolCountOutputTypeCountStudentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StudentWhereInput;
};
export type SchoolCountOutputTypeCountPendingStudentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PendingStudentWhereInput;
};
export type SchoolSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    code?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    users?: boolean | Prisma.School$usersArgs<ExtArgs>;
    students?: boolean | Prisma.School$studentsArgs<ExtArgs>;
    pendingStudents?: boolean | Prisma.School$pendingStudentsArgs<ExtArgs>;
    _count?: boolean | Prisma.SchoolCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["school"]>;
export type SchoolSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    code?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["school"]>;
export type SchoolSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    code?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["school"]>;
export type SchoolSelectScalar = {
    id?: boolean;
    name?: boolean;
    code?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type SchoolOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "code" | "createdAt" | "updatedAt", ExtArgs["result"]["school"]>;
export type SchoolInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.School$usersArgs<ExtArgs>;
    students?: boolean | Prisma.School$studentsArgs<ExtArgs>;
    pendingStudents?: boolean | Prisma.School$pendingStudentsArgs<ExtArgs>;
    _count?: boolean | Prisma.SchoolCountOutputTypeDefaultArgs<ExtArgs>;
};
export type SchoolIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type SchoolIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $SchoolPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "School";
    objects: {
        users: Prisma.$UserPayload<ExtArgs>[];
        students: Prisma.$StudentPayload<ExtArgs>[];
        pendingStudents: Prisma.$PendingStudentPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["school"]>;
    composites: {};
};
export type SchoolGetPayload<S extends boolean | null | undefined | SchoolDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SchoolPayload, S>;
export type SchoolCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SchoolFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SchoolCountAggregateInputType | true;
};
export interface SchoolDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['School'];
        meta: {
            name: 'School';
        };
    };
    findUnique<T extends SchoolFindUniqueArgs>(args: Prisma.SelectSubset<T, SchoolFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SchoolFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SchoolFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SchoolFindFirstArgs>(args?: Prisma.SelectSubset<T, SchoolFindFirstArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SchoolFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SchoolFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SchoolFindManyArgs>(args?: Prisma.SelectSubset<T, SchoolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SchoolCreateArgs>(args: Prisma.SelectSubset<T, SchoolCreateArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SchoolCreateManyArgs>(args?: Prisma.SelectSubset<T, SchoolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SchoolCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SchoolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SchoolDeleteArgs>(args: Prisma.SelectSubset<T, SchoolDeleteArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SchoolUpdateArgs>(args: Prisma.SelectSubset<T, SchoolUpdateArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SchoolDeleteManyArgs>(args?: Prisma.SelectSubset<T, SchoolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SchoolUpdateManyArgs>(args: Prisma.SelectSubset<T, SchoolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SchoolUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SchoolUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SchoolUpsertArgs>(args: Prisma.SelectSubset<T, SchoolUpsertArgs<ExtArgs>>): Prisma.Prisma__SchoolClient<runtime.Types.Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SchoolCountArgs>(args?: Prisma.Subset<T, SchoolCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SchoolCountAggregateOutputType> : number>;
    aggregate<T extends SchoolAggregateArgs>(args: Prisma.Subset<T, SchoolAggregateArgs>): Prisma.PrismaPromise<GetSchoolAggregateType<T>>;
    groupBy<T extends SchoolGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SchoolGroupByArgs['orderBy'];
    } : {
        orderBy?: SchoolGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SchoolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSchoolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SchoolFieldRefs;
}
export interface Prisma__SchoolClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    users<T extends Prisma.School$usersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.School$usersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    students<T extends Prisma.School$studentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.School$studentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    pendingStudents<T extends Prisma.School$pendingStudentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.School$pendingStudentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PendingStudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SchoolFieldRefs {
    readonly id: Prisma.FieldRef<"School", 'String'>;
    readonly name: Prisma.FieldRef<"School", 'String'>;
    readonly code: Prisma.FieldRef<"School", 'String'>;
    readonly createdAt: Prisma.FieldRef<"School", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"School", 'DateTime'>;
}
export type SchoolFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    where: Prisma.SchoolWhereUniqueInput;
};
export type SchoolFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    where: Prisma.SchoolWhereUniqueInput;
};
export type SchoolFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    where?: Prisma.SchoolWhereInput;
    orderBy?: Prisma.SchoolOrderByWithRelationInput | Prisma.SchoolOrderByWithRelationInput[];
    cursor?: Prisma.SchoolWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SchoolScalarFieldEnum | Prisma.SchoolScalarFieldEnum[];
};
export type SchoolFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    where?: Prisma.SchoolWhereInput;
    orderBy?: Prisma.SchoolOrderByWithRelationInput | Prisma.SchoolOrderByWithRelationInput[];
    cursor?: Prisma.SchoolWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SchoolScalarFieldEnum | Prisma.SchoolScalarFieldEnum[];
};
export type SchoolFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    where?: Prisma.SchoolWhereInput;
    orderBy?: Prisma.SchoolOrderByWithRelationInput | Prisma.SchoolOrderByWithRelationInput[];
    cursor?: Prisma.SchoolWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SchoolScalarFieldEnum | Prisma.SchoolScalarFieldEnum[];
};
export type SchoolCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SchoolCreateInput, Prisma.SchoolUncheckedCreateInput>;
};
export type SchoolCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SchoolCreateManyInput | Prisma.SchoolCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SchoolCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    data: Prisma.SchoolCreateManyInput | Prisma.SchoolCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SchoolUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SchoolUpdateInput, Prisma.SchoolUncheckedUpdateInput>;
    where: Prisma.SchoolWhereUniqueInput;
};
export type SchoolUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SchoolUpdateManyMutationInput, Prisma.SchoolUncheckedUpdateManyInput>;
    where?: Prisma.SchoolWhereInput;
    limit?: number;
};
export type SchoolUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SchoolUpdateManyMutationInput, Prisma.SchoolUncheckedUpdateManyInput>;
    where?: Prisma.SchoolWhereInput;
    limit?: number;
};
export type SchoolUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    where: Prisma.SchoolWhereUniqueInput;
    create: Prisma.XOR<Prisma.SchoolCreateInput, Prisma.SchoolUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SchoolUpdateInput, Prisma.SchoolUncheckedUpdateInput>;
};
export type SchoolDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
    where: Prisma.SchoolWhereUniqueInput;
};
export type SchoolDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SchoolWhereInput;
    limit?: number;
};
export type School$usersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type School$studentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type School$pendingStudentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type SchoolDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SchoolSelect<ExtArgs> | null;
    omit?: Prisma.SchoolOmit<ExtArgs> | null;
    include?: Prisma.SchoolInclude<ExtArgs> | null;
};
