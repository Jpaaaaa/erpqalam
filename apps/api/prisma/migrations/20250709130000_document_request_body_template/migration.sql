-- AlterTable
ALTER TABLE "DocumentRequestSettings" ADD COLUMN "bodyTemplate" TEXT NOT NULL DEFAULT 'نظراً للقبول الطالب/ة {{studentName}} في معهدنا ({{instituteName}}) للعام الدراسي {{academicYear}} يرجى تزويدنا بالوثيقة لآخر المرحلة الدراسية .';
