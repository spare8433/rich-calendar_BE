import { FREQUENCY } from "@/constant";
import { prisma } from "@/lib/prisma-client";
import bcrypt from "bcrypt";
import dayjs from "dayjs";

async function main() {
  const testUser = await prisma.user.upsert({
    where: { email: "thdqudcks2@gmail.com" },
    update: {},
    create: {
      email: "thdqudcks2@gmail.com",
      username: "test1004",
      password: bcrypt.hashSync("Test1004123!", 10),
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

  const endDate = "2025-01-13T00:00:00.000Z";
  const repeatFrequency = "weekly";
  const repeatInterval = 1;
  const repeatEndCount = 5;
  const repeatEndDate = dayjs(endDate)
    .add(repeatInterval * repeatEndCount, FREQUENCY[repeatFrequency])
    .toISOString();

  await prisma.schedule.create({
    data: {
      title: "Weekly Standup",
      description: "09:00",
      importance: "veryHigh",
      color: "green",
      startDate: "2025-01-11T00:00:00.000Z",
      endDate,
      isRepeat: true,
      repeatFrequency,
      repeatInterval,
      repeatEndCount,
      repeatEndDate,
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
