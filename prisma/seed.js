"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Create demo users
    const passwordHash = await bcrypt_1.default.hash('password123', 10);
    const user1 = await prisma.user.upsert({
        where: { email: 'demo@calvin.edu' },
        update: {},
        create: {
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@calvin.edu',
            passwordHash,
            phone: '+1 (555) 123-4567',
        },
    });
    const user2 = await prisma.user.upsert({
        where: { email: 'alice@calvin.edu' },
        update: {},
        create: {
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@calvin.edu',
            passwordHash,
        },
    });
    // Create demo communities
    const rvd = await prisma.community.upsert({
        where: { id: 1 },
        update: {},
        create: {
            communityName: 'RVD',
            description: 'Rodenhouse–Van Dellen community hall',
        },
    });
    const bht = await prisma.community.upsert({
        where: { id: 2 },
        update: {},
        create: {
            communityName: 'BHT',
            description: 'Bolt–Heyns–TerAvest community hall',
        },
    });
    const se = await prisma.community.upsert({
        where: { id: 3 },
        update: {},
        create: {
            communityName: 'SE',
            description: 'Schultze–Eldersveld community hall',
        },
    });
    const bv = await prisma.community.upsert({
        where: { id: 4 },
        update: {},
        create: {
            communityName: 'BV',
            description: 'Boer-Vanderweide community hall',
        },
    });
    const ke = await prisma.community.upsert({
        where: { id: 5 },
        update: {},
        create: {
            communityName: 'KE',
            description: 'Kalsbeek-Eldersveld community hall',
        },
    });
    // Create memberships
    await prisma.membership.upsert({
        where: { userId_communityId: { userId: user1.id, communityId: rvd.id } },
        update: {},
        create: {
            userId: user1.id,
            communityId: rvd.id,
            role: 'admin',
        },
    });
    await prisma.membership.upsert({
        where: { userId_communityId: { userId: user2.id, communityId: bht.id } },
        update: {},
        create: {
            userId: user2.id,
            communityId: bht.id,
            role: 'member',
        },
    });
    // Create demo posts
    await prisma.post.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: 'Where is the lounge located?',
            content: 'I am new to RVD and cannot find the community lounge. Can someone help?',
            type: 'question',
            authorId: user1.id,
            communityId: rvd.id,
        },
    });
    await prisma.post.upsert({
        where: { id: 2 },
        update: {},
        create: {
            title: 'Best study spots in BHT',
            content: 'Looking for recommendations for quiet study areas.',
            type: 'question',
            authorId: user2.id,
            communityId: bht.id,
        },
    });
    await prisma.post.upsert({
        where: { id: 3 },
        update: {},
        create: {
            title: 'Laundry tips for first-years',
            content: 'Here are some helpful tips for using the laundry facilities efficiently...',
            type: 'advice',
            authorId: user2.id,
            communityId: se.id,
        },
    });
    // Create demo replies
    await prisma.reply.create({
        data: {
            content: 'The lounge is on the second floor, next to the kitchen!',
            authorId: user2.id,
            postId: 1,
        },
    });
    console.log('Seed data created successfully!');
    console.log({ user1, user2, rvd, bht, se });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
