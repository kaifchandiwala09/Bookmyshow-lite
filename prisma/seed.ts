import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database started...");

    const roles = ["customer", "organizer", "admin"];
    const createdRoles: Record<string, number> = {};

    for (const roleName of roles) {
        const role = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
        createdRoles[roleName] = role.id;
        console.log(`  ✓ Role: ${role.name} (ID: ${role.id})`);
    }

    const cities = [
        { name: "Mumbai", state: "Maharashtra" },
        { name: "Delhi-NCR", state: "Delhi" },
        { name: "Bengaluru", state: "Karnataka" },
        { name: "Hyderabad", state: "Telangana" },
    ];

    for (const city of cities) {
        await prisma.city.upsert({
            where: { name: city.name },
            update: { state: city.state },
            create: city,
        });
        console.log(`  ✓ City: ${city.name}`);
    }

    const adminRoleId = createdRoles["admin"];
    const adminEmail = "admin@bookmyshow.com";
    const dummyPasswordHash = "$2b$10$epRswTQs3CLcHyGExgk88.rFj2t8X3kU0K1sP.zHnK5y7kU123456";

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            fullName: "System Admin",
            username: "admin",
            passwordHash: dummyPasswordHash,
            roleId: adminRoleId,
            isVerified: true,
        },
    });

    console.log(`  ✓ Demo Admin: ${adminUser.email} (${adminUser.username})`);
    console.log("✅ Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
