import { prisma } from "@/lib/prisma-client";
import bcrypt from "bcrypt";

async function main() {
  const testUser = await prisma.user.upsert({
    where: { email: "thdqudcks2@gmail.com" },
    update: {},
    create: {
      email: "thdqudcks2@gmail.com",
      username: "test1004",
      password: bcrypt.hashSync("test1004123!", 10),
    },
  });

  await prisma.tag.createMany({
    data: [
      { title: "일상", userId: testUser.id },
      { title: "취미", userId: testUser.id },
      { title: "약속", userId: testUser.id },
      { title: "회사", userId: testUser.id },
    ],
  });

  await prisma.schedule.create({
    data: {
      title: "Weekly Standup",
      description: "09:00",
      importance: "veryHigh",
      color: "green",
      startDate: "2025-01-11T00:00:00Z",
      endDate: "2025-01-13T00:00:00Z",
      isRepeat: true,
      repeatFrequency: "weekly",
      repeatInterval: 3,
      repeatEndCount: 5,
      userId: testUser.id, // 사용자 연결
      tags: {
        connectOrCreate: {
          create: {
            title: "일상",
            userId: testUser.id,
          },
          where: {
            title: "일상",
          },
        },
      },
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
